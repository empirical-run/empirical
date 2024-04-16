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
} from "@empiricalrun/core";
import { RunsConfig } from "../types";
import { loadDataset } from "./dataset";
import { DatasetError } from "../error";
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import {
  Dataset,
  RunConfig,
  RunCompletion,
  RunStatsUpdate,
} from "@empiricalrun/types";
import {
  failedOutputsSummary,
  printStatsSummary,
  setRunSummary,
} from "../stats";
import { reportOnCI } from "../reporters/ci";
import detect from "detect-port";
import {
  ProgressBar,
  buildErrorLog,
  buildSuccessLog,
  buildWarningLog,
  getCliProgressLoggerInstance,
} from "./logger/cli-logger";

const configFileName = "empiricalrc.json";
const cwd = process.cwd();
const configFileFullPath = `${cwd}/${configFileName}`;
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

const outputFileName = "output.json";
const cacheDir = ".empiricalrun";
const outputFilePath = `${cwd}/${cacheDir}/${outputFileName}`;

program
  .name("Empirical.run CLI")
  .description(
    "CLI to compare and evaluate multiple AI model completions on different prompts and models",
  )
  .version(packageJSON.version);

program
  .command("init")
  .description("initialise empirical")
  .action(async () => {
    await fs.writeFile(configFileFullPath, JSON.stringify(config, null, 2));
    console.log(
      buildSuccessLog(`created ${bold(`${configFileName}`)} in ${cwd}`),
    );
  });

program
  .command("run")
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
    dotenv.config({ path: options.envFile || [".env.local", ".env"] });
    console.log(yellow("Initiating run..."));

    let data;
    const startTime = performance.now();
    try {
      data = await fs.readFile(configFileFullPath);
    } catch (err) {
      console.log(buildErrorLog(`Failed to read ${configFileName} file`));
      console.log(yellow("Please ensure running init command first"));
      process.exit(1);
    }

    console.log(buildSuccessLog(`read ${configFileName} file successfully`));
    const jsonStr = data.toString();
    const { runs, dataset: datasetConfig } = JSON.parse(jsonStr) as RunsConfig;
    // TODO: add check here for empty runs config. Add validator of the file
    let dataset: Dataset;
    try {
      dataset = await loadDataset(datasetConfig);
      const store = new EmpiricalStore();
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
    const store = new EmpiricalStore();
    const completion = await Promise.all(
      runs.map((r) => {
        r.parameters = r.parameters ? r.parameters : {};
        r.parameters.pythonPath = options.pythonPath;
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
    } else {
      await reportOnCI(completion, dataset);
    }

    const failedOutputs = failedOutputsSummary(completion);
    if (failedOutputs) {
      const { code, message } = failedOutputs;
      console.log(
        buildErrorLog("Some outputs were not generated successfully"),
      );
      console.log(buildErrorLog(`${code}: ${message}`));
      process.exit(1);
    }
    process.exit(0);
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
    // TODO: get rid of this with dataset id support
    app.use(express.json({ limit: "50mb" }));
    app.use(express.static(path.join(__dirname, "../webapp")));
    app.get("/api/results", (req, res) => res.sendFile(outputFilePath));
    app.get("/api/runs/:id/score/distribution", async (req, res) => {
      const dbInstance = await getLocalDBInstance();
      const tableName = `runs${req.params.id}`;
      const path = `.empiricalrun/runs/${req.params.id}.jsonl`;
      await dbInstance.exec(
        `create table ${tableName} as select * from read_json_auto('${path}')`,
      );
      const messages = await dbInstance.all(
        `select score.name, score.message as message, score.score, count(*) as count from ${tableName}, unnest(sample.scores) t(score) group by 1,2,3 order by 4 desc, 1 asc`,
      );
      const scores = await dbInstance.all(
        `select score.name, score.score, count(*) as count from ${tableName}, unnest(sample.scores) t(score) group by 1,2 order by 3 desc, 1 asc`,
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
      const streamUpdate = (obj: any) => res.write(JSON.stringify(obj) + `\n`);
      // This endpoint expects to execute only one run
      const completion = await execute(runs[0]!, dataset, streamUpdate);
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
    });
  });

program.parse();
