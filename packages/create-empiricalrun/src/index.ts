#!/usr/bin/env node
import { prompt } from "enquirer";
import { getPackageManager } from "./pkg-managers";
import { getGenerator } from "./generator";

interface Config {
  format: "JSON" | "Javascript" | "Typescript";
}

// ask which format
// if the format is just JSON, use JSON generator
// if the format is js then use JS generator
// in the JS generator have steps for installing dependencies for JS
// TS generator extends JS but with one step overriden for file generation

async function getConfig() {
  const config: Config = await prompt([
    {
      name: "format",
      type: "select",
      message: "What kind of format do you want for your configuration file?",
      choices: ["JSON", "Javascript", "Typescript"],
    },
  ]);
  const packageManager = getPackageManager();
  console.log(`Using ${packageManager.name} for installation`);
  console.log(`Selected format: ${config.format}`);
  const generator = getGenerator(config.format, packageManager);
  await generator.generate();
}

getConfig();
