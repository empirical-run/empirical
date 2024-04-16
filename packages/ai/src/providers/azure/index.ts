import { IAIProvider, ICreateChatCompletion } from "@empiricalrun/types";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";

const importAzure = async function () {
  const { OpenAIClient, AzureKeyCredential } = await import("@azure/openai");
  return { OpenAIClient, AzureKeyCredential };
};

const createChatCompletion: ICreateChatCompletion = async (body) => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.AZURE_OPENAI_API_KEY is not set",
    );
  }

  const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;
  if (!resourceName) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "process.env.AZURE_OPENAI_RESOURCE_NAME is not set",
    );
  }
  const { OpenAIClient, AzureKeyCredential } = await importAzure();
  const client = new OpenAIClient(
    `https://${resourceName}.openai.azure.com/`,
    new AzureKeyCredential(apiKey),
  );
  const timeout = body.timeout || DEFAULT_TIMEOUT;
  if (body.timeout) {
    delete body.timeout;
  }
  const { model, messages } = body;

  try {
    const startedAt = Date.now();
    // TODO: support parameters like temperature
    // TODO: add retry handling (need to figure out error scenarios)
    const response = await client.getChatCompletions(model, messages, {
      requestOptions: { timeout },
    });

    const latency = Date.now() - startedAt;
    return {
      ...response,
      latency,
      object: "chat.completion",
      model,
      created: response.created.getTime(),
      choices: response.choices.map((c: any) => ({
        index: c.index,
        message: {
          role: c.message?.role! as "assistant",
          content: c.message?.content!,
        },
        finish_reason: "stop",
        logprobs: null,
      })),
      usage: {
        total_tokens: response.usage?.totalTokens!,
        prompt_tokens: response.usage?.promptTokens!,
        completion_tokens: response.usage?.completionTokens!,
      },
    };
  } catch (err) {
    throw new AIError(
      AIErrorEnum.FAILED_CHAT_COMPLETION,
      `Failed to fetch output from model ${body.model}: ${(err as any)?.message}`,
    );
  }
};

export const AzureOpenAIProvider: IAIProvider = {
  name: "azure",
  chat: createChatCompletion,
};
