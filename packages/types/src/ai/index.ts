import OpenAI from "openai";

export interface IChatCompletionCreateParams
  extends OpenAI.ChatCompletionCreateParamsNonStreaming {}

export interface IChatCompletion extends OpenAI.ChatCompletion {}

export interface ICreateChatCompletion {
  (body: IChatCompletionCreateParams): Promise<IChatCompletion>;
}

export interface IChatCompletions {
  create: ICreateChatCompletion;
}

export interface IChat {
  completions: IChatCompletions;
}

export interface IModel extends OpenAI.Models.Model {}

export interface ChatCompletionMessage extends OpenAI.ChatCompletion {}

export interface AI {
  chat: IChat;
  models: {
    list: () => IModel[];
  };
}

export interface IEmpiricalAIError extends Error {
  code: string;
  message: string;
}

export interface IAIProvider {
  name: string;
  chat: ICreateChatCompletion;
}

export interface ICustomAI extends AI {
  endpoint: string;
  headers: {};
  params: {};
  transform: "openai" | "google" | "anthropic";
}
