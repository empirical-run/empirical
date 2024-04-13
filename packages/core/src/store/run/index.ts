import {
  RunMetadataUpdate,
  RunSampleScoreUpdate,
  RunSampleUpdate,
} from "@empiricalrun/types";
import { getLocalDBInstance } from "../../db";
import fs from "fs";

// TODO: figure out where to keep this
const cachePath = ".empiricalrun/runs";
export class LocalRunStore {
  async createRunTable(runId: string) {
    const dbInstance = await getLocalDBInstance();
    const cmd = `create table runs${runId} (config JSON, sample JSON)`;
    const cwd = process.cwd();
    const fullPath = `${cachePath}/${runId}.jsonl`;
    fs.mkdirSync(`${cwd}/${cachePath}`, { recursive: true });
    fs.writeFileSync(`${cwd}/${fullPath}`, "");
    await dbInstance.exec(cmd);
  }

  async updateRunMetadata(update: RunMetadataUpdate) {
    try {
      await this.createRunTable(update.data.id);
      const dbInstance = await getLocalDBInstance();
      const path = `${cachePath}/${update.data.id}.jsonl`;
      // TODO: move transactions to a single place so that these replacement can be reused
      const statement = `insert into runs${update.data.id} values ('${JSON.stringify(update.data).replaceAll("'", "''")}', null)`;
      await dbInstance.exec(statement);
      await dbInstance.exec(`copy runs${update.data.id} to '${path}'`);
    } catch (e) {
      console.error(`Run: ${update.data.id}: Failed to record run metadata`);
      console.error(e);
    }
  }
  async updateRunSample(update: RunSampleUpdate) {
    try {
      const dbInstance = await getLocalDBInstance();
      const statement = `insert into runs${update.data.run_id} values(null, '${JSON.stringify({ ...update.data, scores: [] }).replaceAll("'", "''")}')`;
      console.log(statement);
      await dbInstance.exec(statement);
      const fullPath = `${cachePath}/${update.data.run_id}.jsonl`;
      await dbInstance.exec(`copy runs${update.data.run_id} to '${fullPath}'`);
      console.log(`${fullPath} updated`);
    } catch (e) {
      console.error(
        `Failed to record run sample output for run: ${update.data.run_id} with dataset sample id: ${update.data.dataset_sample_id} `,
      );
      console.error(e);
    }
    return update;
  }
  updateRunSampleScore(update: RunSampleScoreUpdate) {
    // try {
    //   const dbInstance = await getLocalDBInstance();
    //   const statement = `update `;
    // } catch (e) {
    //   console.error(
    //     `Failed to record score for run ${update.data.run_id} and dataset sample id ${update.data.dataset_sample_id}`,
    //   );
    // }
    return update;
  }
}
