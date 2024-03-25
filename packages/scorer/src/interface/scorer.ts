import { Score, DatasetSample, RunOutputType } from "@empiricalrun/types";

export type ScoreInputType = {
  sample: DatasetSample;
  output: RunOutputType;
  value?: string;
  metadata?: object | undefined;
  options?: {
    pythonPath?: string;
  };
};

export interface Scorer {
  (input: ScoreInputType): Promise<Score[]>;
}
