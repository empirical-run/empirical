import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { Batch } from "../../utils/batch";
import { ToolCalls } from "@mistralai/mistralai";

type MistralChatMessage = {
  role: string;
  name?: string;
  content: string | string[];
  tool_calls?: ToolCalls[];
};

const batch = new Batch(5, 1000);

const importMistral = async function () {
  const { default: MistralClient } = await import("@mistralai/mistralai");
  return MistralClient;
};

const createChatCompletion: ICreateChatCompletion = async function (body) {
  const MistralClient = await importMistral();
  const mistralai = new MistralClient(process.env.MISTRAL_API_KEY);
  const { executionDone } = await batch.waitForTurn();
  const { model, messages } = body;
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
};

export const MistralAIProvider: IAIProvider = {
  name: "mistral",
  chat: createChatCompletion,
};
