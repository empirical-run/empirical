import { RunConfig } from "@empiricalrun/types";
import { Transformer } from "./interface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AIError, EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

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
  let value = "";
  try {
    const completion = await ai.chat.completions.create({
      model,
      messages,
      ...parameters,
    });
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
