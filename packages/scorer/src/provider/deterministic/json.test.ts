import { expect, test } from "vitest";
import { isJson } from "./json";

test("is-json on empty json", async () => {
  expect(
    await isJson({
      sample: { id: "1", inputs: [] },
      output: { value: "{}" },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "is-json",
      message: "",
    },
  ]);
});