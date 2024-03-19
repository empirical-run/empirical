import { Parser, Select } from "node-sql-parser";
import { Scorer } from "../../interface/scorer";

export const syntaxName = "sql-syntax";
export const semanticName = "sql-semantic";

//TODO: make this config driven
const parserOpt = { database: "sqlite" };

export const checkSqlSyntax: Scorer = async (_, output) => {
  let isSQLQuery = false;
  let inValidSQLMsg = "SQL is invalid";
  const parser = new Parser();
  if (!output) {
    return {
      score: 0,
      name: syntaxName,
      message: "output is empty",
    };
  }
  try {
    parser.parse(output, parserOpt);
    isSQLQuery = true;
  } catch (e) {
    isSQLQuery = false;
  }
  return {
    score: isSQLQuery ? 1 : 0,
    name: syntaxName,
    message: isSQLQuery ? "" : inValidSQLMsg,
  };
};

export const checkSqlSemantic: Scorer = async (sample, output) => {
  const parser = new Parser();
  const expected = sample.expected!;
  if (!output) {
    return {
      score: 0,
      name: semanticName,
      message: "output is empty",
    };
  }
  try {
    const parsedOutput = parser.parse(cleanQuery(output), parserOpt);
    const parsedExpected = parser.parse(cleanQuery(expected), parserOpt);
    cleanColumns(parsedOutput.ast as Select);
    cleanColumns(parsedExpected.ast as Select);
    const isEquivalent =
      JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected);
    return {
      score: isEquivalent ? 1 : 0,
      name: semanticName,
      message: "",
    };
  } catch (err) {
    return {
      score: 0,
      name: semanticName,
      message: `${err}`,
    };
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
