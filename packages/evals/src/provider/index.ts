import { Scorer } from "../interface/scorer";
import { isJson, name as jsonName } from "./deterministic/json";
import { scoreWithScript, name as scriptName } from "./deterministic/script";
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
  [scriptName, scoreWithScript],
]);

export default function getScorer({
  type,
}: {
  type: string;
}): Scorer | undefined {
  return map.get(type);
}
