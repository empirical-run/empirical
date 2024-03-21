import {
  DatasetSample,
  IRunConfig,
  RunCompletion,
  RunOutputSample,
} from "@empiricalrun/types";
import { generateHex } from "../utils";
import { EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import score from "@empiricalrun/evals";

export async function execute(
  run: IRunConfig,
  samples: DatasetSample[],
  progressCallback: () => void,
): Promise<RunCompletion> {
  const runCreationDate = new Date();
  const sampleCompletions: RunOutputSample[] = [];
  const runId = generateHex(4);

  if (run.type === "model") {
    // TODO: move this logic to cli
    const { prompt, asserts, model, provider } = run;
    const ai = new EmpiricalAI(provider);
    const completionsPromises = [];
    for (const datasetSample of samples) {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: replacePlaceholders(
            prompt as string,
            datasetSample.inputs.reduce((agg, i) => {
              return {
                ...agg,
                [i.name]: i.value,
              };
            }, {}),
          ),
        },
      ];

      // TODO: handle promise rejection due to error
      // if llm error then add to the completion object but if something else throw error and stop the run
      completionsPromises.push(
        ai.chat.completions
          .create({ model, messages })
          .then((completion) => {
            const output = completion.choices[0]?.message.content;
            progressCallback();
            sampleCompletions.push({
              inputs: datasetSample.inputs,
              output,
              dataset_sample_id: datasetSample.id || "",
              created_at: new Date(),
              run_id: runId,
            });
          })
          .catch((e) => {
            console.log(e);
          }),
      );
    }
    if (completionsPromises.length) {
      await Promise.allSettled(completionsPromises);
    }

    const datasetMap = samples.reduce((agg, sample) => {
      agg.set(sample.id, sample);
      return agg;
    }, new Map<string, DatasetSample>());
    const evalPromises = [];
    if (asserts && asserts.length) {
      for (const s of sampleCompletions) {
        (function (sampleCompletion) {
          evalPromises.push(
            score({
              sample: datasetMap.get(sampleCompletion.dataset_sample_id)!,
              output: sampleCompletion.output,
              assertions: asserts,
            }).then((scores) => {
              sampleCompletion.scores = scores;
            }),
          );
        })(s);
      }
    }
    if (evalPromises.length) {
      await Promise.allSettled(evalPromises);
    }
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
