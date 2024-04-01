import { RunCompletion, Dataset } from "@empiricalrun/types";
import { markdownSummary, failedOutputsSummary } from "../stats";
import { promises as fs } from "fs";

async function prepareOutputForPRComment(
  completion: RunCompletion[],
  dataset: Dataset,
) {
  if (process.env.GITHUB_OUTPUT) {
    const failedOutputs = failedOutputsSummary(completion);
    let failedSummary = "";

    if (failedOutputs) {
      const { code, message } = failedOutputs;
      failedSummary = `**Error**: Some outputs were not generated successfully\n${code}: ${message}`;
    }

    const datasetLength = `Total dataset samples: ${dataset.samples?.length || 0}`;
    // Multiline output
    // https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#multiline-strings
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `result<<EOF\n${markdownSummary(completion)}\n${datasetLength}\n${failedSummary}\nEOF`,
    );
  }
}

export async function reportOnCI(
  completion: RunCompletion[],
  dataset: Dataset,
) {
  if (process.env.GITHUB_ACTIONS === "true") {
    await prepareOutputForPRComment(completion, dataset);
  }
}
