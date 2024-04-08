import { useCallback, useEffect, useState } from "react";
import {
  Dataset,
  RunCompletion,
  RunConfig,
  RunSampleOutput,
  Score,
} from "@empiricalrun/types";
import { RunResult } from "../types";
export function generateRunId(len: number = 4) {
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

// TODO: move these types
interface RunMetadataUpdate {
  type: "run_metadata";
  data: {
    run_config: RunConfig;
    id: string;
    dataset_config: { id: string };
    created_at: Date;
  };
}

interface RunSampleScoreUpdate {
  type: "run_sample_score";
  data: {
    run_id: string;
    sample_id: string | undefined;
    dataset_sample_id: string;
    scores: Score[];
  };
}

interface RunSampleUpdate {
  type: "run_sample";
  data: RunSampleOutput;
}
// TODO: fix naming
type ProgressCallbackDataTypes =
  | RunMetadataUpdate
  | RunSampleUpdate
  | RunSampleScoreUpdate;

// TODO: move this to utils
async function* streamFetch(url: string, options: any) {
  const response = await fetch(url, options);

  const reader = response.body?.getReader();

  while (true && reader) {
    const { done, value } = await reader.read();

    if (done) {
      return;
    }

    yield value;
  }
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

  // const updateRun = useCallback((runId: string, run: RunCompletion) => {
  //   setRunResults((prevRunResults) => {
  //     const updatedRunResults = prevRunResults.map((r) => {
  //       if (r.id === runId) {
  //         return { ...run, loading: false };
  //       }
  //       return r;
  //     });
  //     return updatedRunResults;
  //   });
  // }, []);

  const executeRun = useCallback(
    async (run: RunResult, dataset: Dataset) => {
      let runId = run.id;
      setLoadingStateForRun(runId, true);
      run.loading = true;
      console.log(dataset);
      for await (const chunk of streamFetch("/api/run/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ runs: [run.run_config], dataset }),
      })) {
        const resp = new Response(chunk);
        const text = await resp.text();
        const updates: ProgressCallbackDataTypes[] = text
          .split("\n")
          .filter((s) => s !== "\n")
          .filter((s) => !!s)
          .map((s) => JSON.parse(s));
        setRunResults((prevRunResults) => {
          const updatedRunResults = prevRunResults.map((prevRun) => {
            if (prevRun.id === runId) {
              const updatedRun = { ...prevRun };
              updates.forEach((u) => {
                if (u.type === "run_metadata") {
                  runId = u.data.id;
                  updatedRun.id = runId;
                  updatedRun.run_config = u.data.run_config;
                  updatedRun.dataset_config = u.data.dataset_config;
                  updatedRun.created_at = u.data.created_at;
                } else if (u.type === "run_sample") {
                  const sample = u.data;
                  updatedRun.samples = updatedRun.samples
                    ? updatedRun.samples
                    : [];
                  updatedRun.samples.push(sample);
                } else if (u.type === "run_sample_score") {
                  updatedRun.samples = updatedRun.samples.map((s) => {
                    if (s.dataset_sample_id === u.data.dataset_sample_id) {
                      s.scores = u.data.scores;
                    }
                    return { ...s };
                  });
                } else {
                  // TODO: setup summary update type
                  updatedRun.loading = false;
                  // @ts-ignore
                  updatedRun.stats = u.data;
                }
              });
              return { ...updatedRun };
            }
            return prevRun;
          });
          return [...updatedRunResults];
        });
      }
      return run;
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
