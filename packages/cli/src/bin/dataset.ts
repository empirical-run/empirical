import { Dataset, DatasetConfig, DatasetSample } from "@empiricalrun/types";
import { red } from "picocolors";
import { promises as fs } from "fs";
import { loaders, hashContents } from "./utils/dataset";

function parseDataset(
  path: string,
  contents: string,
): DatasetSample[] | undefined {
  const extension = path.split(".").pop();

  if (extension && loaders.has(extension)) {
    const loaderFn = loaders.get(extension)!;
    return loaderFn(contents);
  } else {
    throw new Error(`Unsupported file extension: ${extension}`);
  }
}

async function fetchContents(path: string): Promise<string> {
  if (path.startsWith("http")) {
    const response = await fetch(path);
    return await response.text();
  } else {
    const data = await fs.readFile(path);
    return data.toString();
  }
}

export async function loadDataset(
  config: DatasetConfig,
): Promise<Dataset | undefined> {
  let samples: DatasetSample[] = [];
  let contents: string;

  if (!config.path && config.samples) {
    contents = JSON.stringify(config.samples);
    samples = config.samples.map((sample, index) => ({
      ...sample,
      id: sample.id || (index + 1).toString(),
    }));
  } else if (config.path && !config.samples) {
    contents = await fetchContents(config.path);

    try {
      const parsed = parseDataset(config.path, contents);
      if (parsed) {
        samples = parsed;
      }
    } catch (error) {
      console.log(
        `${red("[Error]")} Failed to fetch dataset at ${config.path}\nError: ${error}`,
      );
      return;
    }
  } else {
    throw new Error(
      `dataset.path or dataset.samples must be defined in the config.`,
    );
  }

  // Check if this is a known dataset from what we have
  // parsed already
  return {
    id: config.id || hashContents(contents),
    samples,
  };
}
