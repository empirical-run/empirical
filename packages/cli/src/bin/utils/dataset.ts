import { DatasetSample } from "@empiricalrun/types";
import { red } from "picocolors";
import crypto from "crypto";

type LoaderFunction = (contents: string) => DatasetSample[];

// TODO: fix this since we've changed the format
// function jsonLoader(contents: string): Dataset {
//   return JSON.parse(contents);
// }

function jsonlLoader(contents: string): DatasetSample[] {
  // This assumes the jsonl has 1 set of inputs per line
  // and builds up the Empirical dataset format
  const lines = contents.split("\n");
  let samples: DatasetSample[] = [];
  for (let [index, line] of lines.entries()) {
    if (index > 5) break; // TODO: remove this sampling
    if (line.length === 0) {
      continue;
    }
    try {
      const inputs = JSON.parse(line);
      samples.push({ id: (index + 1).toString(), inputs: inputs });
    } catch (error) {
      console.log(`${red("[Error]")} Failed to parse line: ${line}`);
    }
  }
  return samples;
}

export const loaders = new Map<string, LoaderFunction>([
  ["jsonl", jsonlLoader],
  // ["json", jsonLoader],
]);

export function hashContents(contents: string) {
  return crypto.createHash("md5").update(contents).digest("hex");
}
