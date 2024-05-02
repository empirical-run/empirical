import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";
import {
  AssistantsRunConfig,
  RunConfig,
  ThreadMessage,
} from "@empiricalrun/types";
import { Transformer } from "./interface";

export const getAssistantDefaults = async (
  runConfig: AssistantsRunConfig,
): Promise<AssistantsRunConfig> => {
  runConfig.name = runConfig.name || runConfig.assistant_id;
  runConfig.provider = runConfig.provider || "openai";
  const ai = new EmpiricalAI(runConfig.provider);
  const assistant = await ai.assistant.retrieve(runConfig.assistant_id);
  runConfig.parameters = runConfig.parameters || {};
  runConfig.parameters.instructions =
    runConfig.parameters.instructions || assistant.instructions || "";
  runConfig.parameters.model = runConfig.parameters.model || assistant.model;
  runConfig.parameters.temperature =
    runConfig.parameters.temperature || assistant.temperature || undefined;
  return runConfig;
};

export const assistantExecutor: Transformer = async function (
  runConfig: RunConfig,
  sample,
) {
  if (runConfig.type !== "assistant") {
    return {
      output: {
        value: "",
      },
      error: {
        code: "",
        message: `wrong executor selection. selected ${runConfig.type} and got model`,
      },
    };
  }
  const { assistant_id, parameters, prompt, provider } = runConfig;
  const ai = new EmpiricalAI(provider);
  const messages: ThreadMessage[] = [
    {
      role: "user",
      content: replacePlaceholders(prompt as string, sample.inputs),
    },
  ];
  let value = "";
  try {
    const message = await ai.assistant.runAssistant({
      assistant_id,
      thread: {
        messages,
      },
      ...parameters,
    });

    const hasCitation = message.citations && message.citations.length > 0;
    let metadata: any = {};
    if (hasCitation) {
      metadata.citations = message.citations;
    }
    return {
      output: {
        value: message.content,
        metadata,
        tokens_used: message.usage?.total_tokens,
        latency: message.latency,
        tool_calls: message.tool_calls,
      },
    };
  } catch (e: any) {
    const error = {
      code: "RE101",
      message: e.message,
    };
    if (e instanceof AIError) {
      error.code = e.code;
      error.message = e.message;
    }
    return {
      output: {
        value,
      },
      error,
    };
  }
};
