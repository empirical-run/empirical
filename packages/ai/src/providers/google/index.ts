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
  // Google's JS library does not fully support Gemini 1.5 Pro
  // We have an open issue with details:
  // https://github.com/google/generative-ai-js/issues/98
  const modelInstance = googleAI.getGenerativeModel({ model }, { timeout });
  const contents = massageOpenAIMessagesToGoogleAI(messages);
  const history = contents.slice(0, -1);
  const message = contents[contents.length - 1]?.parts!;
  const { executionDone } = await batch.waitForTurn();
  const maxOutputTokens = body.max_tokens || body.maxOutputTokens || 1024;
  // Default temp for gemini-1.5-pro and gemini-1.0-pro-002
  const temperature = body.temperature || 1.0;
  // Deleting params not supported by the generationConfig but used by other sections of the program
  const usedParameters = ["timeout", "max_tokens", "messages", "model"];
  usedParameters.forEach((param) => {
    if (body[param]) {
      delete body[param];
    }
  });

  const generationConfig = {
    maxOutputTokens,
    temperature,
    ...body,
  };

  try {
    const startedAt = Date.now();
    const completion = await promiseRetry<GenerateContentResult>(
      (retry) => {
        return modelInstance
          .startChat({
            // @ts-ignore same as above
            generationConfig,
            history,
          })
          .sendMessage(message)
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
      [{ totalTokens: completionTokens }, { totalTokens: promptTokens }] =
        await Promise.all([
          modelInstance.countTokens(responseContent),
          modelInstance.countTokens({
            contents,
          }),
        ]);
      totalTokens = completionTokens + promptTokens;
    } catch (e) {
      console.warn(`Failed to fetch token usage for google: ${model}`);
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
