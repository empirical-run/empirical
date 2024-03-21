import { Dataset, DatasetSampleInput } from "@empiricalrun/types";
import { red, green } from "picocolors";
import { promises as fs } from "fs";

async function downloadDataset(path: string): Promise<Dataset | undefined> {
  if (path.startsWith("http")) {
    const response = await fetch(path);
    const body = await response.text();
    return JSON.parse(body);
  } else {
    if (path.endsWith("json")) {
      // This assumes the json is a well-formed Empirical dataset
      const data = await fs.readFile(path);
      return JSON.parse(data.toString());
    } else if (path.endsWith("jsonl")) {
      // This assumes the jsonl has 1 set of inputs per line
      // and builds up the Empirical dataset format
      const data = await fs.readFile(path);
      const lines = data.toString().split("\n");
      let samples = [];
      for (let [index, line] of lines.entries()) {
        if (line.length === 0) {
          continue;
        }
        try {
          const parsedLine = JSON.parse(line);
          const inputs: DatasetSampleInput[] = Object.keys(parsedLine).map(
            (key) => ({ name: key, value: parsedLine[key] }),
          );
          samples.push({ id: index.toString(), inputs: inputs });
        } catch (error) {
          console.log(
            `${red("[Error]")} Failed to parse line in ${path}: ${line}`,
          );
        }
      }
      return { id: path, samples: samples };
    }
  }
}

export async function loadDataset(dsConfig: any): Promise<Dataset | undefined> {
  let dataset = dsConfig;
  if (dsConfig.path && !dsConfig.samples) {
    try {
      const downloaded = await downloadDataset(dsConfig.path);
      if (downloaded) {
        dataset.samples = downloaded.samples?.splice(0, 2);
        console.log(
          `${green("[Success]")} Dataset fetched from ${dsConfig.path}`,
        );
      }
    } catch (error) {
      console.log(
        `${red("[Error]")} Failed to fetch dataset at ${dsConfig.path}`,
      );
      return;
    }
  }
  return dataset;
}
