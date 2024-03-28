import { Score, DatasetSample, RunOutput, Scorer } from "@empiricalrun/types";

export interface ScoringInputBase {
  sample: DatasetSample;
  output: RunOutput;
  config: Scorer;
  options?: any;
}

export interface ScoringFn {
  (args: ScoringInputBase): Promise<Score[]>;
}
