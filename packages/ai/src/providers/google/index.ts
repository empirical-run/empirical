import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import {
  GoogleGenerativeAI,
  Content,
  Part,
  GenerateContentResult,
  POSSIBLE_ROLES,
} from "@google/generative-ai";
//TODO: fix this import to empirical types
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { BatchTaskManager } from "../../utils";
import crypto from "crypto";
import promiseRetry from "promise-retry";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";

type Role = (typeof POSSIBLE_ROLES)[number];

const batch = new BatchTaskManager(5);

const massageOpenAIMessagesToGoogleAI = function (
  messages: ChatCompletionMessageParam[],
): Content[] {
  const [systemMessage] = messages.filter((m) => m.role === "system");
  let systemMessageContent = "";
  if (systemMessage) {
    systemMessageContent = systemMessage.content as string; // TODO: right now assuming system messages are string
  }
  const filteredMessages = messages.filter((m) => m.role !== "system");
  const contents = filteredMessages.map((m) => {
    let role: Role = "user";
    let parts: Part[] = [];
    if (m.role === "assistant") {
      role = "model";
    } else if (m.role === "tool" || m.role === "function") {
      role = "function";
    }

    if (role === "user" && systemMessageContent) {
      parts.push({ text: systemMessageContent });
    }

    // TODO: right now only supporting text formats
    if (typeof m.content === "string") {
      parts.push({ text: m.content });
    }
    return {
      role,
      parts,
    };
  });
  return contents;
};

const createChatCompletion: ICreateChatCompletion = async (body) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.GOOGLE_API_KEY is not set",
    );
  }
  const { model, messages } = body;
  const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const timeout = body.timeout || DEFAULT_TIMEOUT;
  const modelInstance = googleAI.getGenerativeModel(
    { model },
    { apiVersion: "v1beta", timeout },
  );
  const contents = massageOpenAIMessagesToGoogleAI(messages);
  const { executionDone } = await batch.waitForTurn();
  try {
    const startedAt = Date.now();
    const completion = await promiseRetry<GenerateContentResult>(
      (retry) => {
        // TODO: move to model.startChat which support model config (e.g. temperature)
        return modelInstance
          .generateContent({ contents })
          .catch((err: Error) => {
            // TODO: Replace with instanceof checks when the Gemini SDK exports errors
            if (err.message.includes("[429 Too Many Requests]")) {
              retry(err);
            }
            throw err;
          });
      },
      {
        randomize: true,
      },
    );
    executionDone();
    const latency = Date.now() - startedAt;
    const responseContent = completion.response.text();

    let totalTokens = 0,
      promptTokens = 0,
      completionTokens = 0;

    try {
      // Google's JS library does not fully support Gemini 1.5 Pro
      // because of which the `countTokens` method needs to be requested
      // via an older model. We have an open issue with details:
      // https://github.com/google/generative-ai-js/issues/98
      const tokenCounterModelInstance = model.includes("gemini-1.5")
        ? googleAI.getGenerativeModel({
            model: "gemini-pro",
          })
        : modelInstance;
      [{ totalTokens: completionTokens }, { totalTokens: promptTokens }] =
        await Promise.all([
          tokenCounterModelInstance.countTokens(responseContent),
          tokenCounterModelInstance.countTokens({
            contents,
          }),
        ]);
      totalTokens = completionTokens + promptTokens;
    } catch (e) {
      console.warn(`Failed to fetch token usage for google:${model}`);
    }

    const response: IChatCompletion = {
      id: crypto.randomUUID(),
      choices: [
        {
          finish_reason: "stop",
          index: 0,
          message: {
            content: responseContent,
            role: "assistant",
          },
          logprobs: null,
        },
      ],
      object: "chat.completion",
      created: Date.now(),
      usage: {
        total_tokens: totalTokens,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
      },
      model,
      latency,
    };
    return response;
  } catch (e) {
    executionDone();
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed to fetch output from model ${body.model} with message ${(e as Error).message}`,
    );
  }
};

export const GoogleAIProvider: IAIProvider = {
  name: "google",
  chat: createChatCompletion,
};
