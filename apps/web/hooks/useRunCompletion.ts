import { useCallback, useEffect, useState } from "react";
import {
  Dataset,
  RunCompletion,
  RunConfig,
  RunUpdateType,
  DatasetSample,
  DatasetSampleInputs,
  RunMetadataUpdate,
} from "@empiricalrun/types";
import { RunResult } from "../types";
import { aggregateRunStats, statsAfterRemoved } from "../utils";

export function generateRunId(len: number = 4) {
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

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

  const executeRun = useCallback(
    async (run: RunResult, dataset: Dataset) => {
      let runId = run.id;
      setLoadingStateForRun(runId, true);
      for await (const chunk of streamFetch("/api/runs/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runs: [{ ...run.run_config, name: undefined }],
          dataset,
          persistToFile: true,
        }),
      })) {
        const resp = new Response(chunk);
        const text = await resp.text();
        const updates: RunUpdateType[] = text
          .split("\n")
          .filter((s) => s !== "\n")
          .filter((s) => !!s)
          .map((s) => JSON.parse(s));
        setRunResultsOnStream(runId, updates);
        const newMetadataWithRunId = updates.find(
          (u) => u.type === "run_metadata",
        ) as RunMetadataUpdate | undefined;
        runId = newMetadataWithRunId ? newMetadataWithRunId.data.id : runId;
      }
      return run;
    },
    [setRunResults],
  );

  const setRunResultsOnStream = (runId: string, updates: RunUpdateType[]) => {
    setRunResults((prevRunResults) => {
      const updatedRunResults = prevRunResults.map((prevRun) => {
        if (prevRun.id === runId) {
          const updatedRun = { ...prevRun };
          updates.forEach((u) => {
            if (u.type === "run_metadata") {
              updatedRun.id = u.data.id;
              updatedRun.run_config = u.data.run_config;
              updatedRun.dataset_config = u.data.dataset_config;
              updatedRun.created_at = u.data.created_at;
            } else if (u.type === "run_sample") {
              const sample = u.data;
              updatedRun.samples = updatedRun.samples ? updatedRun.samples : [];
              updatedRun.samples.push(sample);
            } else if (u.type === "run_sample_score") {
              updatedRun.samples = updatedRun.samples.map((s) => {
                if (s.dataset_sample_id === u.data.dataset_sample_id) {
                  s.scores = u.data.scores;
                }
                return { ...s };
              });
            } else if (u.type === "run_stats") {
              updatedRun.loading = false;
              updatedRun.stats = u.data;
            }
          });
          return updatedRun;
        }
        return prevRun;
      });
      return [...updatedRunResults];
    });
  };

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
    async (run: RunResult) => {
      const resp = await fetch(`/api/runs/${run.id}`, {
        method: "DELETE",
      });
      const isSuccess = (await resp.json()).success;
      if (isSuccess) {
        setRunResults((prevRunResults) => {
          if (prevRunResults.length === 1) {
            return prevRunResults;
          }
          const updatedRunResults = [...prevRunResults];
          const idx = updatedRunResults.findIndex((r) => r.id === run.id);
          updatedRunResults.splice(idx, 1);
          return updatedRunResults;
        });
      }
    },
    [setRunResults],
  );

  const addDatasetSample = useCallback(
    async (sample: DatasetSample) => {
      setDataset((prevDataset) => {
        if (!prevDataset) {
          return prevDataset;
        }
        const { samples } = prevDataset;
        const newSampleIdx = samples
          .map((s, idx) => s.id === sample.id && idx + 1)
          .find((x) => !!x) as number;
        // TODO: Assuming there is at least one sample to infer input keys
        const inputs = Object.keys(samples[0]?.inputs || {}).reduce(
          (inputs: DatasetSampleInputs, key) => {
            inputs[key] = "";
            return inputs;
          },
          {},
        );
        const newSample: DatasetSample = {
          id: crypto.randomUUID(),
          inputs,
        };
        return {
          ...prevDataset,
          samples: [
            ...samples.slice(0, newSampleIdx),
            newSample,
            ...samples.slice(newSampleIdx),
          ],
        };
      });
    },
    [setDataset],
  );

  const removeDatasetSample = useCallback(
    async (sample: DatasetSample) => {
      setDataset((prevDataset) => {
        if (!prevDataset) {
          return prevDataset;
        }
        return {
          ...prevDataset,
          samples: prevDataset.samples.filter(({ id }) => id !== sample.id),
        };
      });
      setRunResults((prevRunResults) => {
        return prevRunResults.map((runResult) => ({
          ...runResult,
          samples: runResult.samples.filter(
            (s) => s.dataset_sample_id !== sample.id,
          ),
          stats: statsAfterRemoved(runResult, sample),
        }));
      });
    },
    [setDataset, setRunResults],
  );

  const updateDatasetSampleInput = useCallback(
    (sampleId: string, newInputs: DatasetSampleInputs) => {
      setDataset((prevDataset) => {
        if (!prevDataset) {
          return prevDataset;
        }
        const samples = prevDataset?.samples.map((s) => {
          if (s.id !== sampleId) {
            return s;
          }
          return {
            ...s,
            inputs: { ...s.inputs, ...newInputs },
          };
        });
        return {
          ...prevDataset,
          samples,
        };
      });
    },
    [],
  );

  const executeRunsForSample = useCallback(
    async (runs: RunResult[], sample: DatasetSample) => {
      runs.forEach(async (run) => {
        setLoadingStateForRun(run.id, true);
        for await (const chunk of streamFetch("/api/runs/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            runs: [run.run_config],
            dataset: {
              id: "temp-id",
              samples: [sample],
            },
            persistToFile: false,
          }),
        })) {
          const resp = new Response(chunk);
          const text = await resp.text();
          const updates: RunUpdateType[] = text
            .split("\n")
            .filter((s) => s !== "\n")
            .filter((s) => !!s)
            .map((s) => JSON.parse(s))
            .map((u) => {
              // Overwrite the new run id with the existing run id
              if (u.type === "run_metadata") {
                u.data.id = run.id;
              } else if (u.type === "run_sample") {
                u.data.run_id = run.id;
              } else if (u.type === "run_sample_score") {
                u.data.run_id = run.id;
              } else if (u.type === "run_stats") {
                u.data = aggregateRunStats(u.data, run.stats);
              }
              return u;
            });
          setRunResultsOnStream(run.id, updates);
        }
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
    addDatasetSample,
    removeDatasetSample,
    updateDatasetSampleInput,
    executeRunsForSample,
  };
}
