import { expect, test } from "vitest";
import { checkLlmCriteria } from "./llm";

test("llm-criteria works with sql semantics", async () => {
  const [scoreResult] = await checkLlmCriteria({
    sample: {
      id: "1",
      inputs: {},
      expected:
        "SELECT country, COUNT(*) as NumberOfSingers\nFROM singer\nGROUP BY country;",
    },
    output: {
      value: "SELECT country ,  count(*) FROM singer GROUP BY country",
    },
    config: {
      type: "llm-criteria",
      criteria:
        "The output query is semantically (ignoring aliases) equivalent to {{expected}}",
    },
  });
  expect(scoreResult?.score).toBe(1);
  expect(scoreResult?.name).toBe("llm-criteria");
});

test("llm-criteria can detect ai self-referencing in the response", async () => {
  const [scoreResult] = await checkLlmCriteria({
    sample: {
      id: "1",
      inputs: {},
    },
    output: {
      value:
        "As a language model I cannot tell the difference between this query and this one",
    },
    config: {
      type: "llm-criteria",
      criteria: "Never call yourself a language model",
    },
  });
  expect(scoreResult?.score).toBe(0);
  expect(scoreResult?.name).toBe("llm-criteria");
});

test("llm-criteria fails if criteria is empty", async () => {
  const [scoreResult] = await checkLlmCriteria({
    sample: {
      id: "1",
      inputs: {
        empty: "",
      },
    },
    output: {
      value: "Some output from our model.",
    },
    config: {
      type: "llm-criteria",
      criteria: "{{empty}}",
    },
  });
  console.log(scoreResult);
  expect(scoreResult?.score).toBe(0);
  expect(scoreResult?.message).toBe("criteria is not specified for the scorer");
  expect(scoreResult?.name).toBe("llm-criteria");
});
