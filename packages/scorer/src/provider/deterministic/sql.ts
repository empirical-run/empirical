import { Parser } from "node-sql-parser";
import { ScoringFn } from "../../interface/scorer";
import { extractTargetFromOutput } from "../../util";

export const syntaxName = "sql-syntax";

export const checkSqlSyntax: ScoringFn = async ({ output }) => {
  let isSQLQuery = false;
  let errorMsg = "SQL is invalid";
  const parser = new Parser();
  const target = extractTargetFromOutput(output);
  if (!target) {
    return [
      {
        score: 0,
        name: syntaxName,
        message: "Output is empty",
      },
    ];
  }
  try {
    parser.parse(output.value!);
    isSQLQuery = true;
  } catch (e: any) {
    isSQLQuery = false;
    errorMsg = e.message;
  }
  return [
    {
      score: isSQLQuery ? 1 : 0,
      name: syntaxName,
      message: isSQLQuery ? "Output is valid SQL" : errorMsg,
    },
  ];
};
