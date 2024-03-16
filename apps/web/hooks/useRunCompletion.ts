import { useCallback, useEffect, useState } from "react";
import { Dataset, RunCompletion } from "@empiricalrun/types";

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

  return {
    runResults,
    dataset,
  };
}
