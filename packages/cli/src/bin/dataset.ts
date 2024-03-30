import { Dataset, DatasetConfig, DatasetSample } from "@empiricalrun/types";
import { red } from "picocolors";
import { promises as fs } from "fs";
import { loaders, hashContents } from "./utils/dataset";

function parseDataset(path: string, contents: string): Dataset | undefined {
  const extension = path.split(".").pop();

  if (extension && loaders.has(extension)) {
    const loaderFn = loaders.get(extension)!;
    return loaderFn(contents);
  } else {
    throw new Error(`${extension} files are not supported.`);
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

// async function addSampleIds(dataset: Dataset) {
//   if (dataset.samples) {
//     dataset.samples.forEach((sample, index) => {
//       if (!sample.id) sample.id = (index + 1).toString();
//     });
//   }
// }

export async function loadDataset(
  config: DatasetConfig,
): Promise<Dataset | undefined> {
  // let dataset = { ...config };
  let samples: DatasetSample[] = [];

  let contents: string;
  if (!config.path && config.samples) {
    samples = config.samples.map((sample, index) => ({
      ...sample,
      id: sample.id || (index + 1).toString(),
    }));
    contents = JSON.stringify(config.samples);
  } else if (config.path && !config.samples) {
    contents = await fetchContents(config.path);

    try {
      const parsed = parseDataset(config.path, contents);
      if (parsed) {
        // TODO: add sample ids
        samples = parsed.samples;
      }
    } catch (error) {
      console.log(
        `${red("[Error]")} Failed to fetch dataset at ${config.path}\nError: ${error}`,
      );
      return;
    }
  } else {
    throw new Error(`Path or samples must be defined in the dataset config.`);
  }

  // Check if this is a known dataset from what we have
  // parsed already
  return {
    id: config.id || hashContents(contents),
    samples,
  };

  // try {
  //   const contents = await fetchContents(config.path);
  //   console.log(hashContents(contents));
  //   const parsed = parseDataset(config.path, contents);
  //   if (parsed) {
  //     dataset.samples = parsed.samples;
  //     console.log(`${green("[Success]")} Dataset fetched from ${config.path}`);
  //   }
  // }
  // await addSampleIds(dataset);
  // return dataset;
}
