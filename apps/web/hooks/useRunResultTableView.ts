import { RunCompletion } from "@empiricalrun/types";
import { useCallback, useMemo, useState } from "react";

export type RunResultTableHeader = {
  title: string;
  description?: string;
  runResult?: RunCompletion;
  type: "input" | "expected" | "completion";
  active?: boolean;
};

export function useRunResultTableView({
  runs = [],
}: {
  runs: RunCompletion[];
}) {
  const [activeRun, setActiveRun] = useState<RunCompletion | undefined>();
  const tableHeaders = useMemo(() => {
    const tableHeaders: RunResultTableHeader[] = [
      { title: "Inputs", type: "input" },
    ];
    runs?.forEach((run) => {
      if (!run) {
        return;
      }
      let title = "";
      if (run.run_config.type === "model") {
        title = run.run_config.name || run.run_config.model || "NA";
      } else {
        title = run.run_config.name || "NA";
      }
      tableHeaders.push({
        title,
        runResult: run,
        type: "completion",
        active: activeRun?.id === run.id,
      });
    });
    return tableHeaders;
  }, [runs, activeRun]);

  const getTableRowSamples = useCallback((runs: RunCompletion[]) => {
    return Array.from(
      new Set(runs.flatMap((run) => run.samples.map((sample) => sample.id))),
    );
  }, []);

  const getSampleCell = useCallback(
    (id: string, run: RunCompletion | undefined) => {
      return run?.samples.filter(
        (sample) => sample.dataset_sample_id === id,
      )?.[0];
    },
    [],
  );

  return {
    tableHeaders,
    getTableRowSamples,
    getSampleCell,
    runsMap: new Map<string, RunCompletion>(),
    activeRun,
    setActiveRun,
  };
}
