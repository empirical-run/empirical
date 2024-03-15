import { Scorer } from "../../interface/scorer";

export const name = "is-json";

export const isJSON: Scorer = async (_, output) => {
  let isJSON = false;
  let inValidJSONMsg = "JSON is invalid";
  try {
    JSON.parse(output);
    isJSON = true;
  } catch (e) {
    console.log(e);
    isJSON = false;
  }
  return {
    score: isJSON ? 1 : 0,
    name,
    message: isJSON ? "" : inValidJSONMsg,
  };
};
