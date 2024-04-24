import { RunConfig, ThreadMessage } from "@empiricalrun/types";
import { Transformer } from "./interface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";
import OpenAI from "openai";

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
  const { assistantId, parameters, prompt } = runConfig;
  const ai = new EmpiricalAI("openai");
  const messages: ThreadMessage[] = [
    {
      role: "user",
      content: replacePlaceholders(prompt as string, sample.inputs),
    },
  ];
  let value = "";
  try {
    const message = await ai.assistant.runAssistant({
      assistant_id: assistantId,
      thread: {
        messages,
      },
      ...parameters,
    });
    return {
      output: {
        value: (message.content[0]! as OpenAI.Beta.Threads.TextContentBlock)
          .text.value,
        // tokens_used, --> These will come from run.usage
        // finish_reason,
        // latency,
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
  const { prompt, model, provider, parameters } = runConfig;
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: replacePlaceholders(prompt as string, sample.inputs),
    },
  ];
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
