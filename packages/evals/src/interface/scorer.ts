import { Score, DatasetSample } from "@empiricalrun/types";

export type ScoreInputType = {
  sample: DatasetSample;
  output: string | null | undefined;
  value?: string;
  metadata?: object | undefined;
  options?: {
    pythonPath?: string;
  };
};

export interface Scorer {
  (input: ScoreInputType): Promise<Score | Score[]>;
}
