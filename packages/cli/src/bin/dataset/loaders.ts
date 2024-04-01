import { DatasetSample } from "@empiricalrun/types";
import crypto from "crypto";
import { DatasetError, DatasetErrorEnum } from "../../error";

type LoaderFunction = (contents: string) => DatasetSample[];

function jsonLoader(contents: string): DatasetSample[] {
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

function jsonlLoader(contents: string): DatasetSample[] {
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

export const loaders = new Map<string, LoaderFunction>([
  ["jsonl", jsonlLoader],
  ["json", jsonLoader],
]);

export function hashContents(contents: string) {
  return crypto.createHash("md5").update(contents).digest("hex");
}
