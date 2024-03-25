import { Score, DatasetSample, RunOutput } from "@empiricalrun/types";

export type ScoreInputType = {
  sample: DatasetSample;
  output: RunOutput;
  value?: string;
  metadata?: object | undefined;
  options?: {
    pythonPath?: string;
  };
};

export interface Scorer {
  (input: ScoreInputType): Promise<Score[]>;
}
