import { Scorer, Score, DatasetSample, RunOutput } from "@empiricalrun/types";
import getScorer from "./provider";
import { ScorerError, ScorerErrorEnum } from "./error";

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

  try {
    const scores = await Promise.all(
      scorers
        .filter((s) => !!s)
        .map((scorer) => {
          const scoringFn = getScorer(scorer);
          if (!scoringFn) {
            throw new ScorerError(
              ScorerErrorEnum.INCORRECT_PARAMETERS,
              `Incorrect scorer name "${scorer}" provided.`,
            );
          }
          return scoringFn({
            sample,
            output,
            value: scorer.value,
            metadata,
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
