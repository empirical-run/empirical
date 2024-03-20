import { DatasetSampleInput } from "@empiricalrun/types";

export function inputsForReplacements(inputs: DatasetSampleInput[]) {
  return inputs.reduce((agg, i) => {
    return {
      ...agg,
      [i.name]: i.value,
    };
  }, {});
}
