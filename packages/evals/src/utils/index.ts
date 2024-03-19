import { DatasetSampleInput } from "@empiricalrun/types";

export function inputsForReplacements(inputs: DatasetSampleInput[]) {
  return inputs.reduce((agg, i) => {
    return {
      ...agg,
      [i.name]: i.value,
    };
  }, {});
}

// TODO: placeholder replacemnet is duplicated across core and evals package
export function replacePlaceholders(string: string, obj: any) {
  return string.replace(/{{(\w+)}}/g, function (match, key) {
    return obj[key];
  });
}
