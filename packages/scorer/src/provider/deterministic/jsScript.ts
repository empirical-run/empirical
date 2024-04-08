import { ScoringFn } from "../../interface/scorer";
import path from "path";
import { Score } from "@empiricalrun/types";

export const name = "js-script";

export const scoreWithJSScript: ScoringFn = async ({
  sample,
  output,
  config,
}): Promise<Score[]> => {
  if (config.type !== "js-script") {
    return [
      {
        score: 0,
        name,
        message: "invalid scorer function detected",
      },
    ];
  }
  if (!config.path) {
    return [
      {
        score: 0,
        name: config.name || name,
        message: "JS script path is not provided for running the scorer",
      },
    ];
  }

  const fullPath = path.resolve(config.path);
  const module = require(fullPath);
  const result = module(output, sample.inputs);
  return result;
};
