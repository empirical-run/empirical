import { expect, test } from "vitest";
import { checkSqlSyntax } from "./sql";

test("sql-syntax works with backticks", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: {} },
      output: {
        value: "SELECT `column` FROM `table`",
      },
      config: {
        type: "sql-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-syntax",
      message: "Output is valid SQL",
    },
  ]);
});

test("sql-syntax fails with empty output", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: {} },
      output: {
        value: "",
      },
      config: {
        type: "sql-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 0,
      name: "sql-syntax",
      message: "Output is empty",
    },
  ]);
});

test("sql-syntax works with markdown", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: {} },
      output: { value: "```SELECT table * FROM" },
      config: {
        type: "sql-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 0,
      name: "sql-syntax",
      message:
        'Expected "#", "$", "(", "+", "-", "--", "/*", ";", "@", "@@", "ALTER", "CALL", "CREATE", "DELETE", "DESC", "DESCRIBE", "DROP", "GO", "GRANT", "INSERT", "LOCK", "RENAME", "REPLACE", "SELECT", "SET", "SHOW", "TRUNCATE", "UNLOCK", "UPDATE", "USE", "WITH", "return", [ \\t\\n\\r], [0-9], [A-Za-z_], or end of input but "`" found.',
    },
  ]);
});

test("sql-syntax works with a correct query", async () => {
  const query = `SELECT name, capacity 
FROM stadium 
WHERE stadium_id = (
    SELECT stadium_id 
    FROM concert 
    WHERE year > 2013 
    GROUP BY stadium_id 
    ORDER BY COUNT(concert_id) DESC 
    LIMIT 1
);`;
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: {} },
      output: {
        value: query,
      },
      config: {
        type: "sql-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-syntax",
      message: "Output is valid SQL",
    },
  ]);
});
