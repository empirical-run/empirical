import {
  Dataset,
  RunConfig,
  RunCompletion,
  RunSampleOutput,
  Score,
  RunUpdateType,
  RunMetadataUpdate,
  RunSampleUpdate,
  RunSampleScoreUpdate,
} from "@empiricalrun/types";
import { generateHex } from "../../utils";
import score from "@empiricalrun/scorer";
import { getTransformer } from "./transformers";
import { EmpiricalStore } from "../../store";

function generateRunId(): string {
  return generateHex(4);
}

export async function execute(
  runConfig: RunConfig,
  dataset: Dataset,
  progressCallback?: (sample: RunUpdateType) => void,
  store?: EmpiricalStore,
): Promise<RunCompletion> {
  const runCreationDate = new Date();
  const runId = generateRunId();
  const { scorers } = runConfig;
  const completionsPromises: Promise<RunSampleOutput>[] = [];
  const sampleCompletions: RunSampleOutput[] = [];
  // TODO: move this metadata creation logic to single place
  const updatedRunConfig = {
    ...runConfig,
    name: runConfig.name || getDefaultRunName(runConfig, runId),
  };
  const recorder = store?.getRunRecorder();
  const data: RunMetadataUpdate = {
    type: "run_metadata",
    data: {
      run_config: updatedRunConfig,
      id: runId,
      dataset_config: {
        id: dataset.id,
      },
      created_at: runCreationDate,
    },
  };
  recorder?.(data);
  progressCallback?.(data);
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
          .then(async (sample) => {
            try {
              const update: RunSampleUpdate = {
                type: "run_sample",
                data: sample,
              };
              progressCallback?.(update);
              await recorder?.(update);
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
          .then(async (sample) => {
            try {
              const data: RunSampleScoreUpdate = {
                type: "run_sample_score",
                data: {
                  run_id: sample.run_id,
                  sample_id: sample.id,
                  dataset_sample_id: sample.dataset_sample_id,
                  scores: sample.scores || [],
                },
              };
              progressCallback?.(data);
              await recorder?.(data);
            } catch (e) {
              console.warn(e);
            }
            sampleCompletions.push(sample);
            return sample;
          }),
      );
    }
  }

  await Promise.allSettled([...completionsPromises]);

  return {
    id: runId,
    run_config: updatedRunConfig,
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
