import Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, ICreateChatCompletion } from "@empiricalrun/types";
import OpenAI from "openai";
import promiseRetry from "promise-retry";
import { BatchTaskManager, getPassthroughParams } from "../../utils";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";

const batchTaskManager = new BatchTaskManager(5);

const finishReasonReverseMap = new Map<
  "end_turn" | "max_tokens" | "stop_sequence" | null,
  "length" | "stop" | "tool_calls" | "content_filter" | "function_call"
>([
  ["end_turn", "stop"],
  ["max_tokens", "length"],
  ["stop_sequence", "stop"],
  [null, "stop"],
]);

const canonicalModelName = (modelName: string) => {
  const canonicalNames: { [key: string]: string } = {
    "claude-3-haiku": "claude-3-haiku-20240307",
    "claude-3-sonnet": "claude-3-sonnet-20240229",
    "claude-3-opus": "claude-3-opus-20240229",
  };
  return canonicalNames[modelName] || modelName;
};

const convertOpenAIToAnthropicAI = function (
  messages: OpenAI.ChatCompletionMessageParam[],
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
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.ANTHROPIC_API_KEY is not set",
    );
  }
  const { model, messages, ...config } = body;
  const timeout = config.timeout || DEFAULT_TIMEOUT;
  if (config.timeout) {
    delete config.timeout;
  }
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: timeout,
  });
  const { contents, systemPrompt } = convertOpenAIToAnthropicAI(messages);
  const { executionDone } = await batchTaskManager.waitForTurn();
  try {
    const startedAt = Date.now();
    const response = await promiseRetry<Anthropic.Messages.Message>(
      (retry) => {
        return anthropic.messages
          .create({
            model: canonicalModelName(model),
            messages: contents,
            system: systemPrompt,
            max_tokens: config.max_tokens || 1024,
            temperature: config.temperature || undefined,
            stop_sequences: Array.isArray(config.stop)
              ? config.stop
              : config.stop
                ? [config.stop]
                : undefined,
            top_p: config.top_p || undefined,
            ...getPassthroughParams(config),
          })
          .catch((err) => {
            if (
              err instanceof Anthropic.RateLimitError ||
              err instanceof Anthropic.APIConnectionError ||
              err instanceof Anthropic.APIConnectionTimeoutError ||
              err instanceof Anthropic.InternalServerError
            ) {
              retry(err);
              throw err;
            }
            throw err;
          });
      },
      {
        randomize: true,
        minTimeout: 1000,
      },
    );
    executionDone();
    const latency = Date.now() - startedAt;
    // renaming to terms used by openai, mistral
    const { input_tokens: prompt_tokens, output_tokens: completion_tokens } =
      response.usage;
    return {
      id: response.id,
      model,
      object: "chat.completion",
      created: Date.now() / 1000,
      usage: {
        total_tokens: prompt_tokens + completion_tokens,
        completion_tokens,
        prompt_tokens,
      },
      choices: [
        {
          finish_reason:
            finishReasonReverseMap.get(response.stop_reason) || "stop",
          index: 0,
          message: {
            content: response.content[0]?.text || null,
            role: response.role,
          },
          logprobs: null,
        },
      ],
      latency,
    };
  } catch (e) {
    executionDone();
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed to fetch output from model ${body.model}: ${(e as Error).message}`,
    );
  }
};

export const AnthropicAIProvider: IAIProvider = {
  name: "anthropic",
  chat: createChatCompletion,
};
