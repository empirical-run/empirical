"use client";
import { useMemo } from "react";
import { RunColumnHeaders } from "../components/run-completion-header";
import { PageHeader } from "../components/ui/page-header";
import PageLoader from "../components/ui/page-loader";
import { useRunResults } from "../hooks/useRunCompletion";
import { useRunResultTableView } from "../hooks/useRunResultTableView";

export default function Page(): JSX.Element {
  const { runResults } = useRunResults();
  const { getTableHeaders } = useRunResultTableView({ runs: runResults });
  const columnHeaders = useMemo(
    () => getTableHeaders({ showExpectedHeader: false }), // TODO: make it basis if dataset has expected fields
    [runResults],
  );
  return (
    <main>
      <PageHeader />
      {!runResults ||
        (!runResults.length && (
          <PageLoader className="mt-4" description="Loading results" />
        ))}
      <section className=" overflow-scroll relative h-full">
        {runResults?.length > 0 && (
          <div className="flex bg-zinc-900 sticky top-[-1px] z-20 min-w-fit">
            <RunColumnHeaders
              // showPrompt={setActiveRun}
              headers={columnHeaders}
            />
          </div>
        )}
      </section>
    </main>
  );
}
