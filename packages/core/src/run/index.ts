import {
  DatasetSample,
  Run,
  RunCompletion,
  RunOutputSample,
} from "@empiricalrun/types";
import { generateHex, replacePlaceholders } from "../utils";
import { EmpiricalAI } from "@empiricalrun/ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import score from "@empiricalrun/evals";

export async function execute(
  run: Run,
  samples: DatasetSample[],
  progressCallback: () => void,
): Promise<RunCompletion> {
  const { prompt, assert, model } = run;
  const runCreationDate = new Date();
  const sampleCompletions: RunOutputSample[] = [];
  const runId = generateHex(4);

  if (model && prompt) {
    // TODO: move this logic to cli
    const [providerName, modelName] = model.split(":");
    const ai = new EmpiricalAI(providerName);
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
          .create({
            model: modelName!,
            messages,
          })
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
    if (assert && assert.length) {
      for (const s of sampleCompletions) {
        (function (sampleCompletion) {
          evalPromises.push(
            score({
              sample: datasetMap.get(sampleCompletion.dataset_sample_id)!,
              output: sampleCompletion.output,
              assertions: assert,
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
    name: run.name,
    dataset_id: "", // TODO
    assert,
    model,
    prompt,
    samples: sampleCompletions,
    created_at: runCreationDate,
  };
}
