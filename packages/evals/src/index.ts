import { Assert, Score, DatasetSample } from "@empiricalrun/types";
import getScorer from "./provider";

export default async function score({
  sample,
  output,
  assertions,
  metadata,
  options,
}: {
  sample: DatasetSample;
  output: string | null | undefined;
  assertions: Assert[] | undefined;
  metadata?: object | undefined;
  options?: {
    pythonPath?: string;
  };
}): Promise<Score[]> {
  if (!assertions) {
    return [];
  }

  const scores = await Promise.all(
    assertions.map((assert) => {
      const scoringFn = getScorer(assert);
      if (scoringFn) {
        // TODO: should raise if a scorer function is not found
        return scoringFn({
          sample,
          output,
          value: assert.value,
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
