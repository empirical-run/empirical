#!/usr/bin/env node
import { red, yellow, bold, cyan, underline } from "picocolors";
import { promises as fs } from "fs";
import { program } from "commander";
import express from "express";
import path from "path";
import opener from "opener";
import dotenv from "dotenv";
import packageJSON from "../../package.json";
import {
  EmpiricalStore,
  execute,
  getLocalDBInstance,
  Telemetry,
  runEventProperties,
} from "../index";
import { loadDataset } from "./dataset";
import { DatasetError } from "./error";
import {
  Dataset,
  RunConfig,
  RunCompletion,
  RunStatsUpdate,
  RuntimeOptions,
} from "@empiricalrun/types";
import {
  failedOutputsSummary,
  printStatsSummary,
  setRunSummary,
} from "./stats";
import { reportOnCI } from "./reporters/ci";
import detect from "detect-port";
import {
  ProgressBar,
  buildErrorLog,
  buildWarningLog,
  getCliProgressLoggerInstance,
} from "./logger/cli-logger";
import { readEmpiricalConfig } from "./config";

const cwd = process.cwd();

const cacheDir = ".empiricalrun";
const outputFilePath = `${cwd}/${cacheDir}/output.json`;
const runtimeOptionsPath = `${cwd}/${cacheDir}/runtime.json`;

const telemetry = new Telemetry();

program
  .name("Empirical.run CLI")
  .description(
    "CLI to compare and evaluate AI models across all the scenarios that matter",
  )
  .version(packageJSON.version);

program
  .description("initiate a run to evaluate model completions")
  .option(
    "-pyp, --python-path <char>",
    "Provide the python executable path for the python scripts",
  )
  .option(
    "-env, --env-file <char>",
    "Provide path to .env file to load environment variables",
  )
  .action(async (options) => {
    const envFilePath = options.envFile || [".env.local", ".env"];
    const runTimeOptions: RuntimeOptions = {
      envFilePath,
      pythonPath: options.pythonPath,
    };
    dotenv.config({ path: runTimeOptions.envFilePath });
    console.log(yellow("Initiating run..."));
    telemetry.logEvent("run.start");

    const startTime = performance.now();
    const { runs, dataset: datasetConfig } = await readEmpiricalConfig();

    let dataset: Dataset;
    const store = new EmpiricalStore();
    try {
      dataset = await loadDataset(datasetConfig);
      const datasetRecorder = store.getDatasetRecorder();
      await datasetRecorder(dataset);
    } catch (error) {
      if (error instanceof DatasetError) {
        console.log(`${red("[Error]")} ${error.message}`);
        process.exit(1);
      } else {
        throw error;
      }
    }
    const cliProgressBar = getCliProgressLoggerInstance();
    const totalOutputsCount = runs.length * (dataset.samples || []).length;
    const progressBar = cliProgressBar.create(totalOutputsCount, 0, {
      name: "Outputs",
    });
    const totalScoresCount = runs.reduce(
      (agg, run) =>
        agg + (dataset.samples || []).length * (run.scorers?.length || 0),
      0,
    );
    let scoresProgressBar: ProgressBar | undefined = undefined;
    if (totalScoresCount) {
      scoresProgressBar = cliProgressBar.create(totalScoresCount, 0, {
        name: "Scores ",
      });
    }
    const completion = await Promise.all(
      runs.map((r) => {
        r.parameters = r.parameters ? r.parameters : {};
        return execute(
          r,
          dataset,
          (update) => {
            if (update.type === "run_sample") {
              progressBar.increment();
            }
            if (update.type === "run_sample_score") {
              scoresProgressBar?.increment(update.data.scores.length);
            }
          },
          store,
          runTimeOptions,
        );
      }),
    );
    cliProgressBar.stop();
    setRunSummary(completion);
    printStatsSummary(completion);

    // TODO: this is not sent in CI report
    console.log(bold("Total dataset samples:"), dataset.samples?.length || 0);
    const endTime = performance.now();
    console.log(
      bold("Done in"),
      yellow(((endTime - startTime) / 1000).toFixed(2)),
      "seconds",
    );

    if (process.env.CI !== "true") {
      const data: { runs: RunCompletion[]; dataset: Dataset } = {
        runs: completion,
        dataset: dataset,
      };
      await fs.mkdir(`${cwd}/${cacheDir}`, { recursive: true });
      await fs.writeFile(outputFilePath, JSON.stringify(data, null, 2));
      await fs.writeFile(runtimeOptionsPath, JSON.stringify(runTimeOptions));
    } else {
      await reportOnCI(completion, dataset);
    }

    await telemetry.logEvent("run.complete", runEventProperties(runs, dataset));
    const failedOutputs = failedOutputsSummary(completion);
    if (failedOutputs) {
      const { code, message } = failedOutputs;
      console.log(
        buildErrorLog("Some outputs were not generated successfully"),
      );
      console.log(buildErrorLog(`${code}: ${message}`));
      await telemetry.shutdown();
      process.exit(1);
    } else {
      await telemetry.shutdown();
      process.exit(0);
    }
  });

const defaultWebUIPort = 1337;
program
  .command("ui")
  .description("visualise the results of a run in your web browser")
  .option(
    "-p, --port <int>",
    "port to run the empirical webapp on",
    `${defaultWebUIPort}`,
  )
  .action(async (options) => {
    console.log(yellow("Initiating webapp..."));
    const app = express();
    const port =
      !options.port || isNaN(Number(options.port))
        ? defaultWebUIPort
        : Number(options.port);
    const availablePort = await detect(port);
    if (availablePort !== port) {
      console.warn(
        buildWarningLog(
          `Port ${port} is unavailable. Trying port ${availablePort}.`,
        ),
      );
    }

    let runtimeOptions: RuntimeOptions | undefined;
    try {
      const dataStr = await fs.readFile(runtimeOptionsPath);
      runtimeOptions = JSON.parse(dataStr.toString());
      if (runtimeOptions?.envFilePath) {
        dotenv.config({ path: runtimeOptions.envFilePath! });
      }
    } catch (e) {
      runtimeOptions = undefined;
    }

    // TODO: get rid of this with dataset id support
    app.use(express.json({ limit: "50mb" }));
    app.use(express.static(path.join(__dirname, "../webapp")));
    app.get("/api/results", (req, res) => res.sendFile(outputFilePath));
    app.get("/api/runs/:id/score/distribution", async (req, res) => {
      const dbInstance = await getLocalDBInstance();
      const tableName = `runs${req.params.id}`;
      const path = `.empiricalrun/runs/${req.params.id}.jsonl`;
      // TODO: find a better solve for scenarios where this table exists
      // currently it throws error while doing unnest
      await dbInstance.exec(`drop table if exists ${tableName}`);
      await dbInstance.exec(
        `create table if not exists ${tableName} as select * from read_json_auto('${path}')`,
      );
      const messages = await dbInstance.all(
        `select score.name, score.message as message, score.score, count(*) as count from ${tableName}, unnest(sample.scores) t(score) where sample is not null group by 1,2,3 order by 4 desc, 1 asc`,
      );
      const scores = await dbInstance.all(
        `select score.name, score.score, count(*) as count from ${tableName}, unnest(sample.scores) t(score) where sample is not null group by 1,2 order by 3 desc, 1 asc`,
      );

      const messagesResp = JSON.parse(
        JSON.stringify(messages, (key, value) =>
          typeof value === "bigint" ? Number(value) : value,
        ),
      );
      const scoresResp = JSON.parse(
        JSON.stringify(scores, (key, value) =>
          typeof value === "bigint" ? Number(value) : value,
        ),
      );
      await dbInstance.exec(`drop table ${tableName}`);
      res.send({
        success: true,
        data: {
          scores: scoresResp,
          messages: messagesResp,
        },
      });
    });
    app.delete("/api/runs/:id", async (req, res) => {
      try {
        const file = await fs.readFile(outputFilePath);
        const { runs, dataset } = JSON.parse(file.toString()) as {
          runs: RunCompletion[];
          dataset: Dataset;
        };
        const updatedRuns = runs.filter((run) => run.id !== req.params.id);
        await fs.writeFile(
          outputFilePath,
          JSON.stringify({ runs: updatedRuns, dataset }, null, 2),
        );
      } catch (e: any) {
        res.send({
          success: false,
          error: {
            message: e.message,
          },
        });
      }
      res.send({
        success: true,
      });
    });
    app.post("/api/runs/execute", async (req, res) => {
      const { runs, dataset, persistToFile } = req.body as {
        runs: RunConfig[];
        dataset: Dataset;
        persistToFile: boolean;
      };
      telemetry.logEvent("ui.run.start", {
        ...runEventProperties(runs, dataset),
        persist_to_file: persistToFile,
      });
      const streamUpdate = (obj: any) => res.write(JSON.stringify(obj) + `\n`);
      // This endpoint expects to execute only one run
      let store = persistToFile ? new EmpiricalStore() : undefined;
      const completion = await execute(
        runs[0]!,
        dataset,
        streamUpdate,
        store,
        runtimeOptions,
      );
      setRunSummary([completion]);
      const statsUpdate: RunStatsUpdate = {
        type: "run_stats",
        data: completion.stats!,
      };
      streamUpdate(statsUpdate);
      if (persistToFile) {
        const file = await fs.readFile(outputFilePath);
        const { runs: savedRuns } = JSON.parse(file.toString());
        savedRuns.push(completion);
        await fs.writeFile(
          outputFilePath,
          JSON.stringify({ runs: savedRuns, dataset }, null, 2),
        );
      }
      res.end();
    });
    const fullUrl = `http://localhost:${availablePort}`;
    app.listen(availablePort, () => {
      console.log(cyan(`Empirical app running on ${underline(fullUrl)}`));
      opener(fullUrl);
      telemetry.logEvent("ui.open");
    });
  });

program.parse();

process.on("SIGINT", async function () {
  // Overriding ctrl-C handler to shutdown telemetry for ui command
  await telemetry.shutdown();
  process.exit();
});
