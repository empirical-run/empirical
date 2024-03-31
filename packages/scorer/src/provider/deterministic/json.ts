import { ScoringFn } from "../../interface/scorer";

export const name = "is-json";

export const isJson: ScoringFn = async ({ output, config }) => {
  if (config.type !== name) {
    return [
      {
        score: 0,
        name,
        message: "invalid type of scorer detected",
      },
    ];
  }
  let isValid = false;
  let invalidMsg = "JSON is invalid";
  if (output !== undefined && output !== null) {
    try {
      JSON.parse(output.value!);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  } else {
    isValid = false;
    invalidMsg = "Output is null or undefined";
  }

  return [
    {
      score: isValid ? 1 : 0,
      name,
      message: isValid ? "" : invalidMsg,
    },
  ];
};
