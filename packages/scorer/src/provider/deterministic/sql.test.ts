import { expect, test } from "vitest";
import { checkSqlSyntax, checkSqlSemantic } from "./sql";

test("sql-syntax works with backticks", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: [] },
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
      message: "",
    },
  ]);
});

test("sql-syntax works with markdown", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: [] },
      output: { value: "```SELECT table * FROM" },
      config: {
        type: "sql-syntax",
      },
    }),
  ).toStrictEqual([
    {
      score: 0,
      name: "sql-syntax",
      message: "SQL is invalid",
    },
  ]);
});

test("sql-semantic works with column aliases", async () => {
  expect(
    await checkSqlSemantic({
      sample: {
        id: "1",
        inputs: [],
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
        inputs: [],
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
        inputs: [],
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
          inputs: [],
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
        inputs: [],
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
