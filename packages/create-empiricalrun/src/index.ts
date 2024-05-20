#!/usr/bin/env node
import { prompt } from "enquirer";
import { getPackageManager } from "./pkg-managers";
import { getGenerator } from "./generator";
import { CustomLogger } from "./logger";
import { bold, cyan, underline } from "picocolors";

interface Config {
  format: "JSON" | "Javascript" | "Typescript";
}

const logger = new CustomLogger();

(async function init() {
  let config: Config = {
    format: "JSON",
  };
  try {
    config = await prompt<Config>([
      {
        name: "format",
        type: "select",
        message: "What kind of format do you want for your configuration file?",
        choices: ["JSON", "Javascript", "Typescript"],
      },
    ]);
  } catch (e: any) {
    process.exit(1);
  }

  try {
    const packageManager = getPackageManager();
    logger.log(`Using ${packageManager.name} package manager for setup`);
    const generator = getGenerator(config!.format, packageManager, logger);
    await generator.generate();
    logger.success(`${bold("Empirical setup completed successfully")} ✨`);
    console.log(
      `
  You can now run following command to run your first test:

  ${bold(cyan(`${packageManager.exec} empiricalrun`))} 

  
  After running your first test, you can use "ui" command to open test report on your browser:

  ${bold(cyan(`${packageManager.exec} empiricalrun ui`))} 


  Visit ${bold(underline("https://docs.empirical.run"))} for more details
    `,
    );
  } catch (e: any) {
    console.log(JSON.stringify(e));
    logger.error(bold("Failed to setup"), e);
    process.exit(1);
  }
  process.exit(0);
})();

process.on("SIGINT", function () {
  // gracefully exit on Ctrl-C
  logger.warn("Process interrupted, exiting");
});
