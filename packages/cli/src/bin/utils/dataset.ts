import { DatasetSample } from "@empiricalrun/types";
import { red } from "picocolors";
import crypto from "crypto";

type LoaderFunction = (contents: string) => DatasetSample[];

function jsonLoader(contents: string): DatasetSample[] {
  const parsed = JSON.parse(contents);
  const oldSamples = parsed.samples;
  // Converting old format to the new format (for Spider example)
  return oldSamples.map((sample: any, index: number) => {
    const inputs = sample.inputs.reduce((agg: any, i: any) => {
      return {
        ...agg,
        [i.name]: i.value,
      };
    }, {});
    return {
      id: sample.id || (index + 1).toString(),
      expected: sample.expected?.value || "",
      inputs,
    };
  });
}

function jsonlLoader(contents: string): DatasetSample[] {
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
      samples.push({ id: (index + 1).toString(), inputs: inputs });
    } catch (error) {
      console.log(`${red("[Error]")} Failed to parse line: ${line}`);
    }
  }
  return samples;
}

export const loaders = new Map<string, LoaderFunction>([
  ["jsonl", jsonlLoader],
  ["json", jsonLoader],
]);

export function hashContents(contents: string) {
  return crypto.createHash("md5").update(contents).digest("hex");
}
