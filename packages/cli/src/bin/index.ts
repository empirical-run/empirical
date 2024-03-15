#!/usr/bin/env node
import { DefaultRunsConfigType, getDefaultRunsConfig } from "../runs";
import { green, red, yellow, bold } from "picocolors";
import fs from "fs";
import { program } from "commander";
import packageJSON from "../../package.json";
import { RunsConfig } from "../types";
import { execute } from "@empiricalrun/core";

const path = process.cwd();
const config = getDefaultRunsConfig(DefaultRunsConfigType.DEFAULT);

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
    fs.writeFileSync(
      `${path}/empiricalrun.config.json`,
      JSON.stringify(config, null, 2),
    );
    console.log(
      `${green("[Success]")} - created ${bold("empirical.run.json")} in ${path}`,
    );
  });

program
  .command("run")
  .description("initiate a run to evaluate model complettions")
  .action(() => {
    console.log(yellow("Initiating run..."));
    fs.readFile(`${path}/empirical.run.json`, (err, data) => {
      if (err) {
        console.log(`${red("[Error]")} Failed to read empirical.run.json file`);
        console.log(yellow("Please ensure running init command first"));
        return;
      }
      console.log(`${green("[Success]")} - read empirical.run.json file`);
      const jsonStr = data.toString();
      const jsonObj = JSON.parse(jsonStr) as RunsConfig;
      // TODO: add check here for empty runs config. Add validator of the file
      execute(jsonObj.runs[0]!, jsonObj.dataset);
    });
  });

program.parse();
