import { DatasetSample } from "@empiricalrun/types";
import { expect, test } from "vitest";
import { scoreWithJSScript } from "./jsScript";

test("javascript script scorer works for commonjs", async () => {
  const scriptPath = "scorer.cjs";
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };

  expect(
    await scoreWithJSScript({
      sample,
      output: {
        value: '{"a": 1, "b": 3}',
      },
      config: {
        type: "js-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "json-keys-gt-2",
      message: "testing message",
    },
  ]);
});

test("javascript script scorer can check for valid sql", async () => {
  const scriptPath = "scorer1.cjs";
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };

  expect(
    await scoreWithJSScript({
      sample,
      output: {
        value: "select * from table_name;",
      },
      config: {
        type: "js-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-syntax",
      message: "",
    },
  ]);
});

test("javascript script scorer can check faithfulness", async () => {
  const scriptPath = "scorer2.js";
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };

  expect(
    await scoreWithJSScript({
      sample,
      output: {
        value: "",
      },
      config: {
        type: "js-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 0.5,
      name: "llm-faithfulness",
      message: "",
    },
  ]);
});
