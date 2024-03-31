import { Dataset, DatasetConfig, DatasetSample } from "@empiricalrun/types";
import { promises as fs } from "fs";
import { loaders, hashContents } from "./loaders";
import { DatasetError, DatasetErrorEnum } from "../../error";

function parseDataset(
  path: string,
  contents: string,
): DatasetSample[] | undefined {
  const extension = path.split(".").pop();

  if (extension && loaders.has(extension)) {
    const loaderFn = loaders.get(extension)!;
    return loaderFn(contents);
  } else {
    throw new DatasetError(
      DatasetErrorEnum.UNSUPPORTED_FILE_EXTENSION,
      `No loader for file extension: ${extension}`,
    );
  }
}

async function fetchContents(path: string): Promise<string> {
  try {
    if (path.startsWith("http")) {
      const response = await fetch(path);
      return await response.text();
    } else {
      const data = await fs.readFile(path);
      return data.toString();
    }
  } catch (e) {
    throw new DatasetError(
      DatasetErrorEnum.FETCH_FAILED,
      `Dataset fetch from ${path} failed with error: ${(e as Error).message}`,
    );
  }
}

export async function loadDataset(config: DatasetConfig): Promise<Dataset> {
  let samples: DatasetSample[] = [];
  let contents: string;

  if ("samples" in config) {
    contents = JSON.stringify(config.samples);
    samples = config.samples.map((sample, index) => ({
      ...sample,
      id: sample.id || `${index + 1}`,
    }));
  } else if ("path" in config) {
    contents = await fetchContents(config.path); // wrap and throw if fetching fails
    const parsed = parseDataset(config.path, contents);
    if (parsed) {
      samples = parsed;
    }
  } else {
    throw new DatasetError(
      DatasetErrorEnum.INVALID_CONFIG,
      `One of dataset.path or dataset.samples must be defined in the config`,
    );
  }

  return {
    id: hashContents(contents),
    samples,
  };
}
