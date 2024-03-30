import { IRunConfig, DatasetConfig } from "@empiricalrun/types";

export type RunsConfig = {
  runs: IRunConfig[];
  dataset: DatasetConfig;
};
