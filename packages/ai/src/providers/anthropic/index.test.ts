import {
  test,
  describe,
  beforeEach,
  vi,
  expect,
  MockInstance,
  afterEach,
} from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import { AnthropicAIProvider } from ".";
import { IChatCompletionCreateParams } from "@empiricalrun/types";

describe("Anthropic provider tests: chat prompt", () => {
  let messagesSpy: MockInstance;
  const originalAPIKey = process.env.ANTHROPIC_API_KEY;

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
      .spyOn(Anthropic.Beta.Tools.Messages.prototype, "create")
      .mockResolvedValue(response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.ANTHROPIC_API_KEY = originalAPIKey;
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

describe("Anthropic tool call tests", () => {
  test("handle tool call", async () => {
    const resp = await AnthropicAIProvider.chat({
      model: "claude-3-haiku",
      messages: [
        {
          role: "user",
          content:
            "Extract the name from message: Hi my name is John Doe. I'm 26 years old and I work in real estate.",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_data",
            description: "extract user name from message",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "the name of the person, e.g. Alexa",
                },
              },
              required: ["name"],
            },
          },
        },
      ],
    });
    expect(resp.choices[0]?.message.tool_calls?.[0]?.function.name).toBe(
      "extract_data",
    );
    expect(
      resp.choices[0]?.message.tool_calls?.[0]?.function.arguments,
    ).contains('"John Doe"');
  }, 20000);
});
