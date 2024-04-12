import { LocalStore } from "./local";

// TODO: come up with alternate name of this store
export class EmpiricalStore {
  store;
  constructor() {
    this.store = new LocalStore();
  }
  getRunRecorder() {
    return this.store.getRunRecorder();
  }
  getRunDetails() {
    // return this.store.getRunDetails();
  }
}
