import {
  DatasetSample,
  JSScriptScorer,
  RunOutput,
  Score,
} from "@empiricalrun/types";

function camelToKebab(str: string) {
  if (!str) {
    return str;
  }
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // handle lowercase or digit followed by uppercase
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // handle uppercase followed by uppercase-lowercase
    .toLowerCase(); // convert the entire string to lowercase
}

export default async function scoreWithJSScript({
  output,
  config,
  sample,
}: {
  output: RunOutput;
  config: JSScriptScorer;
  sample: DatasetSample;
}): Promise<Score[]> {
  const { inputs } = sample;
  let score = config({ output, inputs });
  if ("then" in score) {
    score = await score;
  }
  if (!Array.isArray(score)) {
    return [
      {
        ...score,
        name: score.name || camelToKebab(config.name) || "js-script",
      },
    ];
  } else {
    return score;
  }
}
