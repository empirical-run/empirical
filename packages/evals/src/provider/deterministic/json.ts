import { Scorer } from "../../interface/scorer";

export const name = "is-json";

export const isJson: Scorer = async (_, output) => {
  let isValid = false;
  let invalidMsg = "JSON is invalid";
  try {
    JSON.parse(output);
    isValid = true;
  } catch (e) {
    isValid = false;
  }
  return {
    score: isValid ? 1 : 0,
    name,
    message: isValid ? "" : invalidMsg,
  };
};
