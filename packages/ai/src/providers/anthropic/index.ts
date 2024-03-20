import Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, ICreateChatCompletion } from "@empiricalrun/types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const convertOpenAIToAnthropicAI = function (
  messages: ChatCompletionMessageParam[],
): Anthropic.MessageParam[] {
  const [systemMessage] = messages.filter((m) => m.role === "system");
  let systemMessageContent = "";
  if (systemMessage) {
    systemMessageContent = systemMessage.content as string; // TODO: right now assuming system messages are string
  }
  const filteredMessages = messages.filter((m) => m.role !== "system");
  const contents = filteredMessages.map((m) => {
    let role = m.role === "assistant" ? "assistant" : "user";
    let content = "";

    if (role === "user" && systemMessageContent) {
      content = systemMessageContent;
    }

    // TODO: right now only supporting text formats
    if (typeof m.content === "string") {
      content = m.content;
    }
    return {
      role,
      content,
    };
  });
  // @ts-ignore missing enum for role = 'user' | 'assistant'
  return contents;
};

// @ts-ignore finish_reason enums is different
const createChatCompletion: ICreateChatCompletion = async (body) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 5,
  });
  const { model, messages, max_tokens } = body;
  const response = await anthropic.messages.create({
    max_tokens: max_tokens || 1024,
    model,
    messages: convertOpenAIToAnthropicAI(messages),
  });
  const convertedResponse = {
    id: response.id,
    choices: [
      {
        finish_reason: "stop",
        index: 0,
        message: { content: response.content[0]?.text, role: response.role },
        logprobs: null,
      },
    ],
    object: "chat.completion",
    created: Date.now() / 1000,
    model,
  };
  return convertedResponse;
};

export const AnthropicAIProvider: IAIProvider = {
  name: "anthropic",
  chat: createChatCompletion,
};
