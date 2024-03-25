import {
  DatasetSample,
  IRunConfig,
  RunCompletion,
  RunOutputSample,
} from "@empiricalrun/types";
import { generateHex } from "../utils";
import score from "@empiricalrun/scorer";
import { getExecutor } from "./executors";

export async function execute(
  run: IRunConfig,
  samples: DatasetSample[],
  progressCallback: () => void,
): Promise<RunCompletion> {
  const runCreationDate = new Date();
  const sampleCompletions: RunOutputSample[] = [];
  const runId = generateHex(4);
  const { scorers } = run;
  const completionsPromises = [];
  for (const datasetSample of samples) {
    const executor = getExecutor(run);
    if (executor) {
      // TODO: handle promise rejection due to error
      // if llm error then add to the completion object but if something else throw error and stop the run
      completionsPromises.push(
        executor(run, datasetSample)
          .then(({ output, error, metadata }) => {
            if (error) {
              console.warn(
                `[${error.message}]`,
                "Failed to fetch output for sample id::",
                datasetSample.id,
              );
              console.warn(error.message);
            }
            sampleCompletions.push({
              inputs: datasetSample.inputs,
              output: {
                value: output,
                metadata,
              },
              dataset_sample_id: datasetSample.id || "",
              created_at: new Date(),
              error,
              run_id: runId,
            });
          })
          .finally(() => progressCallback()),
      );
    }
  }
  if (completionsPromises.length) {
    await Promise.allSettled(completionsPromises);
  }

  const datasetMap = samples.reduce((agg, sample) => {
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
              pythonPath: run.type === "py-script" ? run.pythonPath : undefined,
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
    run_config: run,
    dataset_config: {
      id: "", // TODO
    },
    samples: sampleCompletions,
    created_at: runCreationDate,
  };
}
