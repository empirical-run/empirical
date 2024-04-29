import {
  Scorer,
  Score,
  DatasetSample,
  RunOutput,
  RuntimeOptions,
} from "@empiricalrun/types";
import { ScorerError, ScorerErrorEnum } from "./error";
import getScoringFn from "./provider";

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
          const scoringFn = getScoringFn(scorer);
          if (!scoringFn) {
            const errorMessage = (scorer: Scorer) => {
              let recommendation: string =
                "See supported scorers: https://docs.empirical.run/scoring/basics";
              if ((scorer.type as string) === "llm-criteria") {
                recommendation = 'Did you mean "llm-critic"?';
              } else if ((scorer.type as string) === "is-json") {
                recommendation = 'Did you mean "json-syntax"?';
              }
              return `Invalid scorer name "${scorer.type}". ${recommendation}`;
            };
            throw new ScorerError(
              ScorerErrorEnum.INCORRECT_PARAMETERS,
              errorMessage(scorer),
            );
          }
          return scoringFn({
            config: scorer,
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
