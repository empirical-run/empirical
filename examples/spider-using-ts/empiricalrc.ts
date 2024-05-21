import { Config } from "empiricalrun";
import * as fs from "fs";
import sqlite3 from "sqlite3";
import {
  cleanClosingBraces,
  getFileName,
  loadJson,
  removeBackticks,
} from "./utils";

async function createAndLoadDatabase(
  dbName: string,
  sqliteFileName: string
): Promise<void> {
  if (fs.existsSync(sqliteFileName)) {
    fs.unlinkSync(sqliteFileName);
  }

  return new Promise((resolve, reject) => {
    const con = new sqlite3.Database(sqliteFileName);
    const schemaScript = loadJson("./schema.json")[dbName];
    const createScript = loadJson("./create.json")[dbName];

    con.serialize(() => {
      con.exec(schemaScript, () => {
        con.exec(createScript, () => {
          con.close();
          resolve();
        });
      });
    });
  });
}

async function executeQuery(con: sqlite3.Database, query: string): Promise<any[]> {
  const res: any[] = await new Promise((resolve, reject) => {
    const rows: any[] = [];
    con.each(
      query,
      (err, row) => {
        if (err) reject(err);
        else {
          rows.push(Object.values(row!));
        }
      },
      (err) => {
        if (err) reject(err);
        else {
          resolve(rows);
        }
      }
    );
  });
  return res
}

const config: Config = {
  runs: [
    {
      provider: "openai",
      type: "model",
      name: "default-prompt-gpt3.5",
      model: "gpt-3.5-turbo",
      prompt:
        "You are an SQLite expert who can convert natural language questions to SQL queries for the database schema given below.\n\nDatabase schema:\n{{schema}}\n\nAnswer the following question with only the SQL query.\n\nQuestion: {{question}}",
    },
  ],
  dataset: {
    path: "https://docs.google.com/spreadsheets/d/1x_p0lX2pJEyGkFoe1A9nY3q87qOJUd547f2lz99ugiM/edit#gid=1000015421",
  },
  scorers: [
    {
      type: "sql-syntax",
    },
    // Need to fix interface. make it inputs
    async ({ output, sample }) => {
      const databaseName = sample.inputs["database_name"];
      const fileName = getFileName();
      await createAndLoadDatabase(databaseName, fileName);
      const con = new sqlite3.Database(fileName);
      const query = cleanClosingBraces(removeBackticks(output.value!));

      let passed: number;
      let message: string;

      try {
        const res = await executeQuery(con, query);
        const [firstRow] = res;
        if (firstRow) {
          passed = 1;
          message = "Result preview: " + firstRow.join(", ");
        } else {
          passed = 0.5;
          message = "No results found";
        }
      } catch (e) {
        console.error(e);
        passed = 0;
        message = String(e);
      }

      con.close();
      fs.unlinkSync(fileName);

      return [{ score: passed, message, name: "exec-accuracy" }];
    },
  ],
};

export default config;
