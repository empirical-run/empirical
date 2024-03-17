import { Dataset } from "@empiricalrun/types";

export async function downloadDataset(
  path: string,
): Promise<Dataset | undefined> {
  if (path.startsWith("http")) {
    const response = await fetch(path);
    const body = await response.text();
    return JSON.parse(body);
  }
  // TODO: starts with file or is relative path
  // get inputs from the file - put them in a dataset object and return that
}

export async function loadDataset(datasetConfig: any): Promise<Dataset> {
  let dataset = datasetConfig;
  if (datasetConfig.path && !datasetConfig.samples) {
    const downloaded = await downloadDataset(datasetConfig.path);
    dataset.samples = downloaded?.samples;
  }
  return dataset;
}
