import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
  ICreateAndRunAssistantThread,
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
  const timeout = body.timeout || DEFAULT_TIMEOUT;
  if (body.timeout) {
    delete body.timeout;
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout,
  });

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
      `Failed to fetch output from model ${body.model}: ${(err as any)?.error?.message}`,
    );
  }
};

const runAssistant: ICreateAndRunAssistantThread = async (body) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.OPENAI_API_KEY is not set",
    );
  }
  // const timeout = body.timeout || DEFAULT_TIMEOUT;
  // if (body.timeout) {
  //   delete body.timeout;
  // }
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // timeout,
    });

    // https://platform.openai.com/docs/assistants/overview/step-4-create-a-run?context=without-streaming&lang=node.js
    const run = await openai.beta.threads.createAndRunPoll(body);
    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const message = messages.data.find(({ role }) => role === "assistant");
      if (message) {
        return message;
      } else {
        throw new AIError(
          AIErrorEnum.FAILED_CHAT_COMPLETION,
          "No assistant message found in the run response",
        );
      }
    } else {
      // console.log("failed run");
      throw new AIError(
        AIErrorEnum.FAILED_CHAT_COMPLETION,
        `Failed to complete the run: ${run.last_error}`,
      );
    }
  } catch (err) {
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed to fetch output from assistant ${body.assistant_id}: ${(err as any)?.error?.message}`,
    );
  }
};

export const OpenAIProvider: IAIProvider = {
  name: "openai",
  chat: createChatCompletion,
  assistant: runAssistant,
};
