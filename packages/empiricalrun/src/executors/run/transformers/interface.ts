import {
  DatasetSample,
  RunConfig,
  RunOutput,
  RuntimeOptions,
} from "@empiricalrun/types";

export interface Transformer {
  (
    runConfig: RunConfig,
    sample: DatasetSample,
    runtimeOptions?: RuntimeOptions,
  ): Promise<{
    output: RunOutput;
    error?: {
      code?: string;
      message: string;
    };
  }>;
}
