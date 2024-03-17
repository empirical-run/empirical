#!/usr/bin/env node
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { green, red, yellow, bold } from "picocolors";
import { promises as fs } from "fs";
import { program } from "commander";
import packageJSON from "../../package.json";
import { RunsConfig } from "../types";
import { execute } from "@empiricalrun/core";
import { loadDataset } from "./dataset";
import { Dataset, RunCompletion } from "@empiricalrun/types";
import cliProgress from "cli-progress";
import express from "express";
import path from "path";

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
  .action(async () => {
    console.log(yellow("Initiating run..."));
    let data;
    try {
      data = await fs.readFile(configFileFullPath);
    } catch (err) {
      console.log(`${red("[Error]")} Failed to read ${configFileName} file`);
      console.log(yellow("Please ensure running init command first"));
      return;
    }

    console.log(`${green("[Success]")} - read ${configFileName} file`);
    const jsonStr = data.toString();
    const { runs, dataset: datasetConfig } = JSON.parse(jsonStr) as RunsConfig;
    // TODO: add check here for empty runs config. Add validator of the file
    const dataset = await loadDataset(datasetConfig);
    if (!dataset) {
      return;
    }

    const progressBar = setupProgressBar(
      runs.length * (dataset.samples || []).length,
    );
    const completion = await Promise.all(
      runs.map((r) =>
        execute(r, dataset.samples || [], () => progressBar.increment()),
      ),
    );
    progressBar.stop();

    if (process.env.CI !== "true") {
      const data: { runs: RunCompletion[]; dataset: Dataset } = {
        runs: completion,
        dataset: dataset,
      };
      await fs.mkdir(`${cwd}/${cacheDir}`, { recursive: true });
      await fs.writeFile(outputFilePath, JSON.stringify(data, null, 2));
    }
  });

program
  .command("ui")
  .description("visualise the results of a run")
  .action(async () => {
    console.log(yellow("Initiating webapp..."));
    const app = express();
    const port = 8000;
    app.use(express.static(path.join(__dirname, "../webapp")));
    app.get("/api/results", (req, res) => res.sendFile(outputFilePath));
    const fullUrl = `http://localhost:${port}`;
    app.listen(port, () => console.log(`Empirical app running on ${fullUrl}`));
  });

program.parse();
