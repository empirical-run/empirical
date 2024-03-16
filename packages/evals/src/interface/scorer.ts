import { Score, DatasetSample } from "@empiricalrun/types";

export interface Scorer {
  (sample: DatasetSample, output: string, value?: string): Promise<Score>;
}
