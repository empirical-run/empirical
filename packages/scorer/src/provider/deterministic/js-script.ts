import {
  DatasetSample,
  JSScriptScorer,
  RunOutput,
  Score,
} from "@empiricalrun/types";

export default async function scoreWithJSScript({
  output,
  config,
  sample,
}: {
  output: RunOutput;
  config: JSScriptScorer;
  sample: DatasetSample;
}): Promise<Score[]> {
  let score = config({ output, config, sample });
  if ("then" in score) {
    score = await score;
  }
  if (!Array.isArray(score)) {
    return [score];
  } else {
    return score;
  }
}
