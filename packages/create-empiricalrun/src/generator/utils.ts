import path from "path";
import { CACHE_DIR } from "../constant";
import fs from "fs/promises";

export const generateGitIgnore = async (dir: string) => {
  const gitIgnoreFullPath = `${dir}/.gitignore`;
  await fs.appendFile(
    gitIgnoreFullPath,
    `\n# Ignore outputs from Empirical\n${CACHE_DIR}\n`,
  );
};

export const isPackageJSONPresent = async (dir: string): Promise<boolean> => {
  let isPresent = false;
  try {
    const packageJSONPath = path.join(dir, "package.json");
    await fs.access(packageJSONPath);
    isPresent = true;
  } catch (err) {
    isPresent = false;
  }
  return isPresent;
};

export const copyConfigFile = async ({
  source,
  target,
}: {
  source: {
    file: string;
    dir: string;
  };
  target: {
    file: string;
    dir: string;
  };
}) => {
  if (!source || !target) {
    throw Error("Source and target are required for file to copy");
  }
  const sourceFilePath = path.join(source.dir, source.file);
  const targetFilePath = path.join(target.dir, target.file);
  await fs.copyFile(sourceFilePath, targetFilePath);
};
