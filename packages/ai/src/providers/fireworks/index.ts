import {
  ICreateChatCompletion,
  IAIProvider,
  IChatCompletion,
} from "@empiricalrun/types";
import { BatchTaskManager } from "../../utils";
import { AIError, AIErrorEnum } from "../../error";
import promiseRetry from "promise-retry";

const batchTaskManager = new BatchTaskManager(10);

const createChatCompletion: ICreateChatCompletion = async (
  body,
  passthroughParams,
) => {
  const { model, messages, ...config } = body;
  const payload = JSON.stringify({
    model: `accounts/fireworks/models/${model}`,
    messages,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    top_p: config.top_p,
    frequency_penalty: config.frequency_penalty,
    presence_penalty: config.presence_penalty,
    n: config.n,
    stop: config.stop,
    response_format: config.response_format,
    ...passthroughParams,
  });
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.FIREWORKS_API_KEY is not set",
    );
  }

  const { executionDone } = await batchTaskManager.waitForTurn();

  try {
    const completion = await promiseRetry<IChatCompletion>(
      (retry) => {
        return fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: payload,
        }).then(async (response) => {
          const parsed = await response.json();

          if (response.status === 200) {
            return parsed;
          } else if (response.status === 400) {
            throw new AIError(
              AIErrorEnum.INCORRECT_PARAMETERS,
              `Incorrect request payload: ${parsed.error?.message || "Unknown error"}`,
            );
          } else if (response.status === 429 || response.status >= 500) {
            const err = new AIError(
              AIErrorEnum.RATE_LIMITED,
              "Fireworks API rate limit reached",
            );
            retry(err);
            throw err;
          }
        });
      },
      {
        randomize: true,
        minTimeout: 1000,
      },
    );

    executionDone();
    return completion;
  } catch (err) {
    throw new AIError(AIErrorEnum.FAILED_CHAT_COMPLETION, "Unknown error");
  }
};

export const FireworksAIProvider: IAIProvider = {
  name: "fireworks",
  chat: createChatCompletion,
};
