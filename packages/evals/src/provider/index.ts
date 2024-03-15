import { Scorer } from "../interface/scorer";
import { isJSON, name as JSONScorerName } from "./deterministic/is-json";

const map = new Map<string, Scorer>([[JSONScorerName, isJSON]]);

export default function getScorer({
  type,
}: {
  type: string;
}): Scorer | undefined {
  return map.get(type);
}
