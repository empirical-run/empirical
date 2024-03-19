import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import OpenAI from "openai";
import promisRetry from "promise-retry";

const createChatCompletion: ICreateChatCompletion = async (body) => {
  const openai = new OpenAI();
  const completions = await promisRetry<IChatCompletion>((retry) => {
    return openai.chat.completions.create(body).catch((err) => {
      if (
        err instanceof OpenAI.RateLimitError ||
        err instanceof OpenAI.APIConnectionError ||
        err instanceof OpenAI.APIConnectionTimeoutError ||
        err instanceof OpenAI.InternalServerError
      ) {
        retry(err);
        throw err;
      }
      return err;
    });
  });
  return completions;
};

export const OpenAIProvider: IAIProvider = {
  name: "openai",
  chat: createChatCompletion,
};
