import { Parser, Select } from "node-sql-parser";
import { ScoringFn } from "../../interface/scorer";

export const syntaxName = "sql-syntax";
export const semanticName = "sql-semantic";

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
      message: isSQLQuery ? "SQL is valid" : errorMsg,
    },
  ];
};

export const checkSqlSemantic: ScoringFn = async ({ sample, output }) => {
  const parser = new Parser();
  const expected = sample.expected!;
  if (!output) {
    return [
      {
        score: 0,
        name: semanticName,
        message: "output is empty",
      },
    ];
  }
  try {
    const parsedOutput = parser.parse(cleanQuery(output.value!));
    const parsedExpected = parser.parse(cleanQuery(expected));
    cleanColumns(parsedOutput.ast as Select);
    cleanColumns(parsedExpected.ast as Select);
    const isEquivalent =
      JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected);
    return [
      {
        score: isEquivalent ? 1 : 0,
        name: semanticName,
        message: "",
      },
    ];
  } catch (err) {
    return [
      {
        score: 0,
        name: semanticName,
        message: `${err}`,
      },
    ];
  }
};

function cleanQuery(q: string) {
  const re = /;$/; // used to remove semicolon
  return q.trim().replace(re, "");
}

function cleanColumns(ast: Select) {
  ast.columns.map((c) => {
    // Remove aliases
    if (c.as != null) {
      c.as = null;
    }
    return c;
  });
  return ast;
}
