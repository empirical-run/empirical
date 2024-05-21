import { expect, test } from "vitest";
import { isJson } from "./json";

test("json-syntax on empty json", async () => {
  expect(
    await isJson({
      sample: { id: "1", inputs: {} },
      output: { value: "{}" },
      config: {
        type: "json-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "json-syntax",
      message: "",
    },
  ]);
});
