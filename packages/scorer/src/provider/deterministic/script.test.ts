import { DatasetSample } from "@empiricalrun/types";
import { expect, test } from "vitest";
import { scoreWithPythonScript } from "./script";

const humanEval = {
  output:
    "def truncate_number(number):\n    integer_part = int(number)\n    decimal_part = number - integer_part\n    return decimal_part",
  test: "\n\nMETADATA = {\n    'author': 'jt',\n    'dataset': 'test'\n}\n\n\ndef check(candidate):\n    assert candidate(3.5) == 0.5\n    assert abs(candidate(1.33) - 0.33) < 1e-6\n    assert abs(candidate(123.456) - 0.456) < 1e-6\n",
  funcName: "truncate_number",
};

// Using relative path to use the python script from HumanEval example
// Tests run out of the $root/packages/evals directory
const scriptPath = "../../examples/humaneval/eval.py";

test("script scorer works for a correct humaneval output", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEval.test,
      entry_point: humanEval.funcName,
    },
  };

  expect(
    await scoreWithPythonScript({
      sample,
      output: {
        value: humanEval.output,
      },
      config: {
        type: "py-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "unit-tests",
      message: "",
    },
  ]);
});

test("script scorer works for a incorrect humaneval output", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEval.test,
      entry_point: humanEval.funcName + "123", // wrong function name
    },
  };

  expect(
    await scoreWithPythonScript({
      sample,
      output: { value: humanEval.output },
      config: {
        type: "py-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 0,
      name: "unit-tests",
      message: "NameError(\"name 'truncate_number123' is not defined\")",
    },
  ]);
});

test("script scorer works for a humaneval output that has backticks", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEval.test,
      entry_point: humanEval.funcName,
    },
  };

  expect(
    await scoreWithPythonScript({
      sample,
      output: {
        value: "```python\n" + humanEval.output + "\n```",
      },
      config: {
        type: "py-script",
        path: scriptPath,
      },
    }),
  ).toStrictEqual([
    {
      score: 0,
      name: "unit-tests",
      message:
        "SyntaxError('invalid syntax', ('<string>', 1, 1, '```python\\n', 1, 2))",
    },
  ]);
});

test(
  "script scorer times out a long running script",
  async () => {
    const sample: DatasetSample = {
      id: "0",
      inputs: {},
    };
    const longRunningScript = __dirname + "/test-assets/long_running.py";
    expect(
      await scoreWithPythonScript({
        sample,
        output: { value: "" },
        config: {
          type: "py-script",
          path: longRunningScript,
        },
      }),
    ).toStrictEqual([
      {
        score: 0,
        name: "py-script",
        message: "Scorer script timed out",
      },
    ]);
  },
  { timeout: 21000 },
);

test("script scorer works with a python script that throws", async () => {
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };
  const scriptWithError = __dirname + "/test-assets/throws.py";
  const [score] = await scoreWithPythonScript({
    sample,
    output: { value: "" },
    config: {
      type: "py-script",
      path: scriptWithError,
    },
  });

  expect(score).toEqual(
    expect.objectContaining({
      score: 0,
      name: "py-script",
    }),
  );
});
