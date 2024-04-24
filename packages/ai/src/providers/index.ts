import {
  ICreateAndRunAssistantThread,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { OpenAIProvider } from "./openai";
import { MistralAIProvider } from "./mistral";
import { GoogleAIProvider } from "./google";
import { AnthropicAIProvider } from "./anthropic";
import { FireworksAIProvider } from "./fireworks";

export const chatProvider = new Map<string, ICreateChatCompletion>([
  [OpenAIProvider.name, OpenAIProvider.chat],
  [MistralAIProvider.name, MistralAIProvider.chat],
  [GoogleAIProvider.name, GoogleAIProvider.chat],
  [AnthropicAIProvider.name, AnthropicAIProvider.chat],
  [FireworksAIProvider.name, FireworksAIProvider.chat],
]);

export const assistantProvider = new Map<string, ICreateAndRunAssistantThread>([
  [OpenAIProvider.name, OpenAIProvider.assistant!],
]);
