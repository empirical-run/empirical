import { DatasetSample, RunConfig, RunOutput } from "@empiricalrun/types";

export interface Executor {
  (
    runConfig: RunConfig,
    sample: DatasetSample,
  ): Promise<{
    output: RunOutput;
    error?: {
      code?: string;
      message: string;
    };
  }>;
}
