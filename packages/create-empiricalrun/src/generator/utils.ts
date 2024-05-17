import { CACHE_DIR } from "../constant";
import fs from "fs/promises";

export const generateGitIgnore = async (dir: string) => {
  const gitIgnoreFullPath = `${dir}/.gitignore`;
  await fs.appendFile(
    gitIgnoreFullPath,
    `\n# Ignore outputs from Empirical\n${CACHE_DIR}\n`,
  );
};
