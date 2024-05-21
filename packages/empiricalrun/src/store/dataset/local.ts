import { Dataset } from "@empiricalrun/types";
import { getLocalDBInstance } from "../../db";
import fs from "fs";

// TODO: figure out where to keep this
const cachePath = ".empiricalrun/datasets";

export const LocalDatasetStore = {
  async addDataset(dataset: Dataset) {
    const dbInstance = await getLocalDBInstance();

    const cwd = process.cwd();
    const fullPath = `${cachePath}/${dataset.id}.jsonl`;
    if (fs.existsSync(`${cwd}/${fullPath}`)) {
      return;
    }
    fs.mkdirSync(`${cwd}/${cachePath}`, { recursive: true });
    fs.writeFileSync(`${cwd}/${fullPath}`, "");
    try {
      const cmd = `create table dataset${dataset.id} (config JSON, sample JSON)`;
      await dbInstance.exec(cmd);
      const insertMeta = `insert into dataset${dataset.id} values ('${JSON.stringify({ id: dataset.id })}', null)`;
      await dbInstance.exec(insertMeta);
      const samplesInsertStmt = dataset.samples
        .map((s) => `(null, '${JSON.stringify(s).replaceAll("'", "''")}')`)
        .join(", ");
      await dbInstance.exec(
        `insert into dataset${dataset.id} values ${samplesInsertStmt}`,
      );
      await dbInstance.exec(`copy dataset${dataset.id} to '${fullPath}'`);
    } catch (e) {
      console.error(`Failed to create dataset:: ${dataset.id}`);
      console.error(e);
    }
  },
};
