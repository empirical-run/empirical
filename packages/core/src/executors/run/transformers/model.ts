import {
  ChatPrompt,
  DatasetSampleInputs,
  Prompt,
  RunConfig,
  ThreadMessage,
} from "@empiricalrun/types";
import { Transformer } from "./interface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

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
  const { assistant_id, parameters, prompt } = runConfig;
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
      assistant_id,
      thread: {
        messages,
      },
      ...parameters,
    });

    const hasCitation = message.citations && message.citations.length > 0;
    const hasToolCall = message.tool_calls && message.tool_calls.length > 0;
    let metadata: any = {};
    if (hasCitation) {
      metadata.citations = message.citations;
    }
    if (hasToolCall) {
      metadata.tool_calls = message.tool_calls;
    }

    return {
      output: {
        value: message.content,
        metadata,
        tokens_used: message.usage?.total_tokens,
        latency: message.latency,
        // finish_reason,
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

export const massagePrompt = (
  prompt: Prompt,
  inputs: DatasetSampleInputs,
): ChatCompletionMessageParam[] => {
  if (Array.isArray(prompt)) {
    const massagedPrompts = (prompt as ChatPrompt[]).map((p) => {
      const message: ChatCompletionMessageParam = {
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
