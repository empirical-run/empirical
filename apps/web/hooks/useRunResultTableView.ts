import { useCallback, useMemo, useState } from "react";
import { RunResult } from "../types";
import * as duckdb from "@duckdb/duckdb-wasm";
//@ts-ignore
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
//@ts-ignore
import duckdb_wasm_next from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";
//@ts-ignore

if (typeof window !== "undefined") {
  window.initiateDB = async function () {
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: new URL(
          "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
          import.meta.url,
        ).toString(),
      },
      eh: {
        mainModule: duckdb_wasm_next,
        mainWorker: new URL(
          "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
          import.meta.url,
        ).toString(),
      },
    };
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    const conn = await db.connect();
    conn.query("LOAD json");
    conn.query("INSTALL json");
    // const streamResponse = await fetch(
    //   `https://assets-test.empirical.run/4b61.jsonl`,
    // );
    // const data = await streamResponse.text();

    const jsonData = [
      {
        config: {
          run_config: {
            type: "model",
            provider: "openai",
            model: "gpt-4-turbo-preview",
            prompt:
              "Extract the name, age and location from the message, and respond with a JSON object. If an entity is missing, respond with null.\n\nMessage: {{user_message}}",
            parameters: { response_format: { type: "json_object" } },
            scorers: [{ type: "is-json" }],
            name: "Run #4b61: gpt-4-turbo-preview",
          },
          id: "4b61",
          dataset_config: { id: "d97a7e79f2eb68c5b7d2c101292d3a00" },
          created_at: "2024-04-26T00:50:25.986Z",
        },
        sample: null,
      },
      {
        config: {
          run_config: {
            type: "model",
            provider: "openai",
            model: "gpt-4-turbo-preview",
            prompt:
              "Extract the name, age and location from the message, and respond with a JSON object. If an entity is missing, respond with null.\n\nMessage: {{user_message}}",
            parameters: { response_format: { type: "json_object" } },
            scorers: [{ type: "is-json" }],
            name: "Run #4b61: gpt-4-turbo-preview",
          },
          id: "4b61",
          dataset_config: { id: "d97a7e79f2eb68c5b7d2c101292d3a00" },
          created_at: "2024-04-26T00:50:25.986Z",
        },
        sample: {
          inputs: {
            user_message:
              "This is Alice. I am a nurse from Maryland. I was born in 1990.",
          },
          output: {
            value:
              '{\n  "name": "Alice",\n  "age": 33,\n  "location": "Maryland"\n}',
            tokens_used: 80,
            finish_reason: "stop",
            latency: 1943,
          },
          dataset_sample_id: "2",
          created_at: "2024-04-26T00:50:27.929Z",
          run_id: "4b61",
          scores: [{ score: 1, name: "is-json", message: "" }],
        },
      },
      {
        config: {
          run_config: {
            type: "model",
            provider: "openai",
            model: "gpt-4-turbo-preview",
            prompt:
              "Extract the name, age and location from the message, and respond with a JSON object. If an entity is missing, respond with null.\n\nMessage: {{user_message}}",
            parameters: { response_format: { type: "json_object" } },
            scorers: [{ type: "is-json" }],
            name: "Run #4b61: gpt-4-turbo-preview",
          },
          id: "4b61",
          dataset_config: { id: "d97a7e79f2eb68c5b7d2c101292d3a00" },
          created_at: "2024-04-26T00:50:25.986Z",
        },
        sample: {
          inputs: {
            user_message:
              "Hi my name is John Doe. I'm 26 years old and I work in real estate.",
          },
          output: {
            value:
              '{\n  "name": "John Doe",\n  "age": 26,\n  "location": null\n}',
            tokens_used: 80,
            finish_reason: "stop",
            latency: 2405,
          },
          dataset_sample_id: "1",
          created_at: "2024-04-26T00:50:28.391Z",
          run_id: "4b61",
          scores: [{ score: 1, name: "is-json", message: "" }],
        },
      },
    ];

    // const lines = data.split(/\n/);
    // const jsonData = lines
    //   .filter((l) => !!l)
    //   .map((line) => {
    //     return JSON.parse(line);
    //   });
    const encoder = new TextEncoder();
    // await db.registerFileBuffer(
    //   "file.json",
    //   new Uint8Array(await streamResponse.arrayBuffer()),
    // );
    // await conn.insertJSONFromPath("file.json", {
    //   name: "file",
    // });
    // ... or column-major format
    const buffer = encoder.encode(JSON.stringify(jsonData));
    await db.registerFileBuffer("test", buffer);
    // await db.registerFileText("test", JSON.stringify(jsonData));
    // ... with typed insert options
    await conn.insertJSONFromPath("test", {
      name: "run",
      schema: "main",
    });
    const results = await conn.query("SELECT * FROM main.run");
    console.log(results);
    //@ts-ignore
    window.results = results;
    return conn;
  };
}

export type RunResultTableHeader = {
  title: string;
  description?: string;
  runResult?: RunResult;
  type: "input" | "expected" | "completion";
  active?: boolean;
};

export function useRunResultTableView({ runs = [] }: { runs: RunResult[] }) {
  const [activeRun, setActiveRun] = useState<RunResult | undefined>();
  const tableHeaders = useMemo(() => {
    const tableHeaders: RunResultTableHeader[] = [
      { title: "Samples", type: "input" },
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

  const getTableRowSamples = useCallback((runs: RunResult[]) => {
    return Array.from(
      new Set(runs.flatMap((run) => run.samples.map((sample) => sample.id))),
    );
  }, []);

  const getSampleCell = useCallback(
    (id: string, run: RunResult | undefined) => {
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
    runsMap: new Map<string, RunResult>(),
    activeRun,
    setActiveRun,
  };
}
