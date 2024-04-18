import { RunConfig, DatasetConfig, Scorer } from "@empiricalrun/types";

export type RunsConfig = {
  runs: RunConfig[];
  dataset: DatasetConfig;
  $schema?: string;
  provider?: "openai" | "mistral" | "anthropic" | "google" | "fireworks";
  scorers?: Scorer[];
};
