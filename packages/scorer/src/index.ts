import {
  Scorer,
  Score,
  DatasetSample,
  RunOutput,
  RuntimeOptions,
} from "@empiricalrun/types";
import scoreUsingConfig from "./provider";

export default async function score({
  sample,
  output,
  scorers,
  options,
}: {
  sample: DatasetSample;
  output: RunOutput;
  scorers: Scorer[] | undefined;
  options?: RuntimeOptions;
}): Promise<Score[]> {
  if (!scorers) {
    return [];
  }

  try {
    const scores = await Promise.all(
      scorers
        .filter((s) => !!s)
        .map((scorer) => {
          return scoreUsingConfig(scorer, {
            sample,
            output,
            options,
          });
        }),
    );
    return scores
      .flatMap((s) => s)
      .filter((item) => item !== undefined) as Score[];
  } catch (err) {
    console.error((err as Error).message);
    return [];
  }
}
