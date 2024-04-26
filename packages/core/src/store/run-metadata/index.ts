import { RunMetadataUpdate, RunStatsUpdate } from "@empiricalrun/types";
import fs from "fs";
import { getLocalDBInstance } from "../../db";

// TODO: figure out where to keep this
const cachePath = ".empiricalrun";
const fileName = "runs.jsonl";

export class LocalRunMetadataStore {
  private createTable: Promise<void> | null = null;

  private async getDBInstance() {
    const dbInstance = await getLocalDBInstance();
    const cwd = process.cwd();
    let cmd = "";
    const fullPath = `${process.cwd()}/${cachePath}/${fileName}`;
    if (!fs.existsSync(`${fullPath}`)) {
      fs.mkdirSync(`${cwd}/${cachePath}`, { recursive: true });
      fs.writeFileSync(fullPath, "");
      cmd = `create table if not exists runs (run JSON)`;
    } else {
      cmd = `create table if not exists runs as select * from read_json_auto('${cachePath}/${fileName}')`;
    }

    if (!this.createTable) {
      this.createTable = dbInstance.exec(cmd);
    }
    await this.createTable;
    return dbInstance;
  }

  /**
   *
   *
   * @param {RunMetadataUpdate} update
   * @return {*}
   * @memberof LocalRunMetadataStore
   */
  async updateRunMetadata(update: RunMetadataUpdate) {
    try {
      const dbInstance = await this.getDBInstance();
      const runs = await dbInstance.all(`select * from runs`);
      if (runs.length) {
        const selectCmd = `select * from runs where run.id = '${update.data.id}'`;
        const [run] = await dbInstance.all(selectCmd);
        if (run) {
          const deleteCmd = `delete from runs where run.id = '${update.data.id}'`;
          await dbInstance.exec(deleteCmd);
        }
      }
      const insertCmd = `insert into runs values ('${JSON.stringify({ id: update.data.id, dataset_config: update.data.dataset_config, created_at: update.data.created_at })}')`;
      await dbInstance.exec(insertCmd);
      await dbInstance.exec(`copy runs to '${cachePath}/${fileName}'`);
    } catch (e) {
      console.error(update.data.id);
      console.error("Not able to save run metadata");
      console.error(e);
    }
    return update;
  }

  /**
   *
   *
   * @param {RunStatsUpdate} update
   * @return {*}
   * @memberof LocalRunMetadataStore
   */
  updateRunStats(update: RunStatsUpdate) {
    return update;
  }
}
