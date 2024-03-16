import { Scorer } from "../interface/scorer";
import { isJson, name as jsonName } from "./deterministic/json";
import {
  syntaxName,
  checkSqlSyntax,
  semanticName,
  checkSqlSemantic,
} from "./deterministic/sql";
import { name as llmName, checkLlmCriteria } from "./model-graded/llm";

const map = new Map<string, Scorer>([
  [jsonName, isJson],
  [syntaxName, checkSqlSyntax],
  [semanticName, checkSqlSemantic],
  [llmName, checkLlmCriteria],
]);

export default function getScorer({
  type,
}: {
  type: string;
}): Scorer | undefined {
  return map.get(type);
}
