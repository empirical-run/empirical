import { ICreateChatCompletion } from "@empiricalrun/types";
import { OpenAIProvider } from "./openai";
import { MistralAIProvider } from "./mistral";
import { GoogleAIProvider } from "./google";

export const chatProvider = new Map<string, ICreateChatCompletion>([
  [OpenAIProvider.name, OpenAIProvider.chat],
  [MistralAIProvider.name, MistralAIProvider.chat],
  [GoogleAIProvider.name, GoogleAIProvider.chat],
]);
