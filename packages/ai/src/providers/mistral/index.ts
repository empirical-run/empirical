import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { BatchTaskManager, getPassthroughParams } from "../../utils";
import { ToolCalls, ResponseFormat } from "@mistralai/mistralai";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";

type MistralChatMessage = {
  role: string;
  name?: string;
  content: string | string[];
  tool_calls?: ToolCalls[];
};

const batch = new BatchTaskManager(5);

const importMistral = async function () {
  const { default: MistralClient } = await import("@mistralai/mistralai");
  return MistralClient;
};

const createChatCompletion: ICreateChatCompletion = async function (body) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.MISTRAL_API_KEY is not set",
    );
  }
  const MistralClient = await importMistral();
  const { model, messages, ...config } = body;
  const mistralai = new MistralClient(
    process.env.MISTRAL_API_KEY,
    "",
    // type issue in https://github.com/mistralai/client-js/blob/e33a2f3e5f6fb88fd083e8e7d9c3c081d1c7c0e4/src/client.js#L51, will submit a PR later
    // @ts-ignore default value for retries
    5,
    (config.timeout || DEFAULT_TIMEOUT) / 1000, // Mistral expects values in seconds
  );
  if (config.timeout) {
    delete config.timeout;
  }
  const { executionDone } = await batch.waitForTurn();
  try {
    // typecasting as there is a minor difference in role being openai enum vs string
    const mistralMessages = messages as MistralChatMessage[];
    const startedAt = Date.now();
    // no retry needed as mistral internally handles it well
    const completions = await mistralai.chat({
      model,
      messages: mistralMessages,
      temperature: config.temperature || undefined,
      maxTokens: config.max_tokens || undefined,
      topP: config.top_p || undefined,
      randomSeed: config.seed || undefined,
      responseFormat: config.response_format as ResponseFormat,
      ...getPassthroughParams(config),
    });
    executionDone();
    const latency = Date.now() - startedAt;
    // typecasting as the only difference present in mistral interface is the it doesnt contain logprobs.
    // currently its not being used. hence typecasting it for now.
    return { ...completions, latency } as IChatCompletion;
  } catch (err) {
    executionDone();
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed chat completion for model ${body.model} with message ${(err as Error).message}`,
    );
  }
};

export const MistralAIProvider: IAIProvider = {
  name: "mistral",
  chat: createChatCompletion,
};
