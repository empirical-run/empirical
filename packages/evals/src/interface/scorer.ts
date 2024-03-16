import { Score, DatasetSampleInput } from "@empiricalrun/types";

export interface Scorer {
  (
    inputs: DatasetSampleInput[],
    output: string,
    expected?: string,
  ): Promise<Score>;
}
