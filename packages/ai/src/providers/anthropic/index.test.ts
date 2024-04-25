import { test, describe, beforeEach, vi, expect, MockInstance } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import { AnthropicAIProvider } from ".";
import { IChatCompletionCreateParams } from "@empiricalrun/types";

describe("Anthropic provider tests: chat prompt", () => {
  let messagesSpy: MockInstance;
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "1234";
    const response: Message = {
      id: "123",
      stop_reason: "end_turn",
      stop_sequence: "",
      type: "message",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
      model: "claude-3-haiku",
      content: [
        {
          text: "Blue",
          type: "text",
        },
      ],
      role: "assistant",
    };
    messagesSpy = vi
      .spyOn(Anthropic.Messages.prototype, "create")
      .mockResolvedValue(response);
  });
  test("system prompt should be sent separately", async () => {
    const request: IChatCompletionCreateParams = {
      model: "claude-3-haiku",
      messages: [
        {
          role: "system",
          content: "Hey! you are a helpful assistant",
        },
        {
          role: "user",
          content: "Suggest me a color",
        },
      ],
    };
    await AnthropicAIProvider.chat(request);
    expect(messagesSpy).toBeCalled();
    expect(messagesSpy).toHaveBeenCalledWith({
      model: "claude-3-haiku-20240307",
      system: request.messages[0]?.content,
      messages: [request.messages[1]],
      max_tokens: 1024,
      stop_sequences: undefined,
      temperature: undefined,
      top_p: undefined,
    });
  });
});
