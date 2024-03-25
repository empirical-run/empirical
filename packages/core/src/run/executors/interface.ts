import { DatasetSample, IRunConfig, RunOutput } from "@empiricalrun/types";

export interface Executor {
  (
    runConfig: IRunConfig,
    sample: DatasetSample,
  ): Promise<{
    output: RunOutput;
    error?: {
      code?: string;
      message: string;
    };
  }>;
}
