import { ICreateChatCompletion, IAIProvider } from "@empiricalrun/types";
import { BatchTaskManager, getPassthroughParams } from "../../utils";
import { AIError, AIErrorEnum } from "../../error";
import { fetchWithRetry } from "@empiricalrun/fetch";
import { DEFAULT_TIMEOUT } from "../../constants";

const batchTaskManager = new BatchTaskManager(10);

const createChatCompletion: ICreateChatCompletion = async (body) => {
  const { model, messages, ...config } = body;
  if (config.timeout) {
    delete config.timeout;
  }
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
    tools: body.tools,
    tool_choice: body.tool_choice,
    ...getPassthroughParams(config),
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
    let startedAt = Date.now();
    const response = await fetchWithRetry(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: payload,
        maxRetries: 5,
        timeout: body.timeout || DEFAULT_TIMEOUT,
        backoffMultiple: 1.8,
        shouldRetry: async (err, attempt) => {
          if (err instanceof Response && err.status === 429) {
            console.warn(
              `Retrying request for fireworks model: ${body.model}. Retry attempt: ${attempt}`,
            );
            startedAt = Date.now();
            return true;
          }
          return false;
        },
      },
    );
    const completion = await response.json();
    const latency = Date.now() - startedAt;
    executionDone();
    return { ...completion, latency };
  } catch (e) {
    executionDone();
    let error = new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed to fetch output from fireworks model ${body.model}: ${e}`,
    );
    if (e instanceof Response) {
      let parsed: any = {};
      try {
        parsed = await e.json();
      } catch (e) {
        // ignore error
      }
      error = new AIError(
        AIErrorEnum.FAILED_CHAT_COMPLETION,
        `Failed to fetch output from fireworks model ${body.model}: HTTP status ${e.status}: ${parsed.error?.message || "Unknown error"}`,
      );
    }
    console.error(error.message);
    throw error;
  }
};

export const FireworksAIProvider: IAIProvider = {
  name: "fireworks",
  chat: createChatCompletion,
};
