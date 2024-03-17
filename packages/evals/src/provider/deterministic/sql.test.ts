import { expect, test } from "vitest";
import { checkSqlSyntax, checkSqlSemantic } from "./sql";

test("sql-syntax works with backticks", async () => {
  expect(
    await checkSqlSyntax(
      { id: "1", inputs: [] },
      "SELECT `column` FROM `table`",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-syntax",
    message: "",
  });
});

test("sql-syntax works with markdown", async () => {
  expect(
    await checkSqlSyntax({ id: "1", inputs: [] }, "```SELECT table * FROM"),
  ).toStrictEqual({
    score: 0,
    name: "sql-syntax",
    message: "SQL is invalid",
  });
});

test("sql-semantic works with column aliases", async () => {
  expect(
    await checkSqlSemantic(
      {
        id: "1",
        inputs: [],
        expected:
          "SELECT country, COUNT(*) as NumberOfSingers\nFROM singer\nGROUP BY country;",
      },
      "SELECT country ,  count(*) FROM singer GROUP BY country",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});

test.fails("sql-semantic works with column reordering", async () => {
  expect(
    await checkSqlSemantic(
      {
        id: "1",
        inputs: [],
        expected: "SELECT a + b, c, d",
      },
      "SELECT a + b, d, c",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});

test.fails("sql-semantic works with explicit column names", async () => {
  expect(
    await checkSqlSemantic(
      {
        id: "1",
        inputs: [],
        expected:
          "SELECT Highschooler.name, Highschooler.grade\nFROM Highschooler;",
      },
      "SELECT name ,  grade FROM Highschooler",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});

test.fails(
  "sql-semantic works with table name aliases inside aggregate functions",
  async () => {
    expect(
      await checkSqlSemantic(
        {
          id: "1",
          inputs: [],
          expected:
            "SELECT avg(age) ,  min(age) ,  max(age) FROM singer WHERE country  =  'France'",
        },
        "SELECT AVG(singer.Age) as average, MIN(singer.Age) as minimum, MAX(singer.Age) as maximum\nFROM singer\nWHERE Country = 'France';",
      ),
    ).toStrictEqual({
      score: 1,
      name: "sql-semantic",
      message: "",
    });
  },
);

test.fails("sql-semantic works with table joins", async () => {
  expect(
    await checkSqlSemantic(
      {
        id: "1",
        inputs: [],
        expected:
          "SELECT DISTINCT Student.Fname, Student.Age\n FROM Student\n JOIN Has_Pet ON Student.StuID = Has_Pet.StuID;",
      },
      "SELECT DISTINCT T1.fname ,  T1.age FROM student AS T1 JOIN has_pet AS T2 ON T1.stuid  =  T2.stuid",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});
