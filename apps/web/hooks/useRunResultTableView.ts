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
    const streamResponse = await fetch(
      `https://assets-test.empirical.run/runs%2F102%2Foutput.json`,
    );
    const data = await streamResponse.json();

    // await db.registerFileBuffer(
    //   "file.json",
    //   new Uint8Array(await streamResponse.arrayBuffer()),
    // );
    // await conn.insertJSONFromPath("file.json", {
    //   name: "file",
    // });
    // ... or column-major format
    await db.registerFileText("columns.json", JSON.stringify(data));
    // ... with typed insert options
    await conn.insertJSONFromPath("columns.json", { name: "columns" });
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
