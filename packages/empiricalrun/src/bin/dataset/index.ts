import { DatasetConfig, DatasetSample } from "@empiricalrun/types";
import { promises as fs } from "fs";
import { loaders, LoaderType } from "./loaders";
import { DatasetError, DatasetErrorEnum } from "../error";
import { fetchWithRetry } from "@empiricalrun/fetch";

const googleSheetIdentifier = "https://docs.google.com/spreadsheets/d/";

async function parseDataset(
  path: string,
  contents: string,
): Promise<DatasetSample[] | undefined> {
  //TODO: fix this file support check
  const extension = path.startsWith(googleSheetIdentifier)
    ? LoaderType.csv
    : path.split(".").pop();

  if (extension && loaders.has(extension)) {
    const loaderFn = loaders.get(extension)!;
    const dataset = await loaderFn(contents);
    return dataset;
  } else {
    throw new DatasetError(
      DatasetErrorEnum.UNSUPPORTED_FILE_EXTENSION,
      `Unsupported file extension for path: ${path}`,
    );
  }
}

async function fetchContents(path: string): Promise<string> {
  try {
    if (path.startsWith(googleSheetIdentifier)) {
      const documentId = path.replace(googleSheetIdentifier, "").split("/")[0];
      const fetchPath = `${googleSheetIdentifier}${documentId}/export?format=csv`;
      // extract hash params from URL
      const pathUrl = new URL(path.replaceAll("#", "?"));
      const fetchUrl = new URL(fetchPath);
      pathUrl.searchParams.forEach((value, name) =>
        fetchUrl.searchParams.append(name, value),
      );
      const resp = await fetchWithRetry(fetchUrl.toString());
      return await resp.text();
    } else if (path.startsWith("http")) {
      const response = await fetchWithRetry(path);
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

export async function loadDataset(
  config: DatasetConfig,
): Promise<{ samples: DatasetSample[] }> {
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
    samples = (await parseDataset(config.path, contents)) || samples;
    if (samples && config.group_by) {
      const updatedSamples: DatasetSample[] = [];
      for (const idx in samples) {
        const sample = samples[idx]!;
        const updateIdx = updatedSamples.findIndex((s) => {
          return (
            s.inputs[0][config.group_by!] === sample.inputs[config.group_by!]
          );
        });
        if (updateIdx < 0) {
          updatedSamples.push({
            ...sample,
            inputs: [sample.inputs],
          });
        } else {
          (updatedSamples[updateIdx]?.inputs as any[]).push(sample.inputs);
        }
      }
      samples = updatedSamples;
    }
  } else {
    throw new DatasetError(
      DatasetErrorEnum.INVALID_CONFIG,
      `One of dataset.path or dataset.samples must be defined in the config`,
    );
  }

  return {
    samples,
  };
}
