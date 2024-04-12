import { RunUpdateType } from "@empiricalrun/types";
import { LocalRunMetadataStore } from "./run-metadata";
import { LocalRunStore } from "./run";

export class LocalStore {
  runMetadataStore;
  runStore;
  constructor() {
    this.runMetadataStore = new LocalRunMetadataStore();
    this.runStore = new LocalRunStore();
  }
  getRunRecorder = () => {
    return async (update: RunUpdateType) => {
      if (update.type === "run_metadata") {
        await Promise.all([
          this.runMetadataStore.updateRunMetadata(update),
          this.runStore.updateRunMetadata(update),
        ]);
      } else if (update.type === "run_sample") {
        await this.runStore.updateRunSample(update);
      } else if (update.type === "run_stats") {
        await this.runMetadataStore.updateRunStats(update);
      } else if (update.type === "run_sample_score") {
        await this.runStore.updateRunSampleScore(update);
      } else {
        console.warn("store got a noop update", JSON.stringify(update));
      }
    };
  };
}
