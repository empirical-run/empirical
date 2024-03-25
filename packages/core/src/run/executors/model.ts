import { IRunConfig } from "@empiricalrun/types";
import { Executor } from "./interface";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

export const modelExecutor: Executor = async function (
  runConfig: IRunConfig,
  sample,
) {
  if (runConfig.type !== "model") {
    return {
      output: {
        value: "",
      },
    };
  }
  const { prompt, model, provider } = runConfig;
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: replacePlaceholders(
        prompt as string,
        sample.inputs.reduce((agg, i) => {
          return {
            ...agg,
            [i.name]: i.value,
          };
        }, {}),
      ),
    },
  ];
  const ai = new EmpiricalAI(provider);
  let outputValue = "";
  try {
    const completion = await ai.chat.completions.create({ model, messages });
    outputValue = completion.choices[0]?.message.content || "";
  } catch (e: unknown) {
    console.warn("Failed to get completion from model::", e);
    return {
      output: {
        value: outputValue,
      },
      error: {
        code: "RUN_EX_DEF",
        message: (e as Error).message || (e as Error).stack || "",
      },
    };
  }
  return {
    output: {
      value: outputValue,
    },
  };
};
