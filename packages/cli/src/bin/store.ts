import { Dataset, RunCompletion } from "@empiricalrun/types";
import { promises as fs } from "fs";

const cwd = process.cwd();
const datasetFileName = "dataset.json";
const cacheDir = ".empiricalrun";
const outputFilePath = (datasetId: string, runId: string) =>
  `${cwd}/${cacheDir}/${datasetId}/${runId}.json`;
const datasetFilePath = `${cwd}/${cacheDir}/${datasetFileName}`;

export class RunsFileStore {
  constructor() {}

  async storeDataset(dataset: Dataset) {
    await fs.mkdir(`${cwd}/${cacheDir}`, { recursive: true });
    await fs.writeFile(datasetFilePath, JSON.stringify(dataset, null, 2));
  }

  async storeRunsForDatasetId(runs: RunCompletion[], dataset: Dataset) {
    await fs.mkdir(`${cwd}/${cacheDir}/${dataset.id}`, { recursive: true });
    runs.forEach(async (run) => {
      await fs.writeFile(
        outputFilePath(dataset.id, run.id),
        JSON.stringify(run, null, 2),
      );
    });
  }

  async getResults() {
    const datasetData = await fs.readFile(datasetFilePath);
    const dataset: Dataset = JSON.parse(datasetData.toString());
    const runsDirPath = `${cwd}/${cacheDir}/${dataset.id}`;
    const files = await fs.readdir(runsDirPath);

    let promises = files.map(async (file) => {
      const data = await fs.readFile(`${runsDirPath}/${file}`);
      console.log(data.toString());
      return JSON.parse(data.toString());
    });

    return {
      runs: await Promise.all(promises),
      dataset,
    };
  }

  async getDatasetId(): Promise<string> {
    const datasetData = await fs.readFile(datasetFilePath);
    const dataset: Dataset = JSON.parse(datasetData.toString());
    return dataset.id;
  }

  async getRuns() {
    const datasetId = await this.getDatasetId();
    const runsDirPath = `${cwd}/${cacheDir}/${datasetId}`;
    const files = await fs.readdir(runsDirPath);
    return files.map((file) => {
      return { id: file.split(".")[0] };
    });
  }

  async getRunFilePath(runId: string) {
    const datasetId = await this.getDatasetId();
    const runFilePath = `${cwd}/${cacheDir}/${datasetId}/${runId}.json`;
    return runFilePath;
  }
}
