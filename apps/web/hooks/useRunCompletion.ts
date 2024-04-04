import { useCallback, useEffect, useState } from "react";
import { Dataset, RunCompletion, RunConfig } from "@empiricalrun/types";
export function generateRunId(len: number = 4) {
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export function useRunResults() {
  const [runResults, setRunResults] = useState<RunCompletion[]>([]);
  const [dataset, setDataset] = useState<Dataset | undefined>();
  const fetchRunResults = useCallback(async () => {
    const resp = await fetch("/api/results");
    const data = (await resp.json()) as {
      runs: RunCompletion[];
      dataset: Dataset;
    };
    setRunResults(data.runs);
    setDataset(data.dataset);
  }, []);

  useEffect(() => {
    fetchRunResults();
  }, []);

  const executeRun = useCallback(
    async (run: RunCompletion, dataset: Dataset) => {
      const runConfig = run.run_config;
      const resp = await fetch("/api/run/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ runs: [runConfig], dataset }),
      });
      const data = await resp.json();
      setRunResults((prevRunResults) => {
        const updatedRunResults = [...prevRunResults];
        const idx = updatedRunResults.findIndex((r) => r.id === run.id);
        updatedRunResults[idx] = data;
        return updatedRunResults;
      });
    },
    [setRunResults],
  );

  const addRun = useCallback(
    (refRun: RunCompletion, index = runResults.length - 1) => {
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
    (run: RunCompletion, runConfig: RunConfig) => {
      const updatedRunResults = [...runResults];
      const idx = updatedRunResults.findIndex((r) => r.id === run.id);
      const updatedRun = {
        ...updatedRunResults[idx],
        run_config: runConfig,
      } as RunCompletion;
      updatedRunResults[idx] = updatedRun;
      setRunResults(updatedRunResults);
      return updatedRun;
    },
    [runResults],
  );

  return {
    addRun,
    executeRun,
    updateRunConfigForRun,
    runResults,
    dataset,
  };
}
