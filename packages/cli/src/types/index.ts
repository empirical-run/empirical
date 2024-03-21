import { IRunConfig, Dataset } from "@empiricalrun/types";

export type RunsConfig = {
  version: string;
  runs: IRunConfig[];
  dataset: Dataset;
};
