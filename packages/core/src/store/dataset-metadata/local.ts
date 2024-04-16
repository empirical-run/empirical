import { Dataset } from "@empiricalrun/types";
import fs from "fs";
import { getLocalDBInstance } from "../../db";

// TODO: figure out where to keep this
const cachePath = ".empiricalrun";
// TODO: does this have to be json
const fileName = "datasets.jsonl";

let createTablePromise: Promise<void> | null = null;

const getDBInstance = async () => {
  const dbInstance = await getLocalDBInstance();
  const cwd = process.cwd();
  const fullPath = `${cwd}/${cachePath}/${fileName}`;
  if (!fs.existsSync(`${fullPath}`)) {
    fs.mkdirSync(`${cwd}/${cachePath}`, { recursive: true });
    fs.writeFileSync(fullPath, "");
  }
  if (!createTablePromise) {
    const cmd = `create table datasets as select * from read_json_auto('${cachePath}/${fileName}')`;
    createTablePromise = dbInstance.exec(cmd);
  }
  await createTablePromise;
  return dbInstance;
};

export const LocalDatasetMetadataStore = {
  async addDatasetMetadata(dataset: Dataset) {
    try {
      const dbInstance = await getDBInstance();
      const selectCmd = `select * from datasets where json.id = '${dataset.id}'`;
      const datasets = await dbInstance.all(selectCmd);
      if (datasets.length) {
        return;
      }
      const insertCmd = `insert into datasets values ('${JSON.stringify({ id: dataset.id })}')`;
      await dbInstance.exec(insertCmd);
      await dbInstance.exec(`copy datasets to '${cachePath}/${fileName}'`);
    } catch (e) {
      console.error("Not able to save dataset metadata");
      console.error(e);
    }
  },
};
