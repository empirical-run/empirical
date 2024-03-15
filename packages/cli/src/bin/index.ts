#!/usr/bin/env node
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { green, red, yellow, bold } from "picocolors";
import fs from "fs";
import { program } from "commander";
import packageJSON from "../../package.json";
import { RunsConfig } from "../types";
import { execute } from "@empiricalrun/core";
import { Dataset } from "@empiricalrun/types";

const fileName = "empiricalrun.config.json";

const path = process.cwd();
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

async function downloadDataset(path: string): Promise<Dataset | undefined> {
  if (path.startsWith("http")) {
    const response = await fetch(path);
    const body = await response.text();
    return JSON.parse(body);
  }
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
  .action(() => {
    fs.writeFileSync(`${path}/${fileName}`, JSON.stringify(config, null, 2));
    console.log(
      `${green("[Success]")} - created ${bold(`${fileName}`)} in ${path}`,
    );
  });

program
  .command("run")
  .description("initiate a run to evaluate model completions")
  .action(async () => {
    console.log(yellow("Initiating run..."));
    fs.readFile(`${path}/${fileName}`, async (err, data) => {
      if (err) {
        console.log(`${red("[Error]")} Failed to read ${fileName} file`);
        console.log(yellow("Please ensure running init command first"));
        return;
      }
      console.log(`${green("[Success]")} - read ${fileName} file`);
      const jsonStr = data.toString();
      const { runs, dataset } = JSON.parse(jsonStr) as RunsConfig;
      if (dataset.path && !dataset.samples) {
        const downloaded = await downloadDataset(dataset.path);
        dataset.samples = downloaded?.samples;
      }
      // TODO: add check here for empty runs config. Add validator of the file
      const completion = await execute(runs[0]!, dataset.samples || []);
      console.log(JSON.stringify(completion, null, 2));
    });
  });

program.parse();
