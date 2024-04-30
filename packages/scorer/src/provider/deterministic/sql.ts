import { Parser } from "node-sql-parser";
import { ScoringFn } from "../../interface/scorer";

export const syntaxName = "sql-syntax";

export const checkSqlSyntax: ScoringFn = async ({ output }) => {
  let isSQLQuery = false;
  let errorMsg = "SQL is invalid";
  const parser = new Parser();
  if (!output || !output.value) {
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
