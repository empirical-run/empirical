import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import OpenAI from "openai";
import promiseRetry from "promise-retry";
import { AIError, AIErrorEnum } from "../../error";

const createChatCompletion: ICreateChatCompletion = async (body) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.OPENAI_API_KEY is not set",
    );
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
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
  } catch (err) {
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `failed chat completion for model openai ${body.model} with error code: ${(err as OpenAI.ErrorObject).code}`,
    );
  }
};

export const OpenAIProvider: IAIProvider = {
  name: "openai",
  chat: createChatCompletion,
};
