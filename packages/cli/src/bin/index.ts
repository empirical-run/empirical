#!/usr/bin/env node
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { green, red, yellow, bold } from "picocolors";
import fs from "fs";
import { program } from "commander";
import packageJSON from "../../package.json";
import { RunsConfig } from "../types";
import { execute } from "@empiricalrun/core";
import { RunCompletion } from "@empiricalrun/types";

const configFileName = "empiricalrun.config.json";
const path = process.cwd();
const configFileFullPath = `${path}/${configFileName}`;
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

const outputFileName = "output.json";
const cacheDir = ".empiricalrun";
const outputFilePath = `${path}/${cacheDir}/${outputFileName}`;

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
    fs.writeFileSync(configFileFullPath, JSON.stringify(config, null, 2));
    console.log(
      `${green("[Success]")} - created ${bold(`${configFileName}`)} in ${path}`,
    );
  });

program
  .command("run")
  .description("initiate a run to evaluate model completions")
  .action(async () => {
    console.log(yellow("Initiating run..."));
    fs.readFile(configFileFullPath, async (err, data) => {
      if (err) {
        console.log(`${red("[Error]")} Failed to read ${configFileName} file`);
        console.log(yellow("Please ensure running init command first"));
        return;
      }
      console.log(`${green("[Success]")} - read ${configFileName} file`);
      const jsonStr = data.toString();
      const { runs, dataset } = JSON.parse(jsonStr) as RunsConfig;
      // TODO: add check here for empty runs config. Add validator of the file
      const completion = await Promise.all(
        runs.map((r) => execute(r, dataset)),
      );
      if (process.env.CI !== "true") {
        const data: { runs: RunCompletion[] } = {
          runs: completion,
        };
        fs.mkdirSync(`${path}/${cacheDir}`, { recursive: true });
        fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
      }
    });
  });

program.parse();
