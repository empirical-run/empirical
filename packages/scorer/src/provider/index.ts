import { ScoringFn } from "../interface/scorer";
import { isJson, name as jsonName } from "./deterministic/json";
import {
  scoreWithPythonScript,
  name as scriptName,
} from "./deterministic/script";
import {
  syntaxName,
  checkSqlSyntax,
  semanticName,
  checkSqlSemantic,
} from "./deterministic/sql";
import { name as llmName, checkLlmCriteria } from "./model-graded/llm";

const map = new Map<string, ScoringFn>([
  [jsonName, isJson],
  [syntaxName, checkSqlSyntax],
  [semanticName, checkSqlSemantic],
  [llmName, checkLlmCriteria],
  [scriptName, scoreWithPythonScript],
]);

export default function getScoringFn({
  type,
}: {
  type: string;
}): ScoringFn | undefined {
  return map.get(type);
}
