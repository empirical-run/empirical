import { Dataset, RunUpdateType } from "@empiricalrun/types";
import { LocalRunMetadataStore } from "./run-metadata";
import { LocalRunStore } from "./run";
import { LocalDatasetMetadataStore } from "./dataset-metadata/local";
import { LocalDatasetStore } from "./dataset/local";
import { LocalUserStore } from "./user/local";

export class LocalStore {
  runMetadataStore;
  runStore;
  datasetMetadataStore;
  datasetStore;
  userIdStore;
  constructor() {
    this.runMetadataStore = new LocalRunMetadataStore();
    this.runStore = new LocalRunStore();
    this.datasetMetadataStore = LocalDatasetMetadataStore;
    this.datasetStore = LocalDatasetStore;
    this.userIdStore = new LocalUserStore();
  }
  getUserData = () => {
    return this.userIdStore.getOrCreateIdentity();
  };

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

  getDatasetRecorder = () => {
    return async (update: Dataset) => {
      if (update) {
        await Promise.allSettled([
          this.datasetMetadataStore.addDatasetMetadata(update),
          this.datasetStore.addDataset(update),
        ]);
      }
    };
  };
}
