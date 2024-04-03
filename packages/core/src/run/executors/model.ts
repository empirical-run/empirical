import { RunConfig } from "@empiricalrun/types";
import { Executor } from "./interface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

export const modelExecutor: Executor = async function (
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
  let passthroughParams: { [key: string]: any } = {};
  const { prompt, model, provider, parameters } = runConfig;
  if (parameters) {
    const knownParameters = [
      "temperature",
      "max_tokens",
      "top_p",
      "frequency_penalty",
      "logprobs",
      "n",
      "presence_penalty",
      "response_format",
      "seed",
      "stop",
      "top_logprobs",
    ];
    Object.keys(parameters)
      .filter((key) => {
        return knownParameters.indexOf(key) < 0;
      })
      .forEach((key) => {
        passthroughParams[key] = parameters[key];
        parameters[key] = undefined;
      });
  }
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: replacePlaceholders(prompt as string, sample.inputs),
    },
  ];
  const ai = new EmpiricalAI(provider);
  let value = "";
  try {
    const completion = await ai.chat.completions.create(
      {
        model,
        messages,
        ...parameters,
      },
      passthroughParams,
    );
    value = completion.choices?.[0]?.message.content || "";
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
    },
  };
};
