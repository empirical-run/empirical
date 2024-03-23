import Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, ICreateChatCompletion } from "@empiricalrun/types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const finishReaonReverseMap = new Map<
  "end_turn" | "max_tokens" | "stop_sequence" | null,
  "length" | "stop" | "tool_calls" | "content_filter" | "function_call"
>([
  ["end_turn", "stop"],
  ["max_tokens", "length"],
  ["stop_sequence", "stop"],
  [null, "stop"],
]);

const convertOpenAIToAnthropicAI = function (
  messages: ChatCompletionMessageParam[],
): { contents: Anthropic.MessageParam[]; systemPrompt: string } {
  const [systemMessage] = messages.filter((m) => m.role === "system");
  const filteredMessages = messages.filter((m) => m.role !== "system");
  const contents: Anthropic.MessageParam[] = filteredMessages.map((m) => {
    let role: "user" | "assistant" =
      m.role === "assistant" ? "assistant" : "user";
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
  return { contents, systemPrompt: systemMessage?.content?.toString() || "" };
};

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
    id: response.id,
    model,
    object: "chat.completion",
    created: Date.now() / 1000,
    choices: [
      {
        finish_reason:
          finishReaonReverseMap.get(response.stop_reason) || "stop",
        index: 0,
        message: {
          content: response.content[0]?.text || null,
          role: response.role,
        },
        logprobs: null,
      },
    ],
  };
};

export const AnthropicAIProvider: IAIProvider = {
  name: "anthropic",
  chat: createChatCompletion,
};
