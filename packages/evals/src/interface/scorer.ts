import { Score } from "@empiricalrun/types";

export interface Scorer {
  (inputs: any, output: string, expected?: string): Promise<Score>;
}
