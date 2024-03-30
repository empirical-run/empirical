import { Dataset, DatasetSample } from "@empiricalrun/types";
import { red, green } from "picocolors";
import { promises as fs } from "fs";

type LoaderFunction = (contents: string) => Dataset;

function jsonLoader(contents: string): Dataset {
  return JSON.parse(contents);
}

// TODO: humaneval inputs not loading - check why?
function jsonlLoader(contents: string): Dataset {
  // This assumes the jsonl has 1 set of inputs per line
  // and builds up the Empirical dataset format
  const lines = contents.split("\n");
  let samples: DatasetSample[] = [];
  for (let [index, line] of lines.entries()) {
    if (line.length === 0) {
      continue;
    }
    try {
      const inputs = JSON.parse(line);
      samples.push({ id: index.toString(), inputs: inputs });
    } catch (error) {
      console.log(`${red("[Error]")} Failed to parse line: ${line}`);
    }
  }
  return { id: "1", samples: samples };
}

let loaders = new Map<string, LoaderFunction>([
  ["jsonl", jsonlLoader],
  ["json", jsonLoader],
]);

async function parseDataset(
  path: string,
  contents: string,
): Promise<Dataset | undefined> {
  const extension = path.split(".").pop();

  if (extension && loaders.has(extension)) {
    const loaderFn = loaders.get(extension)!;
    // const dataset = await
    // await addSampleIds(dataset);
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

async function addSampleIds(dataset: Dataset) {
  if (dataset.samples) {
    dataset.samples.forEach((sample, index) => {
      if (!sample.id) sample.id = (index + 1).toString();
    });
  }
}

export async function loadDataset(dsConfig: any): Promise<Dataset | undefined> {
  let dataset = { ...dsConfig };
  if (dsConfig.path && !dsConfig.samples) {
    try {
      const contents = await fetchContents(dsConfig.path);
      const parsed = await parseDataset(dsConfig.path, contents);
      if (parsed) {
        dataset.samples = parsed.samples;
        console.log(
          `${green("[Success]")} Dataset fetched from ${dsConfig.path}`,
        );
      }
    } catch (error) {
      console.log(
        `${red("[Error]")} Failed to fetch dataset at ${dsConfig.path}\nError: ${error}`,
      );
      return;
    }
  }
  await addSampleIds(dataset);
  return dataset;
}
