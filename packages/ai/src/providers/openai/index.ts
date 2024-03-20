import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import OpenAI from "openai";
import promiseRetry from "promise-retry";

const createChatCompletion: ICreateChatCompletion = async (body) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completions = await promiseRetry<IChatCompletion>(
    (retry) => {
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
    },
    {
      randomize: true,
      minTimeout: 1000,
    },
  );
  return completions;
};

export const OpenAIProvider: IAIProvider = {
  name: "openai",
  chat: createChatCompletion,
};
