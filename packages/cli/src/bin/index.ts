#!/usr/bin/env node
import { green, red, yellow, bold } from "picocolors";
import { promises as fs } from "fs";
import { program } from "commander";
import cliProgress from "cli-progress";
import express from "express";
import path from "path";
import opener from "opener";
import dotenv from "dotenv";
import packageJSON from "../../package.json";
import { execute } from "@empiricalrun/core";
import { RunsConfig } from "../types";
import { loadDataset } from "./dataset";
import { DatasetError } from "../error";
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { Dataset, RunConfig, RunCompletion } from "@empiricalrun/types";
import {
  failedOutputsSummary,
  printStatsSummary,
  setRunSummary,
} from "../stats";
import { reportOnCI } from "../reporters/ci";
import detect from "detect-port";

const configFileName = "empiricalrc.json";
const cwd = process.cwd();
const configFileFullPath = `${cwd}/${configFileName}`;
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

const outputFileName = "output.json";
const cacheDir = ".empiricalrun";
const outputFilePath = `${cwd}/${cacheDir}/${outputFileName}`;

function setupProgressBar(total: number) {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(total, 0);
  return bar;
}

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
      `${green("[Success]")} - created ${bold(`${configFileName}`)} in ${cwd}`,
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
      console.log(`${red("[Error]")} Failed to read ${configFileName} file`);
      console.log(yellow("Please ensure running init command first"));
      process.exit(1);
    }

    console.log(`${green("[Success]")} - read ${configFileName} file`);
    const jsonStr = data.toString();
    const { runs, dataset: datasetConfig } = JSON.parse(jsonStr) as RunsConfig;
    // TODO: add check here for empty runs config. Add validator of the file

    let dataset: Dataset;
    try {
      dataset = await loadDataset(datasetConfig);
    } catch (error) {
      if (error instanceof DatasetError) {
        console.log(`${red("[Error]")} ${error.message}`);
        process.exit(1);
      } else {
        throw error;
      }
    }

    const progressBar = setupProgressBar(
      runs.length * (dataset.samples || []).length,
    );
    const completion = await Promise.all(
      runs.map((r) => {
        r.parameters = r.parameters ? r.parameters : {};
        r.parameters.pythonPath = options.pythonPath;
        return execute(r, dataset, (update) => {
          if (update.type === "run_sample") {
            progressBar.increment();
          }
        });
      }),
    );
    progressBar.stop();

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
        `${red("[Error]")} Some outputs were not generated successfully`,
      );
      console.log(`${red("[Error]")} ${code}: ${message}`);
      process.exit(1);
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
      console.log(
        `${yellow("[Warning]")} Port ${port} is unavailable. Trying port ${availablePort}.`,
      );
    }
    // TODO: get rid of this with dataset id support
    app.use(express.json({ limit: "50mb" }));
    app.use(express.static(path.join(__dirname, "../webapp")));
    app.get("/api/results", (req, res) => res.sendFile(outputFilePath));
    app.post("/api/run/execute", async (req, res) => {
      const { runs, dataset } = req.body as {
        runs: RunConfig[];
        dataset: Dataset;
      };
      const streamUpdate = (obj: any) => res.write(JSON.stringify(obj) + `\n`);
      const completion = await execute(runs[0]!, dataset, streamUpdate);
      setRunSummary([completion]);
      streamUpdate({ type: "stats_update", data: completion.stats });
      res.end();
    });
    const fullUrl = `http://localhost:${availablePort}`;
    app.listen(availablePort, () => {
      console.log(`Empirical app running on ${fullUrl}`);
      opener(fullUrl);
    });
  });

program.parse();
