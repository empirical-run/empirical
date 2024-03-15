import { getProvider } from "../models/providers";
import { Dataset, Run } from "@empiricalrun/types";
import { replacePlaceholders } from "../utils";
import score from "@empiricalrun/evals";

export async function execute(run: Run, dataset: Dataset) {
  const { prompt, assert, model } = run;
  if (model && prompt) {
    // TODO: modelName and completion function should be extracted from different function
    //@ts-ignore
    const { modelName, completionFunction } = getProvider(model);
    for (const datasetSample of dataset.samples) {
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
      console.log(completion);
      const output = completion.message.content;
      console.log(output);
      const evaluationScores = await score({
        inputs: datasetSample.inputs,
        output,
        expected: datasetSample.expected,
        assert: assert,
      });
      console.log(evaluationScores);
    }
  }
}
