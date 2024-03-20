import {
  AI,
  IChat,
  IModel,
  IChatCompletions,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { chatProvider } from "./providers";
import { OpenAIProvider } from "./providers/openai";
export * from "./utils";

class ChatCompletions implements IChatCompletions {
  constructor(private provider: string) {}
  create: ICreateChatCompletion = async (body) => {
    const provider = chatProvider.get(this.provider);
    if (!provider) {
      throw Error(`ai provider not available:: ${this.provider}`);
    }
    const completion = await provider(body);
    return completion;
  };
}

class Chat implements IChat {
  completions;
  constructor(private provider: string) {
    this.completions = new ChatCompletions(this.provider);
  }
}

class Models {
  constructor() {}
  // get the list of supported models by empiricalrun
  list(): IModel[] {
    return [];
  }
}

export class EmpiricalAI implements AI {
  chat;
  models;
  constructor(private provider: string = OpenAIProvider.name) {
    this.chat = new Chat(this.provider);
    this.models = new Models();
  }
}
