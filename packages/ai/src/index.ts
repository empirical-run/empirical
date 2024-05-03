import {
  AI,
  IChat,
  IModel,
  IChatCompletions,
  ICreateChatCompletion,
  ICreateAndRunAssistantThread,
  IAssistantRetrieve,
} from "@empiricalrun/types";
import { assistantProvider, chatProvider } from "./providers";
import { OpenAIProvider } from "./providers/openai";
import { AIError, AIErrorEnum } from "./error";
export * from "./utils";
export * from "./error";

class ChatCompletions implements IChatCompletions {
  constructor(private provider: string) {}
  create: ICreateChatCompletion = async (body) => {
    const provider = chatProvider.get(this.provider);
    if (!provider) {
      throw new AIError(
        AIErrorEnum.INCORRECT_PARAMETERS,
        ` ${this.provider} ai provider is not supported`,
      );
    }
    try {
      const completion = await provider(body);
      return completion;
    } catch (err) {
      if (err instanceof AIError) {
        throw err;
      } else {
        const message = `Failed chat completion for ${this.provider} model: ${body.model}`;
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

class Assistant {
  constructor(private provider: string) {}
  runAssistant: ICreateAndRunAssistantThread = async (body) => {
    const provider = assistantProvider.get(this.provider);
    if (!provider) {
      throw new AIError(
        AIErrorEnum.INCORRECT_PARAMETERS,
        ` ${this.provider} ai provider is not supported`,
      );
    }
    try {
      const run = await provider.run(body);
      return run;
    } catch (err) {
      if (err instanceof AIError) {
        throw err;
      } else {
        const message = `Failed assistant run for ${this.provider} assistant: ${body.assistant_id}`;
        throw new AIError(AIErrorEnum.UNKNOWN, message);
      }
    }
  };

  retrieve: IAssistantRetrieve = async (assistant_id: string) => {
    const provider = assistantProvider.get(this.provider);
    if (!provider) {
      throw new AIError(
        AIErrorEnum.INCORRECT_PARAMETERS,
        ` ${this.provider} ai provider is not supported`,
      );
    }
    try {
      const run = await provider.retrieve(assistant_id);
      return run;
    } catch (err) {
      if (err instanceof AIError) {
        throw err;
      } else {
        const message = `Failed retrieve assistant for ${this.provider} assistant: ${assistant_id}`;
        throw new AIError(AIErrorEnum.UNKNOWN, message);
      }
    }
  };
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
  assistant;
  models;
  constructor(private provider: string = OpenAIProvider.name) {
    this.chat = new Chat(this.provider);
    this.assistant = new Assistant(this.provider);
    this.models = new Models();
  }
}
