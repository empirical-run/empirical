import { expect, test } from "vitest";
import { checkSqlSyntax, checkSqlSemantic } from "./sql";

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

test("sql-semantic works with column aliases", async () => {
  expect(
    await checkSqlSemantic({
      sample: {
        id: "1",
        inputs: {},
        expected:
          "SELECT country, COUNT(*) as NumberOfSingers\nFROM singer\nGROUP BY country;",
      },
      output: {
        value: "SELECT country ,  count(*) FROM singer GROUP BY country",
      },
      config: {
        type: "sql-semantic",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-semantic",
      message: "",
    },
  ]);
});

test.fails("sql-semantic works with column reordering", async () => {
  expect(
    await checkSqlSemantic({
      sample: {
        id: "1",
        inputs: {},
        expected: "SELECT a + b, c, d",
      },
      output: { value: "SELECT a + b, d, c" },
      config: {
        type: "sql-semantic",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-semantic",
      message: "",
    },
  ]);
});

test.fails("sql-semantic works with explicit column names", async () => {
  expect(
    await checkSqlSemantic({
      sample: {
        id: "1",
        inputs: {},
        expected:
          "SELECT Highschooler.name, Highschooler.grade\nFROM Highschooler;",
      },
      output: { value: "SELECT name ,  grade FROM Highschooler" },
      config: {
        type: "sql-semantic",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-semantic",
      message: "",
    },
  ]);
});

test.fails(
  "sql-semantic works with table name aliases inside aggregate functions",
  async () => {
    expect(
      await checkSqlSemantic({
        sample: {
          id: "1",
          inputs: {},
          expected:
            "SELECT avg(age) ,  min(age) ,  max(age) FROM singer WHERE country  =  'France'",
        },
        output: {
          value:
            "SELECT AVG(singer.Age) as average, MIN(singer.Age) as minimum, MAX(singer.Age) as maximum\nFROM singer\nWHERE Country = 'France';",
        },
        config: {
          type: "sql-semantic",
        },
      }),
    ).toStrictEqual([
      {
        score: 1,
        name: "sql-semantic",
        message: "",
      },
    ]);
  },
);

test.fails("sql-semantic works with table joins", async () => {
  expect(
    await checkSqlSemantic({
      sample: {
        id: "1",
        inputs: {},
        expected:
          "SELECT DISTINCT Student.Fname, Student.Age\n FROM Student\n JOIN Has_Pet ON Student.StuID = Has_Pet.StuID;",
      },
      output: {
        value:
          "SELECT DISTINCT T1.fname ,  T1.age FROM student AS T1 JOIN has_pet AS T2 ON T1.stuid  =  T2.stuid",
      },
      config: {
        type: "sql-semantic",
      },
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-semantic",
      message: "",
    },
  ]);
});
