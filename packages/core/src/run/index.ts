import {
  Dataset,
  DatasetSample,
  RunConfig,
  RunCompletion,
  RunOutputSample,
} from "@empiricalrun/types";
import { generateHex } from "../utils";
import score from "@empiricalrun/scorer";
import { getExecutor } from "./executors";

export function generateRunId(): string {
  return generateHex(4);
}

export async function execute(
  runConfig: RunConfig,
  dataset: Dataset,
  progressCallback?: (sample: RunOutputSample) => void,
): Promise<RunCompletion> {
  const runCreationDate = new Date();
  const sampleCompletions: RunOutputSample[] = [];
  const runId = generateRunId();
  const { scorers } = runConfig;
  const completionsPromises = [];
  for (const datasetSample of dataset.samples) {
    const executor = getExecutor(runConfig);
    if (executor) {
      // if llm error then add to the completion object but if something else throw error and stop the run
      completionsPromises.push(
        executor(runConfig, datasetSample).then(({ output, error }) => {
          const sample: RunOutputSample = {
            inputs: datasetSample.inputs,
            output,
            dataset_sample_id: datasetSample.id || "",
            created_at: new Date(),
            error,
            run_id: runId,
          };

          sampleCompletions.push(sample);

          try {
            progressCallback?.(sample);
          } catch (e) {
            console.warn(e);
          }

          return sample;
        }),
      );
    }
  }
  if (completionsPromises.length) {
    await Promise.allSettled(completionsPromises);
  }

  const datasetMap = dataset.samples.reduce((agg, sample) => {
    agg.set(sample.id, sample);
    return agg;
  }, new Map<string, DatasetSample>());
  const scorerPromises = [];
  if (scorers && scorers.length) {
    for (const s of sampleCompletions) {
      (function (sampleCompletion) {
        scorerPromises.push(
          score({
            sample: datasetMap.get(sampleCompletion.dataset_sample_id)!,
            output: sampleCompletion.output,
            scorers,
            options: {
              pythonPath: runConfig.parameters?.pythonPath,
            },
          }).then((scores) => {
            sampleCompletion.scores = scores;
          }),
        );
      })(s);
    }
  }
  if (scorerPromises.length) {
    await Promise.allSettled(scorerPromises);
  }
  return {
    id: runId,
    run_config: {
      ...runConfig,
      name: runConfig.name || getDefaultRunName(runConfig, runId),
    },
    dataset_config: {
      id: dataset.id,
    },
    samples: sampleCompletions,
    created_at: runCreationDate,
  };
}

function getDefaultRunName(runConfig: RunConfig, id: string): string {
  let name = "";
  if (runConfig.type === "model") {
    name = runConfig.model;
  } else if (runConfig.type === "py-script" || runConfig.type === "js-script") {
    name = runConfig.path;
  }
  return `Run #${id}: ${name}`;
}
