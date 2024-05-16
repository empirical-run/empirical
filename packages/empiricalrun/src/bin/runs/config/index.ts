import { EmpiricalrunConfig } from "@empiricalrun/types";
import { config as OpenAIRunsConfig } from "./defaults";

export enum DefaultRunsConfigType {
  DEFAULT = "default",
}

const map = new Map<DefaultRunsConfigType, EmpiricalrunConfig>([
  [DefaultRunsConfigType.DEFAULT, OpenAIRunsConfig],
]);

export const getDefaultRunsConfig = (
  name: DefaultRunsConfigType,
): EmpiricalrunConfig => {
  if (map.has(name)) {
    return { ...map.get(name)! };
  } else {
    throw new Error(`No default runs config named "${name}".`);
  }
};
