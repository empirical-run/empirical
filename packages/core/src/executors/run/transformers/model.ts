import {
  ChatPrompt,
  DatasetSampleInputs,
  ModelRunConfig,
  Prompt,
  RunConfig,
} from "@empiricalrun/types";
import { Transformer } from "./interface";
import OpenAI from "openai";
import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

export const setModelDefaults = async (
  runConfig: ModelRunConfig,
): Promise<ModelRunConfig> => {
  runConfig.name = runConfig.name || runConfig.model;
  return runConfig;
};

export const massagePrompt = (
  prompt: Prompt,
  inputs: DatasetSampleInputs,
): OpenAI.ChatCompletionMessageParam[] => {
  if (Array.isArray(prompt)) {
    const massagedPrompts = (prompt as ChatPrompt[]).map((p) => {
      const message: OpenAI.ChatCompletionMessageParam = {
        role: p.role,
        content: p.content ? replacePlaceholders(p.content, inputs) : "",
      };
      return message;
    });
    return massagedPrompts;
  }
  return [
    {
      role: "user",
      content: prompt ? replacePlaceholders(prompt, inputs) : "",
    },
  ];
};

export const modelExecutor: Transformer = async function (
  runConfig: RunConfig,
  sample,
) {
  if (runConfig.type !== "model") {
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
  if (!runConfig.prompt) {
    return {
      output: {
        value: "",
      },
      error: {
        code: "",
        message: "No prompt provided for model execution",
      },
    };
  }
  const { prompt, model, provider, parameters } = runConfig;
  const messages = massagePrompt(prompt, sample.inputs);
  const ai = new EmpiricalAI(provider);
  let value = "",
    tokens_used,
    finish_reason,
    latency;
  try {
    const completion = await ai.chat.completions.create({
      model,
      messages,
      ...parameters,
    });
    value = completion.choices?.[0]?.message.content || "";
    tokens_used = completion.usage?.total_tokens || 0;
    finish_reason = completion.choices?.[0]?.finish_reason || "";
    latency = completion.latency || 0;
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
  return {
    output: {
      value,
      tokens_used,
      finish_reason,
      latency,
    },
  };
};
