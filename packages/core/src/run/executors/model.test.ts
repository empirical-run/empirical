import { expect, test } from "vitest";
import { modelExecutor } from "./model";
import { IRunConfig } from "@empiricalrun/types";

test("max_tokens as model config works on openai", async () => {
  const runConfig: IRunConfig = {
    type: "model",
    provider: "openai",
    model: "gpt-3.5-turbo",
    prompt: "Repeat everything I said and NOTHING else.",
    config: {
      max_tokens: 1,
      temperature: 0.1,
    },
  };
  const { output, error } = await modelExecutor(runConfig, {
    inputs: {},
    id: "sample-id-1",
  });
  expect(error).toBeUndefined();
  expect(output.value).toBe("Repeat");
});
