import { Dataset, DatasetSample } from "@empiricalrun/types";
import { red } from "picocolors";
import crypto from "crypto";

type LoaderFunction = (contents: string) => Dataset;

function jsonLoader(contents: string): Dataset {
  // TODO: fix this since we've changed the format
  return JSON.parse(contents);
}

function jsonlLoader(contents: string): Dataset {
  // This assumes the jsonl has 1 set of inputs per line
  // and builds up the Empirical dataset format
  const lines = contents.split("\n");
  let samples: DatasetSample[] = [];
  for (let [index, line] of lines.entries()) {
    if (index > 5) break;
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

export const loaders = new Map<string, LoaderFunction>([
  ["jsonl", jsonlLoader],
  ["json", jsonLoader],
]);

export function hashContents(contents: string) {
  return crypto.createHash("md5").update(contents).digest("hex");
}
