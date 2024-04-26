import { RunConfig, DatasetConfig, Scorer } from "@empiricalrun/types";

export type RunsConfig = {
  $schema?: string;
  runs: RunConfig[];
  dataset: DatasetConfig;
  scorers?: Scorer[];
};
