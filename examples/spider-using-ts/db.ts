import sqlite3 from "sqlite3";
import { cleanClosingBraces, getFileName, loadJson, removeBackticks } from "./utils";
import fs from "fs";

const dbSchemas = loadJson("./schema.json");

export function getSchema(dbName: string): string {
    return dbSchemas[dbName];
}

async function createDatabase(
  con: sqlite3.Database,
  dbName: string,
): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const schemaScript = loadJson("./schema.json")[dbName];
    const createScript = loadJson("./create.json")[dbName];

    con.serialize(() => {
      con.exec(schemaScript, () => {
        con.exec(createScript, () => {
          resolve(con);
        });
      });
    });
  });
}

let connectionCache: Map<string, Promise<sqlite3.Database>> = new Map();

export async function getConnection (dbName:string): Promise<sqlite3.Database> {
    if (connectionCache.get(dbName)) {
        return await connectionCache.get(dbName)!
    }
    const connectionPromise = new Promise<sqlite3.Database>(async (resolve) => {
        if(!fs.existsSync("db")){
            fs.mkdirSync("db");
        }
        const dbfileName = `db/${dbName}.db`
        const con = new sqlite3.Database(dbfileName);
        await createDatabase(con, dbName)
        resolve(con)
    })
    connectionCache.set(dbName, connectionPromise);
    return await connectionPromise;
}

export async function executeQuery(con: sqlite3.Database, query: string): Promise<any[]> {
  const cleanedQuery = cleanClosingBraces(removeBackticks(query));
  const res: any[] = await new Promise((resolve, reject) => {
    const rows: any[] = [];
    con.each(
      cleanedQuery,
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
