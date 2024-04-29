import { RunConfig } from "@empiricalrun/types";
import { modelExecutor, assistantExecutor } from "./model";
import { Transformer } from "./interface";
import { getScriptExecutor } from "./script";

export const getTransformer = (
  runConfig: RunConfig,
): Transformer | undefined => {
  if (runConfig.type === "model") {
    return modelExecutor;
  } else if (runConfig.type === "py-script") {
    return getScriptExecutor(runConfig);
  } else if (runConfig.type === "assistant") {
    return assistantExecutor;
  }
};
