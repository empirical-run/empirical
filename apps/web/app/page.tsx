"use client";
import { useCallback, useMemo } from "react";
import { RunColumnHeaders } from "../components/run-completion-header";
import { PageHeader } from "../components/ui/page-header";
import PageLoader from "../components/ui/page-loader";
import { useRunResults } from "../hooks/useRunCompletion";
import { useRunResultTableView } from "../hooks/useRunResultTableView";
import InViewElement from "../components/ui/in-view";
import SampleCard from "../components/sample-card";
import SampleOutputCard from "../components/sample-output-card";
import { RunCompletion } from "@empiricalrun/types";
import { RunDetails } from "../components/run-details";

export default function Page(): JSX.Element {
  const { runResults, dataset } = useRunResults();
  const { tableHeaders, getSampleCell, setActiveRun, activeRun } =
    useRunResultTableView({
      runs: runResults,
    });
  const sampleIds = useMemo(
    () => (dataset?.samples || [])?.map((s) => s.id),
    [dataset],
  );
  const datasetInputNames = useMemo(
    () => Object.keys(dataset?.samples?.[0]?.inputs || {}),
    [dataset],
  );
  const runColumnHeaders = useMemo(
    () => tableHeaders.filter((h) => h.type == "completion"),
    [tableHeaders],
  );
  const showRunDetails = useCallback(
    (run: RunCompletion | undefined, showOnlyIfActive: boolean = false) => {
      if ((showOnlyIfActive && activeRun) || !showOnlyIfActive) {
        setActiveRun(run);
      }
    },
    [activeRun],
  );

  return (
    <main className="relative">
      <PageHeader />
      {!runResults ||
        (!runResults.length && (
          <PageLoader className="mt-4" description="Loading results" />
        ))}
      {activeRun && (
        <RunDetails
          runResult={activeRun!}
          onClose={() => setActiveRun(undefined)}
        />
      )}
      <section className="overflow-scroll relative h-screen">
        {runResults?.length > 0 && (
          <div className="flex bg-zinc-900 sticky top-[-1px] z-20 min-w-fit">
            <RunColumnHeaders
              showPrompt={(run: RunCompletion) =>
                showRunDetails(activeRun ? undefined : run)
              }
              headers={tableHeaders}
            />
          </div>
        )}

        <>
          {sampleIds?.map((r) => {
            const sampleCells = runColumnHeaders.map(
              (h) => getSampleCell(r, h.runResult)!,
            );
            const inputSample = dataset!.samples?.filter((s) => s.id === r)[0];
            return (
              <InViewElement
                key={`run-sample-${r}`}
                className=" flex flex-row items-stretch min-h-[150px] w-full"
              >
                <div className="flex flex-1 bg-zinc-900">
                  <div className="flex items-stretch flex-1 min-w-[400px]">
                    <SampleCard
                      sample={inputSample!}
                      inputTabs={datasetInputNames}
                    />
                  </div>
                  {sampleCells.map((sample, i) => (
                    <div
                      className="flex flex-1 items-stretch min-w-[400px]"
                      key={`sample-${r}-${i}`}
                    >
                      <SampleOutputCard
                        baseResult={runColumnHeaders?.[i]?.runResult}
                        baseSample={sample}
                        comparisonResults={runColumnHeaders.map(
                          (s) => s.runResult!,
                        )}
                        onClickCard={() =>
                          showRunDetails(runColumnHeaders[i]?.runResult!, true)
                        }
                        comparisonSamples={sampleCells}
                        isActiveColumn={runColumnHeaders[i]?.active}
                      />
                    </div>
                  ))}
                </div>
              </InViewElement>
            );
          })}
        </>
      </section>
    </main>
  );
}
