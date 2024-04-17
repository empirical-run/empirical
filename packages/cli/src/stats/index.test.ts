import { expect, test } from "vitest";
import { markdownSummary, setRunSummary } from ".";
import { RunCompletion, RunSampleOutput, RunConfig } from "@empiricalrun/types";

test("markdown table works for github comment", () => {
  const sample: RunSampleOutput = {
    scores: [{ name: "test-score", score: 1, message: "Message" }],
    output: {
      value: "Output value",
      latency: 100,
      tokens_used: 100,
    },
    dataset_sample_id: "abcd",
    run_id: "1234",
    inputs: {},
  };
  const runConfig = (id: string): RunConfig => ({
    name: `Run (${id})`,
    type: "model",
    provider: "openai",
    model: "gpt-3.5-turbo",
    prompt: "Help me",
  });
  const runs: RunCompletion[] = ["1234", "2345"].map((id) => ({
    id,
    run_config: runConfig(id),
    dataset_config: { id },
    samples: [sample],
    created_at: new Date(),
  }));
  const expected = `### Empirical Run Summary
|             | Run (1234) | Run (2345) |
|-------------|------------|------------|
| Outputs     | 100%       | 100%       |
| Scores      |            |            |
| test-score  | 100%       | 100%       |
| Avg latency | 100ms      | 100ms      |
`;
  setRunSummary(runs);
  expect(markdownSummary(runs)).to.equal(expected);
});

test("markdown table works for github comment without scores", () => {
  const sample: RunSampleOutput = {
    scores: [],
    output: {
      value: "Output value",
      latency: 100,
      tokens_used: 100,
    },
    dataset_sample_id: "abcd",
    run_id: "1234",
    inputs: {},
  };
  const runConfig = (id: string): RunConfig => ({
    name: `Run (${id})`,
    type: "model",
    provider: "openai",
    model: "gpt-3.5-turbo",
    prompt: "Help me",
  });
  const runs: RunCompletion[] = ["1234", "2345"].map((id) => ({
    id,
    run_config: runConfig(id),
    dataset_config: { id },
    samples: [sample],
    created_at: new Date(),
  }));
  const expected = `### Empirical Run Summary
|             | Run (1234) | Run (2345) |
|-------------|------------|------------|
| Outputs     | 100%       | 100%       |
| Avg latency | 100ms      | 100ms      |
`;
  setRunSummary(runs);
  expect(markdownSummary(runs)).to.equal(expected);
});
