"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RunColumnHeaders } from "../components/run-completion-header";
import { PageHeader } from "../components/ui/page-header";
import PageLoader from "../components/ui/page-loader";
import { useRunResults } from "../hooks/useRunCompletion";
import { useRunResultTableView } from "../hooks/useRunResultTableView";
import InViewElement from "../components/ui/in-view";
import SampleCard from "../components/sample-card";
import SampleOutputCard from "../components/sample-output-card";
import { DatasetSample, RunConfig } from "@empiricalrun/types";
import { RunDetails } from "../components/run-details";
import { RunResult } from "../types";
import { useToast } from "../components/ui/use-toast";

export default function Page(): JSX.Element {
  const {
    runResults,
    dataset,
    addRun,
    executeRun,
    updateRunConfigForRun,
    removeRun,
    addDatasetSample,
    removeDatasetSample,
    updateDatasetSampleInput,
    executeRunsForSample,
  } = useRunResults();
  const { tableHeaders, getSampleCell, setActiveRun, activeRun } =
    useRunResultTableView({
      runs: runResults,
    });
  const runHeaderRowRef = useRef<HTMLDivElement>(null);
  const [comparisonTableHeight, setComparisonTableHeight] = useState(0);

  const updateComparisonTableHeight = useCallback(() => {
    if (dataset?.samples && runHeaderRowRef.current) {
      const top = runHeaderRowRef.current.offsetTop;
      setComparisonTableHeight(window.innerHeight - top - 40);
    }
  }, [dataset?.samples]);

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
    (run: RunResult | undefined, showOnlyIfActive: boolean = false) => {
      if ((showOnlyIfActive && activeRun) || !showOnlyIfActive) {
        setActiveRun(run);
      }
    },
    [activeRun],
  );
  const addNewRun = useCallback(
    (runResult: RunResult) => {
      const idx = runColumnHeaders.findIndex(
        (r) => r.runResult?.id === runResult.id,
      );
      const newRun = addRun(runResult, idx);
      setActiveRun(newRun);
      return newRun;
    },
    [runColumnHeaders, addRun],
  );
  const updateActiveRunConfigAndExecute = useCallback(
    (runConfig: RunConfig) => {
      if (activeRun?.samples.length !== dataset?.samples.length) {
        const updatedRun = updateRunConfigForRun(activeRun!, runConfig);
        setActiveRun(updatedRun);
        executeRun(updatedRun!, dataset!);
      } else {
        const newRun = addNewRun({
          ...activeRun!,
          run_config: runConfig,
        });
        executeRun(newRun, dataset!);
        setActiveRun(undefined);
      }
    },
    [activeRun, dataset],
  );

  const onClickRemoveRun = useCallback(
    (run: RunResult) => {
      if (run.id === activeRun?.id) {
        setActiveRun(undefined);
      } else {
        removeRun(run);
      }
    },
    [activeRun, removeRun],
  );

  const onClickRunOnAllModelsForSample = useCallback(
    (sample: DatasetSample) => {
      const runsToChange = runResults.filter((run) => {
        const hasMissingOutputsForSample = !run.samples.some(
          (s) => s.dataset_sample_id === sample.id,
        );
        const hasDifferentInputs = run.samples
          .filter((s) => s.dataset_sample_id === sample.id)
          .filter((s) =>
            Object.keys(sample.inputs).some(
              (key) => sample.inputs[key] !== s.inputs[key],
            ),
          );
        return hasMissingOutputsForSample || hasDifferentInputs;
      });
      executeRunsForSample(runsToChange, sample);
    },
    [runResults],
  );

  useEffect(() => {
    if (dataset?.samples && runHeaderRowRef.current) {
      updateComparisonTableHeight();
    }
  }, [dataset?.samples, updateComparisonTableHeight]);

  useEffect(() => {
    window.addEventListener("resize", updateComparisonTableHeight);
    return () => {
      window.removeEventListener("resize", updateComparisonTableHeight);
    };
  }, [updateComparisonTableHeight]);

  useEffect(() => {
    updateComparisonTableHeight();
  }, [activeRun]);

  const toast = useToast();

  return (
    <main className="relative h-screen">
      <PageHeader />
      {!runResults ||
        (!runResults.length && (
          <PageLoader className="mt-4" description="Loading results" />
        ))}
      {activeRun && (
        <RunDetails
          runConfig={activeRun.run_config!}
          onClose={() => setActiveRun(undefined)}
          onClickRun={updateActiveRunConfigAndExecute}
        />
      )}
      <section
        ref={runHeaderRowRef}
        className="overflow-scroll relative"
        style={{
          height: `${comparisonTableHeight}px`,
        }}
      >
        {runResults?.length > 0 && (
          <div className="flex bg-zinc-900 sticky top-0 z-20 min-w-fit">
            <RunColumnHeaders
              showPrompt={(run: RunResult) =>
                showRunDetails(activeRun?.id === run.id ? undefined : run)
              }
              headers={tableHeaders}
              onClickAddRun={addNewRun}
              onClickRemoveRun={onClickRemoveRun}
              datasetSampleCount={dataset?.samples.length || 0}
            />
          </div>
        )}
        <>
          {sampleIds?.map((r) => {
            const sampleCells = runColumnHeaders.map(
              (h) => getSampleCell(r, h.runResult)!,
            );
            const inputSample = dataset!.samples?.filter((s) => s.id === r)[0];
            const hasEmptyCompletion = sampleCells.filter((s) => !s).length > 0;
            const hasEditedInputs = sampleCells.some(
              (sc) =>
                inputSample &&
                inputSample.inputs &&
                sc &&
                sc.inputs &&
                Object.keys(inputSample.inputs).some(
                  (key) => inputSample.inputs[key] !== sc.inputs[key],
                ),
            );
            return (
              <InViewElement
                key={`run-sample-${r}`}
                className=" flex flex-row items-stretch min-h-[150px] w-full"
              >
                <div className="flex flex-1 bg-zinc-900">
                  <div className="flex items-stretch flex-1 min-w-[500px]">
                    <SampleCard
                      sample={inputSample!}
                      inputTabs={datasetInputNames}
                      onSampleAdd={(sample) => addDatasetSample(sample)}
                      onSampleInputUpdate={updateDatasetSampleInput}
                      onSampleRemove={(sample) => {
                        if (dataset?.samples.length === 1) {
                          toast.toast({
                            title: "Cannot remove the last sample",
                          });
                        } else {
                          removeDatasetSample(sample);
                        }
                      }}
                      onClickRunOnAllModels={onClickRunOnAllModelsForSample}
                      hasMissingCompletion={
                        hasEditedInputs || hasEmptyCompletion
                      }
                    />
                  </div>
                  {sampleCells.map((sample, i) => (
                    <div
                      className="flex flex-1 items-stretch min-w-[500px]"
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
