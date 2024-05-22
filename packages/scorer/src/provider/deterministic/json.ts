import { RunOutput, Score } from "@empiricalrun/types";

export const name = "json-syntax";

export const isJson = async ({
  output,
}: {
  output: RunOutput;
}): Promise<Score[]> => {
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
