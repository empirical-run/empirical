import { Scorer, Score, DatasetSample, RunOutput } from "@empiricalrun/types";
import getScorer from "./provider";

export default async function score({
  sample,
  output,
  scorers,
  metadata,
  options,
}: {
  sample: DatasetSample;
  output: RunOutput;
  scorers: Scorer[] | undefined;
  metadata?: object | undefined;
  options?: {
    pythonPath?: string;
  };
}): Promise<Score[]> {
  if (!scorers) {
    return [];
  }

  const scores = await Promise.all(
    scorers.map((scorer) => {
      const scoringFn = getScorer(scorer);
      if (scoringFn) {
        // TODO: should raise if a scorer function is not found
        return scoringFn({
          sample,
          output,
          value: scorer.value,
          metadata,
          options,
        });
      } else {
        return undefined;
      }
    }),
  );

  return scores
    .flatMap((s) => s)
    .filter((item) => item !== undefined) as Score[];
}
