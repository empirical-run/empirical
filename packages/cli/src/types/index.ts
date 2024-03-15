import { Run, Dataset } from "@empiricalrun/types";

export type RunsConfig = {
  version: string;
  runs: Run[];
  dataset: Dataset;
};
