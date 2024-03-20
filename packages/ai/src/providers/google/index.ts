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
  const { model, messages } = body;
  const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const modelInstance = googleAI.getGenerativeModel({ model });
  const contents = massageOpenAIMessagesToGoogleAI(messages);
  const { executionDone } = await batch.waitForTurn();
  const completion = await promiseRetry<GenerateContentResult>(
    (retry) => {
      return modelInstance.generateContent({ contents }).catch((err) => {
        retry(err);
        throw err;
      });
    },
    {
      randomize: true,
      minTimeout: 2000,
    },
  );
  // TODO: handle for errors
  executionDone();
  const response: IChatCompletion = {
    id: crypto.randomUUID(),
    choices: [
      {
        finish_reason: "stop",
        index: 0,
        message: {
          content: completion.response.text(),
          role: "assistant",
        },
        logprobs: null,
      },
    ],
    object: "chat.completion",
    created: Date.now(),
    model,
  };
  return response;
};

export const GoogleAIProvider: IAIProvider = {
  name: "google",
  chat: createChatCompletion,
};
