#!/usr/bin/env node
import { prompt } from "enquirer";
import { getPackageManager } from "./pkg-managers";
import { getGenerator } from "./generator";
import { CustomLogger } from "./logger";
import { bold, cyan, underline } from "picocolors";
import { PackageManager } from "./pkg-managers/interface";

interface GeneratorConfig {
  type: "JSON" | "Javascript" | "Typescript";
}

const logger = new CustomLogger();

function logPostSetupSteps(packageManager: PackageManager) {
  console.log(
    `
  You can now run following command to run your first test:

  ${bold(cyan(`${packageManager.exec} empiricalrun`))} 

  
  After running your first test, you can use "ui" command to open test report on your browser:

  ${bold(cyan(`${packageManager.exec} empiricalrun ui`))} 


  Visit ${bold(underline("https://docs.empirical.run"))} for more details
    `,
  );
}

(async function init() {
  let config: GeneratorConfig = {
    type: "JSON",
  };
  try {
    config = await prompt<GeneratorConfig>([
      {
        name: "type",
        type: "select",
        message:
          "Do you want to use JSON or JavaScript or TypeScript to setup empirical? (Use arrow keys)",
        choices: [
          { name: "JSON" },
          { name: "Javascript" },
          { name: "Typescript" },
        ],
      },
    ]);
  } catch (e: any) {
    process.exit(1);
  }

  try {
    const packageManager = getPackageManager();
    logger.log(`Using ${packageManager.name} package manager for setup`);
    const generator = getGenerator(config!.type, packageManager, logger);
    await generator.generate();
    logger.success(`${bold("Empirical setup completed successfully")} ✨`);
    logPostSetupSteps(packageManager);
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
