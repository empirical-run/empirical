import { useCallback, useEffect, useState } from "react";
import { Dataset, RunCompletion, RunConfig } from "@empiricalrun/types";
import { RunResult } from "../types";
export function generateRunId(len: number = 4) {
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export function useRunResults() {
  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [dataset, setDataset] = useState<Dataset | undefined>();
  const fetchRunResults = useCallback(async () => {
    const resp = await fetch("/api/results");
    const data = (await resp.json()) as {
      runs: RunCompletion[];
      dataset: Dataset;
    };
    setRunResults(data.runs.map((run) => ({ ...run, loading: false })));
    setDataset(data.dataset);
  }, []);

  useEffect(() => {
    fetchRunResults();
  }, []);

  const setLoadingStateForRun = useCallback(
    (runId: string, loading: boolean) => {
      setRunResults((prevRunResults) => {
        const updatedRunResults = prevRunResults.map((run) => {
          if (run.id === runId) {
            return { ...run, loading };
          }
          return run;
        });
        return updatedRunResults;
      });
    },
    [setRunResults],
  );

  const updateRun = useCallback((runId: string, run: RunCompletion) => {
    setRunResults((prevRunResults) => {
      const updatedRunResults = prevRunResults.map((r) => {
        if (r.id === runId) {
          return { ...run, loading: false };
        }
        return r;
      });
      return updatedRunResults;
    });
  }, []);

  const executeRun = useCallback(
    async (run: RunResult, dataset: Dataset) => {
      const runConfig = run.run_config;
      setLoadingStateForRun(run.id, true);
      run.loading = true;
      const resp = await fetch("/api/run/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ runs: [runConfig], dataset }),
      });
      const data = await resp.json();
      updateRun(run.id, data);
      return data;
    },
    [setRunResults],
  );

  const addRun = useCallback(
    (refRun: RunResult, index = runResults.length - 1) => {
      const updatedRunResults = [...runResults];
      const run = { ...refRun };
      run.id = generateRunId();
      run.samples = [];
      run.stats = undefined;
      updatedRunResults.splice(index + 1, 0, run);
      setRunResults(updatedRunResults);
      return run;
    },
    [runResults],
  );

  const updateRunConfigForRun = useCallback(
    (run: RunResult, runConfig: RunConfig) => {
      const updatedRunResults = [...runResults];
      const idx = updatedRunResults.findIndex((r) => r.id === run.id);
      const updatedRun = {
        ...updatedRunResults[idx],
        run_config: runConfig,
      } as RunResult;
      updatedRunResults[idx] = updatedRun;
      setRunResults(updatedRunResults);
      return updatedRun;
    },
    [runResults],
  );

  const removeRun = useCallback(
    (run: RunResult) => {
      setRunResults((prevRunResults) => {
        if (prevRunResults.length === 1) {
          return prevRunResults;
        }
        const updatedRunResults = [...prevRunResults];
        const idx = updatedRunResults.findIndex((r) => r.id === run.id);
        updatedRunResults.splice(idx, 1);
        return updatedRunResults;
      });
    },
    [setRunResults],
  );

  return {
    addRun,
    executeRun,
    removeRun,
    updateRunConfigForRun,
    runResults,
    dataset,
  };
}
