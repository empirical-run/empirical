import { IChatCompletion, ICreateChatCompletion } from "@empiricalrun/types";
import { fetchWithRetry } from "@empiricalrun/fetch";
import { AIError, AIErrorEnum } from "../../error";
import { DEFAULT_TIMEOUT } from "../../constants";
import { BatchTaskManager } from "../../utils";

// concurrency limit for azure openai REST APIs
// https://learn.microsoft.com/en-us/azure/ai-services/openai/quotas-limits#quotas-and-limits-reference
const batch = new BatchTaskManager(30);

const createChatCompletion: ICreateChatCompletion = async (
  body,
): Promise<IChatCompletion> => {
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "AZURE_OPENAI_API_KEY is not set as environment variable",
    );
  }
  if (!process.env.AZURE_OPENAI_RESOURCE_NAME) {
    throw new AIError(
      AIErrorEnum.MISSING_PARAMETERS,
      "AZURE_OPENAI_RESOURCE_NAME is not set as environment variable",
    );
  }
  const { executionDone } = await batch.waitForTurn();
  const apiVersion = body.apiVersion || "2024-02-15-preview";
  const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com/openai/deployments/${body.model}/chat/completions?api-version=${apiVersion}`;
  let data: IChatCompletion;
  let requestStartTime = new Date().getTime();
  try {
    const response = await fetchWithRetry(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify(body),
      maxRetries: 5,
      shouldRetry: async (resp, retryCount) => {
        if (resp instanceof Response) {
          console.warn(
            `Retrying request for azure-openai model: ${body.model}. Retry count: ${retryCount}`,
          );
          if (resp.status === 429) {
            requestStartTime = new Date().getTime();
            return true;
          }
        }
        return false;
      },
      timeout: body.timeout || DEFAULT_TIMEOUT,
      backoffMultiple: 1.8,
    });
    if (!response.ok) {
      throw response;
    }
    data = await response.json();
    const latency = new Date().getTime() - requestStartTime;
    executionDone();
    return {
      ...data,
      latency,
    };
  } catch (e: any) {
    executionDone();
    let errMsg = `Failed to fetch output from model ${body.model}: ${e}`;
    if (e instanceof Response) {
      errMsg = `Failed to fetch output from model ${body.model}: api response status: ${e.status}`;
    } else if (e instanceof Error) {
      errMsg = `Failed to fetch output from model ${body.model}: error: ${e.message}`;
    }
    console.error(errMsg);
    throw new AIError(AIErrorEnum.FAILED_CHAT_COMPLETION, errMsg);
  }
};

export const AzureOpenAIProvider = {
  name: "azure-openai",
  chat: createChatCompletion,
};
