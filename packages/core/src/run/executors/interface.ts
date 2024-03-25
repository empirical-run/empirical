import { DatasetSample, IRunConfig, RunOutputType } from "@empiricalrun/types";

export interface Executor {
  (
    runConfig: IRunConfig,
    sample: DatasetSample,
  ): Promise<{
    output: RunOutputType;
    error?: {
      code?: string;
      message: string;
    };
  }>;
}
