import { getProvider } from "../models/providers";
import {
  DatasetSample,
  Run,
  RunCompletion,
  RunOutputSample,
} from "@empiricalrun/types";
import { generateHex, replacePlaceholders } from "../utils";
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
    // TODO: modelName and completion function should be extracted from different function
    //@ts-ignore
    const { modelName, completionFunction } = getProvider(model);
    for (const datasetSample of samples) {
      const messages = [
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
      // TODO: fix types of completion
      const completion = await completionFunction({
        model: modelName,
        messages,
      });
      const output = completion.message.content;
      const evaluationScores = await score({
        inputs: datasetSample.inputs,
        output,
        expected: datasetSample.expected,
        assert: assert,
      });
      progressCallback();
      sampleCompletions.push({
        inputs: datasetSample.inputs,
        output: completion.message.content,
        scores: evaluationScores,
        dataset_sample_id: datasetSample.id || "",
        created_at: new Date(),
        run_id: runId,
      });
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
