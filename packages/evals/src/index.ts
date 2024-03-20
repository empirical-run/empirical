import { Assert, Score, DatasetSample } from "@empiricalrun/types";
import getScorer from "./provider";

export default async function score({
  sample,
  output,
  assertions,
}: {
  sample: DatasetSample;
  output: string | null | undefined;
  assertions: Assert[] | undefined;
}): Promise<Score[]> {
  if (!assertions) {
    return [];
  }

  const scores = await Promise.all(
    assertions.map((assert) => {
      const scoringFn = getScorer(assert);
      if (scoringFn) {
        // TODO: should raise if a scorer function is not found
        return scoringFn(sample, output, assert.value);
      } else {
        return undefined;
      }
    }),
  );

  return scores.filter((item) => item !== undefined) as Score[];
}
