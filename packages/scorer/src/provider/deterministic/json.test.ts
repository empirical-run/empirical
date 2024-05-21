import { expect, test } from "vitest";
import { isJson } from "./json";

test("json-syntax on empty json", async () => {
  expect(
    await isJson({
      output: { value: "{}" },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "json-syntax",
      message: "",
    },
  ]);
});
