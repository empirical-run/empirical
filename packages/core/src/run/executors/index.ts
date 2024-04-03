import { RunConfig } from "@empiricalrun/types";
import { modelExecutor } from "./model";
import { Executor } from "./interface";
import { scriptExecutor } from "./script";

export const getExecutor = (runConfig: RunConfig): Executor | undefined => {
  if (runConfig.type === "model") {
    return modelExecutor;
  } else if (runConfig.type === "py-script") {
    return scriptExecutor;
  }
};
