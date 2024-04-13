import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import OpenAI from "openai";
import promiseRetry from "promise-retry";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";

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
    timeout: body.timeout || DEFAULT_TIMEOUT,
  });
  if (body.timeout) {
    delete body.timeout;
  }
  try {
    const startedAt = Date.now();
    const completions = await promiseRetry<IChatCompletion>(
      (retry) => {
        return openai.chat.completions.create(body).catch((err) => {
          if (
            err instanceof OpenAI.RateLimitError &&
            err.type === "insufficient_quota"
          ) {
            throw err;
          } else if (
            err instanceof OpenAI.RateLimitError ||
            err instanceof OpenAI.APIConnectionError ||
            err instanceof OpenAI.APIConnectionTimeoutError ||
            err instanceof OpenAI.InternalServerError
          ) {
            retry(err);
            throw err;
          }
          throw err;
        });
      },
      {
        randomize: true,
        minTimeout: 1000,
      },
    );
    const latency = Date.now() - startedAt;
    return { ...completions, latency };
  } catch (err) {
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed completion for OpenAI ${body.model}: ${(err as any)?.error?.message}`,
    );
  }
};

export const OpenAIProvider: IAIProvider = {
  name: "openai",
  chat: createChatCompletion,
};
