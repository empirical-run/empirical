import { DatasetSample, RunOutput, Score, Scorer } from "@empiricalrun/types";
import { isJson } from "./deterministic/json";
import { scoreWithPythonScript } from "./deterministic/py-script";
import { checkSqlSyntax } from "./deterministic/sql";
import { checkLlmCriteria } from "./model-graded/llm";
import { ScorerError, ScorerErrorEnum } from "../error";
import scoreWithJSScript from "./deterministic/js-script";

function buildErrorMessage(config: Scorer): string {
  let recommendation: string =
    "See supported scorers: https://docs.empirical.run/scoring/basics";
  let errorMessage = `Invalid scorer. ${recommendation}`;
  if ("type" in config) {
    if ((config.type as string) === "llm-criteria") {
      recommendation = 'Did you mean "llm-critic"?';
    } else if ((config.type as string) === "is-json") {
      recommendation = 'Did you mean "json-syntax"?';
    }
    errorMessage = `Invalid scorer name "${config.type}". ${recommendation}`;
  }
  return errorMessage;
}

export default async function scoreUsingConfig(
  config: Scorer,
  {
    sample,
    output,
    options,
  }: {
    sample: DatasetSample;
    output: RunOutput;
    options?: any;
  },
): Promise<Score[]> {
  if ("type" in config) {
    if (config.type === "py-script") {
      return scoreWithPythonScript({ sample, output, config, options });
    }
    if (config.type === "llm-critic") {
      return checkLlmCriteria({ sample, output, config });
    }
    if (config.type === "json-syntax") {
      return isJson({ output });
    }
    if (config.type === "sql-syntax") {
      return checkSqlSyntax({ output });
    }
  }
  if (typeof config === "function") {
    return scoreWithJSScript({
      sample,
      output,
      config
    })
  }
  throw new ScorerError(
    ScorerErrorEnum.INCORRECT_PARAMETERS,
    buildErrorMessage(config),
  );
}
