import { DatasetSample, IRunConfig } from "@empiricalrun/types";

export interface Executor {
  (
    runConfig: IRunConfig,
    sample: DatasetSample,
  ): Promise<{
    output: string | undefined;
    metadata?: object | undefined;
    error?: {
      code?: string;
      message: string;
    };
  }>;
}
