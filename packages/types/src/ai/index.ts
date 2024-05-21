import OpenAI from "openai";

export interface IChatCompletionCreateParams
  extends OpenAI.ChatCompletionCreateParamsNonStreaming {
  // For passthrough parameters
  [key: string]: any;
}

export interface IChatCompletion extends OpenAI.ChatCompletion {
  latency?: number;
}

export interface ICreateChatCompletion {
  (body: IChatCompletionCreateParams): Promise<IChatCompletion>;
}

export interface ChatCompletionMessageToolCall
  extends OpenAI.ChatCompletionMessageToolCall {}

export interface Citation {
  file_id?: string;
  quote?: string;
  text: string;
}

export interface IAssistantRunResponse {
  content: string;
  citations: Citation[];
  tool_calls?: ChatCompletionMessageToolCall[];
  usage?: OpenAI.CompletionUsage;
  latency?: number;
}

export type ToolCall = OpenAI.Beta.AssistantTool;
export type FunctionToolCall = OpenAI.Beta.FunctionTool;
export type ChatCompletionToolChoice = OpenAI.ChatCompletionToolChoiceOption;

export interface ICreateAndRunAssistantThread {
  (
    body: OpenAI.Beta.ThreadCreateAndRunParamsNonStreaming,
  ): Promise<IAssistantRunResponse>;
}

export interface IAssistantRetrieve {
  (assistant_id: string): Promise<OpenAI.Beta.Assistant>;
}

export interface IAssistant {
  run: ICreateAndRunAssistantThread;
  retrieve: IAssistantRetrieve;
}

export interface ThreadMessage
  extends OpenAI.Beta.Threads.ThreadCreateParams.Message {}

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
  assistant?: IAssistant;
}

export interface ICustomAI extends AI {
  endpoint: string;
  headers: {};
  params: {};
  transform: "openai" | "google" | "anthropic";
}
