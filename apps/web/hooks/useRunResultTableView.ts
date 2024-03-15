import { RunCompletion } from "@empiricalrun/types";
import { useCallback, useState } from "react";

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
  const getTableHeaders = useCallback(
    ({ showExpectedHeader }: { showExpectedHeader: boolean }) => {
      const tableHeaders: RunResultTableHeader[] = [
        { title: "Inputs", type: "input" },
      ];
      runs?.forEach((run) => {
        if (run) {
          tableHeaders.push({
            title: run.model,
            runResult: run,
            type: "completion",
            active: activeRun?.id === run.id,
          });
        }
      });
      return tableHeaders;
    },
    [runs, activeRun],
  );

  const getTableRowSamples = useCallback((runs: RunCompletion[]) => {
    return Array.from(
      new Set(runs.flatMap((run) => run.samples.map((sample) => sample.id))),
    );
  }, []);

  const getSampleCell = useCallback(
    (id: string, run: RunCompletion | undefined) => {
      return run?.samples.filter((sample) => sample.id === id)?.[0];
    },
    [],
  );

  return {
    getTableHeaders,
    getTableRowSamples,
    getSampleCell,
    runsMap: new Map<string, RunCompletion>(),
    activeRun,
    setActiveRun,
  };
}
