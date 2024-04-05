import { RunCompletion } from "@empiricalrun/types";

export interface RunResult extends RunCompletion {
  loading: boolean;
}
