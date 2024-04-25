import {
  IAIProvider,
  IChatCompletion,
  Citation,
  ICreateChatCompletion,
  ICreateAndRunAssistantThread,
} from "@empiricalrun/types";
import OpenAI from "openai";
import promiseRetry from "promise-retry";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";
import { BatchTaskManager } from "../../utils";

const batchTaskManager = new BatchTaskManager(1, 100);

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
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // timeout,
  });
  const { executionDone } = await batchTaskManager.waitForTurn();
  try {
    // https://platform.openai.com/docs/assistants/overview/step-4-create-a-run?context=without-streaming&lang=node.js
    const run = await openai.beta.threads.createAndRunPoll(body, {
      pollIntervalMs: 500, // Default is 5000
    });
    executionDone();
    // Run statuses: https://platform.openai.com/docs/assistants/how-it-works/run-lifecycle
    if (run.status === "requires_action") {
      const { tool_calls } = run.required_action?.submit_tool_outputs ?? {
        tool_calls: [],
      };
      const toolSummary = tool_calls.map((tc) => {
        return `${tc.function.name} with args ${tc.function.arguments}`;
      });
      return {
        content: `Attempting to make tool call: ${toolSummary.join(", ")}`,
        citations: [],
        tool_calls,
      };
    } else if (run.status === "completed") {
      // TODO: give usage and latency
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const message = messages.data.find(({ role }) => role === "assistant");
      if (message) {
        const msgText = (
          message.content[0]! as OpenAI.Beta.Threads.TextContentBlock
        ).text;
        const citations: Citation[] = msgText.annotations.map((ann) => ({
          text: ann.text,
          file_id:
            ann.type === "file_citation"
              ? ann.file_citation.file_id
              : ann.file_path.file_id,
          quote:
            ann.type === "file_citation" ? ann.file_citation.quote : undefined,
        }));
        return {
          content: msgText.value,
          citations,
          tool_calls: [],
          usage: run.usage!,
        };
      } else {
        throw new AIError(
          AIErrorEnum.FAILED_CHAT_COMPLETION,
          "No assistant message found in the run response",
        );
      }
    } else {
      throw new AIError(
        AIErrorEnum.FAILED_CHAT_COMPLETION,
        `Failed to complete the run: ${JSON.stringify(run.last_error)}`,
      );
    }
  } catch (err) {
    executionDone();
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
