import { Config } from "@empiricalrun/types";
import { config as OpenAIRunsConfig } from "./defaults";

export enum DefaultRunsConfigType {
  DEFAULT = "default",
}

const map = new Map<DefaultRunsConfigType, Config>([
  [DefaultRunsConfigType.DEFAULT, OpenAIRunsConfig],
]);

export const getDefaultRunsConfig = (name: DefaultRunsConfigType): Config => {
  if (map.has(name)) {
    return { ...map.get(name)! };
  } else {
    throw new Error(`No default runs config named "${name}".`);
  }
};
