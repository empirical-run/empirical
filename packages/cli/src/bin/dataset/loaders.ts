import { DatasetSample } from "@empiricalrun/types";
import crypto from "crypto";
import { DatasetError, DatasetErrorEnum } from "../../error";
import csv from "csvtojson";

type LoaderFunction = (contents: string) => Promise<DatasetSample[]>;

async function jsonLoader(contents: string): Promise<DatasetSample[]> {
  try {
    const parsed = JSON.parse(contents);
    return parsed.samples;
  } catch (e) {
    throw new DatasetError(
      DatasetErrorEnum.JSON_LOADER_FAILED,
      `Failed to parse JSON: ${(e as Error).message}`,
    );
  }
}

async function jsonlLoader(contents: string): Promise<DatasetSample[]> {
  // This assumes the jsonl has 1 set of inputs per line
  // and builds up the Empirical dataset format
  const lines = contents.split("\n");
  let samples: DatasetSample[] = lines
    .filter((line) => line.length)
    .map((line, index) => {
      try {
        const inputs = JSON.parse(line);
        return { id: `${index + 1}`, inputs };
      } catch (e) {
        throw new DatasetError(
          DatasetErrorEnum.JSONL_LOADER_FAILED,
          `Failed to parse JSONL at line ${index + 1}: ${(e as Error).message}`,
        );
      }
    });
  return samples;
}

async function csvLoader(contents: string): Promise<DatasetSample[]> {
  const emptyRowsRegexp = new RegExp(/^,*$/);
  const updatedContents = contents
    .split("\n")
    .map((s) => (emptyRowsRegexp.test(s.trim()) ? "" : s))
    .filter((s) => !!s)
    .join("\n");
  const data = await csv({ trim: true, ignoreEmpty: true }).fromString(
    updatedContents,
  );
  const samples = data.map((d, i) => {
    const sample: DatasetSample = {
      id: `${i + 1}`,
      inputs: d,
    };
    return sample;
  });
  return samples;
}

export enum LoaderType {
  "csv" = "csv",
  "json" = "json",
  "jsonl" = "jsonl",
}

export const loaders = new Map<string, LoaderFunction>([
  [LoaderType.jsonl, jsonlLoader],
  [LoaderType.json, jsonLoader],
  [LoaderType.csv, csvLoader],
]);

export function hashContents(contents: string) {
  return crypto.createHash("md5").update(contents).digest("hex");
}
