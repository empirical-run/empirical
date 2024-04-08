import { RunConfig } from "@empiricalrun/types";
import { modelExecutor } from "./model";
import { Transformer } from "./interface";
import { scriptExecutor } from "./script";

export const getTransformer = (
  runConfig: RunConfig,
): Transformer | undefined => {
  if (runConfig.type === "model") {
    return modelExecutor;
  } else if (runConfig.type === "py-script") {
    return scriptExecutor;
  }
};
