import {
  AI,
  IChat,
  IModel,
  IChatCompletions,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import { chatProvider } from "./providers";
import { OpenAIProvider } from "./providers/openai";
import { AIError, AIErrorEnum } from "./error";
export * from "./utils";
export * from "./error";

class ChatCompletions implements IChatCompletions {
  constructor(private provider: string) {}
  create: ICreateChatCompletion = async (body, passthroughConfig) => {
    const provider = chatProvider.get(this.provider);
    if (!provider) {
      throw new AIError(
        AIErrorEnum.INCORRECT_PARAMETERS,
        ` ${this.provider} ai provider is not supported`,
      );
    }
    try {
      const completion = await provider(body, passthroughConfig);
      return completion;
    } catch (err) {
      if (err instanceof AIError) {
        throw err;
      } else {
        const message = `Failed chat completion for ${this.provider} provider ${body.model} model`;
        throw new AIError(AIErrorEnum.UNKNOWN, message);
      }
    }
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
