"use client";
import { useMemo } from "react";
import { RunColumnHeaders } from "../components/run-completion-header";
import { PageHeader } from "../components/ui/page-header";
import PageLoader from "../components/ui/page-loader";
import { useRunResults } from "../hooks/useRunCompletion";
import { useRunResultTableView } from "../hooks/useRunResultTableView";
import InViewElement from "../components/ui/in-view";
import SampleCard from "../components/sample-card";
import SampleOutputCard from "../components/sample-output-card";

export default function Page(): JSX.Element {
  const { runResults, dataset } = useRunResults();
  const { getTableHeaders, getSampleCell } = useRunResultTableView({
    runs: runResults,
  });
  const columnHeaders = useMemo(
    () => getTableHeaders(), // TODO: make it basis if dataset has expected fields
    [runResults],
  );
  const sampleIds = useMemo(() => {
    return (dataset?.samples || [])?.map((s) => s.id);
  }, [dataset]);
  const datasetInputNames = useMemo(() => {
    return dataset?.samples?.[0]?.inputs.map((i) => i.name) || [];
  }, [dataset]);

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
        <>
          {sampleIds?.map((r) => {
            const sampleCells = columnHeaders
              .filter((h) => !!h.runResult)
              .map((h) => getSampleCell(r, h.runResult)!);
            console.log(sampleCells);
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
                      mode={"edit"}
                      inputTabs={datasetInputNames}
                      // onClickEditPrompt={() =>
                      //   setActiveRun(runColumnHeaders[0].runResult!)
                      // }
                    />
                  </div>
                  {sampleCells.map((sample, i) => (
                    <div
                      className="flex flex-1 items-stretch min-w-[400px]"
                      key={`sample-${r}-${i}`}
                    >
                      <SampleOutputCard
                        baseResult={columnHeaders?.[i]?.runResult}
                        baseSample={sample}
                        comparisonResults={columnHeaders.map(
                          (s) => s.runResult!,
                        )}
                        // onSelectSample={() =>
                        //   setActiveRunIfExisting(columnHeaders[i]?.runResult!)
                        // }
                        // onClickCard={() =>
                        //   setActiveRunIfExisting(columnHeaders[i]?.runResult!)
                        // }
                        comparisonSamples={sampleCells}
                        isActiveColumn={columnHeaders[i]?.active}
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
