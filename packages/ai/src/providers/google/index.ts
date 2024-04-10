import {
  IAIProvider,
  IChatCompletion,
  ICreateChatCompletion,
} from "@empiricalrun/types";
import {
  GoogleGenerativeAI,
  Content,
  Role,
  Part,
  GenerateContentResult,
} from "@google/generative-ai";
//TODO: fix this import to empirical types
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { BatchTaskManager } from "../../utils";
import crypto from "crypto";
import promiseRetry from "promise-retry";
import { AIError, AIErrorEnum } from "../../error";

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
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.GEMINI_API_KEY is not set",
    );
  }
  const { model, messages } = body;
  const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const modelInstance = googleAI.getGenerativeModel({ model });
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
            retry(err);
            throw err;
          });
      },
      {
        randomize: true,
        minTimeout: 2000,
      },
    );
    executionDone();
    const latency = Date.now() - startedAt;
    const responseContent = completion.response.text();
    const { totalTokens: completion_tokens } =
      await modelInstance.countTokens(responseContent);
    const { totalTokens: prompt_tokens } = await modelInstance.countTokens({
      contents,
    });
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
        total_tokens: prompt_tokens + completion_tokens,
        prompt_tokens,
        completion_tokens,
      },
      model,
      latency,
    };
    return response;
  } catch (e) {
    executionDone();
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `failed chat completion for model ${body.model} with message ${(e as Error).message}`,
    );
  }
};

export const GoogleAIProvider: IAIProvider = {
  name: "google",
  chat: createChatCompletion,
};
