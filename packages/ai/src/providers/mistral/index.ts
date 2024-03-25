import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { BatchTaskManager } from "../../utils";
import { ToolCalls } from "@mistralai/mistralai";
import { AIError, AIErrorEnum } from "../../error";

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
  const mistralai = new MistralClient(process.env.MISTRAL_API_KEY);
  const { executionDone } = await batch.waitForTurn();
  const { model, messages } = body;
  try {
    // typecasting as there is a minor difference in role being openai enum vs string
    const mistralMessages = messages as MistralChatMessage[];
    // no retry needed as mistral internally handles it well
    // TODO: handle API failures from models
    const completions = await mistralai.chat({
      model,
      messages: mistralMessages,
    });
    executionDone();
    // typecasting as the only difference present in mistral interface is the it doesnt contain logprobs.
    // currently its not being used. hence typecasting it for now.
    return completions as IChatCompletion;
  } catch (err) {
    executionDone();
    throw new AIError(
      AIErrorEnum.DEFAULT_FAILED_CHAT_COMPLETION,
      `failed to get completion for model ${body.model} with message ${(err as Error).message}`,
    );
  }
};

export const MistralAIProvider: IAIProvider = {
  name: "mistral",
  chat: createChatCompletion,
};
