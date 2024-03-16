import { expect, test } from "vitest";
import { checkSqlSyntax, checkSqlSemantic } from "./sql";

test("sql-syntax works with backticks", async () => {
  expect(
    await checkSqlSyntax([], "SELECT `column` FROM `table`"),
  ).toStrictEqual({
    score: 1,
    name: "sql-syntax",
    message: "",
  });
});

test("sql-syntax works with markdown", async () => {
  expect(await checkSqlSyntax([], "```SELECT table * FROM")).toStrictEqual({
    score: 0,
    name: "sql-syntax",
    message: "SQL is invalid",
  });
});

test("sql-semantic works with column aliases", async () => {
  expect(
    await checkSqlSemantic(
      [],
      "SELECT country ,  count(*) FROM singer GROUP BY country",
      "SELECT country, COUNT(*) as NumberOfSingers\nFROM singer\nGROUP BY country;",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});

test.fails("sql-semantic works with column reordering", async () => {
  expect(
    await checkSqlSemantic([], "SELECT a + b, d, c", "SELECT a + b, c, d"),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});

test.fails("sql-semantic works with explicit column names", async () => {
  expect(
    await checkSqlSemantic(
      [],
      "SELECT name ,  grade FROM Highschooler",
      "SELECT Highschooler.name, Highschooler.grade\nFROM Highschooler;",
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
        [],
        "SELECT AVG(singer.Age) as average, MIN(singer.Age) as minimum, MAX(singer.Age) as maximum\nFROM singer\nWHERE Country = 'France';",
        "SELECT avg(age) ,  min(age) ,  max(age) FROM singer WHERE country  =  'France'",
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
      [],
      "SELECT DISTINCT T1.fname ,  T1.age FROM student AS T1 JOIN has_pet AS T2 ON T1.stuid  =  T2.stuid",
      "SELECT DISTINCT Student.Fname, Student.Age\n FROM Student\n JOIN Has_Pet ON Student.StuID = Has_Pet.StuID;",
    ),
  ).toStrictEqual({
    score: 1,
    name: "sql-semantic",
    message: "",
  });
});
