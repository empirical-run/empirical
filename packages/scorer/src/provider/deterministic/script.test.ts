import { DatasetSample, RunOutput, Scorer } from "@empiricalrun/types";
import { expect, test } from "vitest";
import { scoreWithPythonScript } from "./script";
import score from "../../index";

const humanEvalSample = {
  output:
    "def truncate_number(number):\n    integer_part = int(number)\n    decimal_part = number - integer_part\n    return decimal_part",
  test: "\n\nMETADATA = {\n    'author': 'jt',\n    'dataset': 'test'\n}\n\n\ndef check(candidate):\n    assert candidate(3.5) == 0.5\n    assert abs(candidate(1.33) - 0.33) < 1e-6\n    assert abs(candidate(123.456) - 0.456) < 1e-6\n",
  funcName: "truncate_number",
};

// Using relative path to use the python script from HumanEval example
// Tests run out of the $root/packages/evals directory
const humanEvalScriptPath = "../../examples/humaneval/score.py";

test("py-script scorer works for a correct humaneval output", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEvalSample.test,
      entry_point: humanEvalSample.funcName,
    },
  };
  expect(
    await scoreWithPythonScript({
      sample,
      output: {
        value: humanEvalSample.output,
      },
      config: {
        type: "py-script",
        name: "unit-tests",
        path: humanEvalScriptPath,
      },
    }),
  ).toStrictEqual({
    score: 1,
    name: "unit-tests",
    message: "Tests passed",
  });
});

test("py-script scorer works for a incorrect humaneval output", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEvalSample.test,
      entry_point: humanEvalSample.funcName + "123", // wrong function name
    },
  };
  expect(
    await scoreWithPythonScript({
      sample,
      output: { value: humanEvalSample.output },
      config: {
        type: "py-script",
        name: "unit-tests",
        path: humanEvalScriptPath,
      },
    }),
  ).toStrictEqual({
    score: 0,
    name: "unit-tests",
    message: "NameError(\"name 'truncate_number123' is not defined\")",
  });
});

test("py-script scorer works for a humaneval output that has backticks", async () => {
  const sample: DatasetSample = {
    id: "1",
    inputs: {
      test: humanEvalSample.test,
      entry_point: humanEvalSample.funcName,
    },
  };
  expect(
    await scoreWithPythonScript({
      sample,
      output: {
        value: "```python\n" + humanEvalSample.output + "\n```",
      },
      config: {
        type: "py-script",
        name: "unit-tests",
        path: humanEvalScriptPath,
      },
    }),
  ).toStrictEqual({
    score: 1,
    name: "unit-tests",
    message: "Tests passed",
  });
});

test("py-script scorer times out a long running script", async () => {
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
}, 21000);

test("py-script scorer works with a python script that throws", async () => {
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

test("py-script scorer works when returning array of scores", async () => {
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };
  const output: RunOutput = {
    value: "output",
  };
  const scorer: Scorer = {
    type: "py-script",
    path: __dirname + "/test-assets/returns_array_of_scores.py",
    name: "score-name",
  };
  const result = await score({ sample, output, scorers: [scorer] });
  expect(result.length).toBe(2);
  expect(result[0].score).toBe(1);
  expect(result[0].name).toBe("score_1");
  expect(result[0].message).toBe(undefined);
  expect(result[1].score).toBe(0);
  expect(result[1].name).toBe("score_2");
  expect(result[1].message).toBe("why this failed");
});

test("py-script scorer works when returning single score without name", async () => {
  const sample: DatasetSample = {
    id: "0",
    inputs: {},
  };
  const output: RunOutput = {
    value: "output",
  };
  const scorer: Scorer = {
    type: "py-script",
    path: __dirname + "/test-assets/returns_single_score.py",
    name: "single-score",
  };
  const result = await score({ sample, output, scorers: [scorer] });
  expect(result.length).toBe(1);
  expect(result[0].score).toBe(1);
  expect(result[0].message).toBe(undefined);
  expect(result[0].name).toBe("single-score");
});
