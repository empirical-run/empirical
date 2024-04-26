import { Dataset } from "@empiricalrun/types";
import { useCallback } from "react";
import { RunResult } from "../types";

function convertDataset(dataset: Dataset): any {
  const playgroundDataset: any = {
    metadata: {
      id: dataset.id,
      type: "text-to-text",
      name: "",
    },
    samples: [],
  };
  playgroundDataset.samples = dataset.samples.map((s) => {
    const inputs = Object.keys(s.inputs).map((name) => ({
      name: name,
      value: s.inputs[name]!,
    }));
    return {
      id: s.id,
      inputs,
      annotations: [],
    };
  });
  return playgroundDataset;
}

function convertRuns(runs: RunResult[], playgroundDataset: any): any[] {
  return runs.map((r) => {
    const runResultPlayground: any = {
      run_metadata: {
        id: r.id,
        created_at: "",
        // @ts-ignore
        model: r.run_config?.model || "",
        name: r.run_config.name || "",
        // @ts-ignore
        prompt_template: r.run_config?.prompt || "",
        dataset: playgroundDataset,
        type: "quick",
        run_exec_type: r.run_config.type,
        parameters: r.run_config.parameters,
      },
      dataset_metadata: playgroundDataset.metadata,
      samples: r.samples.map((s) => {
        const evaluations = s.scores?.reduce(
          (agg, sc) => {
            agg[sc.name] = {
              score: sc.score,
              message: sc.message,
              name: sc.name,
            };
            return agg;
          },
          {} as {
            [key: string]: any;
          },
        );
        return {
          id: s.dataset_sample_id,
          inputs: Object.keys(s.inputs).map((name) => ({
            name,
            value: s.inputs[name]!,
          })),
          output: s.output.value!,
          evaluations,
        };
      }),
    };

    return {
      runId: r.id,
      data: runResultPlayground,
      fetchStatus: "success",
    };
  });
}

export function usePlaygroundLinks() {
  const savePlaygroundLink = useCallback(
    async ({ data }: { data: { dataset: Dataset; runs: RunResult[] } }) => {
      const postData: {
        dataset?: any;
        quickRunResults?: any[];
      } = {};
      postData.dataset = convertDataset(data.dataset);
      postData.quickRunResults = convertRuns(data.runs, postData.dataset);
      try {
        const response = await fetch(
          "https://www.empirical.run/api/links/playground",
          {
            method: "POST",
            body: JSON.stringify({
              data: postData,
            }),
          },
        );
        const resp = await response.json();
        return resp;
      } catch (error) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Failed to save playground link due to network issue",
          },
        };
      }
    },
    [],
  );
  return {
    savePlaygroundLink,
  };
}
