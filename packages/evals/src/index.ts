import { Assert, DatasetSampleInput, Score } from "@empiricalrun/types";
import getScorer from "./provider";

export default async function score({
  inputs,
  output,
  expected,
  assertions,
}: {
  inputs: DatasetSampleInput[];
  output: string;
  expected?: string;
  assertions: Assert[] | undefined;
}): Promise<Score[]> {
  if (!assertions) {
    return [];
  }
  // TODO: should raise if a scorer function is not found
  const scoreFns = assertions.map((s) => getScorer(s)).filter((s) => !!s);
  const scores = await Promise.all(
    scoreFns.map((s) => s!(inputs, output, expected)),
  );
  return scores;
}
