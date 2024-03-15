import { expect, test } from "vitest";
import { isJSON } from "./is-json";

test("is-json on empty json", async () => {
  expect(await isJSON("", "{}")).toStrictEqual({
    score: 1,
    name: "is-json",
    message: "",
  });
});
