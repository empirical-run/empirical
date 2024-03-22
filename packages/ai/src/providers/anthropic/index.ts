import Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, ICreateChatCompletion } from "@empiricalrun/types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const convertOpenAIToAnthropicAI = function (
  messages: ChatCompletionMessageParam[],
): { contents: Anthropic.MessageParam[]; systemPrompt: string } {
  const [systemMessage] = messages.filter((m) => m.role === "system");
  const filteredMessages = messages.filter((m) => m.role !== "system");
  const contents = filteredMessages.map((m) => {
    let role = m.role === "assistant" ? "assistant" : "user";
    let content = "";

    // TODO: right now only supporting text formats
    if (typeof m.content === "string") {
      content = m.content;
    }
    return {
      role,
      content,
    };
  });
  // @ts-ignore - role enums
  return { contents, systemPrompt: systemMessage?.content?.toString() || "" };
};

// @ts-ignore finish_reason and stop_reason enums are different
const createChatCompletion: ICreateChatCompletion = async (body) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 5,
  });
  const { model, messages, max_tokens } = body;
  const { contents, systemPrompt } = convertOpenAIToAnthropicAI(messages);
  const response = await anthropic.messages.create({
    max_tokens: max_tokens || 1024,
    model,
    messages: contents,
    system: systemPrompt,
  });

  return {
    ...response,
    object: "chat.completion",
    created: Date.now() / 1000,
    choices: [
      {
        finish_reason: "stop",
        index: 0,
        message: { content: response.content[0]?.text, role: response.role },
        logprobs: null,
      },
    ],
  };
};

export const AnthropicAIProvider: IAIProvider = {
  name: "anthropic",
  chat: createChatCompletion,
};
