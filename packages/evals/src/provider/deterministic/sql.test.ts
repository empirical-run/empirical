import { expect, test } from "vitest";
import { checkSqlSyntax, checkSqlSemantic } from "./sql";

test("sql-syntax works with backticks", async () => {
  expect(
    await checkSqlSyntax({
      sample: { id: "1", inputs: [] },
      output: "SELECT `column` FROM `table`",
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
      output: "```SELECT table * FROM",
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
      output: "SELECT country ,  count(*) FROM singer GROUP BY country",
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
      output: "SELECT a + b, d, c",
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
      output: "SELECT name ,  grade FROM Highschooler",
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
        output:
          "SELECT AVG(singer.Age) as average, MIN(singer.Age) as minimum, MAX(singer.Age) as maximum\nFROM singer\nWHERE Country = 'France';",
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
      output:
        "SELECT DISTINCT T1.fname ,  T1.age FROM student AS T1 JOIN has_pet AS T2 ON T1.stuid  =  T2.stuid",
    }),
  ).toStrictEqual([
    {
      score: 1,
      name: "sql-semantic",
      message: "",
    },
  ]);
});
