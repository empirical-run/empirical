import { RunConfig } from "@empiricalrun/types";
import { modelExecutor, setModelDefaults } from "./model";
import { assistantExecutor, getAssistantDefaults } from "./assistant";
import { Transformer } from "./interface";
import { getScriptExecutor, setPyScriptDefaults } from "./script";

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

export const setDefaults = async (
  runConfig: RunConfig,
  runId: string,
): Promise<RunConfig> => {
  let updatedRunConfig = { ...runConfig };
  if (updatedRunConfig.type === "assistant") {
    updatedRunConfig = await getAssistantDefaults(updatedRunConfig);
  } else if (updatedRunConfig.type === "model") {
    updatedRunConfig = await setModelDefaults(updatedRunConfig);
  } else if (updatedRunConfig.type === "py-script") {
    updatedRunConfig = await setPyScriptDefaults(updatedRunConfig);
  }
  updatedRunConfig.name = `Run #${runId}: ${updatedRunConfig.name}`;
  return updatedRunConfig;
};
