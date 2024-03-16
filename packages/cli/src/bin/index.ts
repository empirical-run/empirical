#!/usr/bin/env node
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { green, red, yellow, bold } from "picocolors";
import { promises as fs } from "fs";
import { program } from "commander";
import packageJSON from "../../package.json";
import { RunsConfig } from "../types";
import { execute } from "@empiricalrun/core";
import { Dataset } from "@empiricalrun/types";
import { RunCompletion } from "@empiricalrun/types";
import cliProgress from "cli-progress";

const configFileName = "empiricalrun.rc.json";
const path = process.cwd();
const configFileFullPath = `${path}/${configFileName}`;
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

async function downloadDataset(path: string): Promise<Dataset | undefined> {
  if (path.startsWith("http")) {
    const response = await fetch(path);
    const body = await response.text();
    return JSON.parse(body);
  }
}
const outputFileName = "output.json";
const cacheDir = ".empiricalrun";
const outputFilePath = `${path}/${cacheDir}/${outputFileName}`;

function setupProgressBar(total: number) {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(total, 0);
  return bar;
}

program
  .name("Empirical.run CLI")
  .description(
    "CLI to compare and evaluate multiple AI model completions on different prompts and model",
  )
  .version(packageJSON.version);

program
  .command("init")
  .description("initialise empirical")
  .action(async () => {
    await fs.writeFile(configFileFullPath, JSON.stringify(config, null, 2));
    console.log(
      `${green("[Success]")} - created ${bold(`${configFileName}`)} in ${path}`,
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
    const { runs, dataset } = JSON.parse(jsonStr) as RunsConfig;
    // TODO: add check here for empty runs config. Add validator of the file

    if (dataset.path && !dataset.samples) {
      const downloaded = await downloadDataset(dataset.path);
      dataset.samples = downloaded?.samples;
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
      const data: { runs: RunCompletion[] } = {
        runs: completion,
      };
      await fs.mkdir(`${path}/${cacheDir}`, { recursive: true });
      await fs.writeFile(outputFilePath, JSON.stringify(data, null, 2));
    }
  });

program.parse();
