import {
  Dataset,
  RunConfig,
  RunCompletion,
  RunSampleOutput,
  Score,
  RunUpdateType,
} from "@empiricalrun/types";
import { generateHex } from "../../utils";
import score from "@empiricalrun/scorer";
import { getTransformer } from "./transformers";

function generateRunId(): string {
  return generateHex(4);
}

export async function execute(
  runConfig: RunConfig,
  dataset: Dataset,
  progressCallback?: (sample: RunUpdateType) => void,
): Promise<RunCompletion> {
  const runCreationDate = new Date();
  const runId = generateRunId();
  const { scorers } = runConfig;
  const completionsPromises: Promise<RunSampleOutput>[] = [];
  const sampleCompletions: RunSampleOutput[] = [];
  // TODO: move this metadata creation logic to single place
  progressCallback?.({
    type: "run_metadata",
    data: {
      run_config: runConfig,
      id: runId,
      dataset_config: {
        id: dataset.id,
      },
      created_at: runCreationDate,
    },
  });
  for (const datasetSample of dataset.samples) {
    const transform = getTransformer(runConfig);
    if (transform) {
      // if llm error then add to the completion object but if something else throw error and stop the run
      completionsPromises.push(
        transform(runConfig, datasetSample)
          .then(({ output, error }) => {
            const data: RunSampleOutput = {
              inputs: datasetSample.inputs,
              output,
              dataset_sample_id: datasetSample.id || "",
              created_at: new Date(),
              error,
              run_id: runId,
            };
            return data;
          })
          .then((sample) => {
            try {
              progressCallback?.({
                type: "run_sample",
                data: sample,
              });
            } catch (e) {
              console.warn(e);
            }
            return sample;
          })
          .then(async (sample: RunSampleOutput) => {
            let scores: Score[] = [];
            if (scorers && scorers.length) {
              scores = await score({
                sample: datasetSample!,
                output: sample.output,
                scorers,
                options: {
                  pythonPath: runConfig.parameters?.pythonPath,
                },
              });
            }
            sample.scores = scores;
            return sample;
          })
          .then((sample) => {
            try {
              progressCallback?.({
                type: "run_sample_score",
                data: {
                  run_id: sample.run_id,
                  sample_id: sample.id,
                  dataset_sample_id: sample.dataset_sample_id,
                  scores: sample.scores || [],
                },
              });
            } catch (e) {
              console.warn(e);
            }
            sampleCompletions.push(sample);
            return sample;
          }),
      );
    }
  }

  await Promise.allSettled(completionsPromises);

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
