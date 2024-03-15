import { Assert, DatasetSampleInput, Score } from "@empiricalrun/types";
import getScorer from "./provider";

export default async function score({
  inputs,
  output,
  expected,
  assert,
}: {
  inputs: DatasetSampleInput[];
  output: string;
  expected?: string;
  assert: Assert[] | undefined;
}): Promise<Score[]> {
  if (!assert) {
    return [];
  }
  const scoreFn = assert.map((s) => getScorer(s)).filter((s) => !!s);
  const scores = await Promise.all(
    scoreFn.map((s) => s!(inputs, output, expected)),
  );
  return scores;
}
