import path from "path";
import { EMPIRICAL_PKG_NAME, GEN_CONFIG_FILE_NAME } from "../../constant";
import { PackageManager } from "../../pkg-managers/interface";
import { Generator } from "../interface";
import {
  copyConfigFile,
  generateGitIgnore,
  isPackageJSONPresent,
} from "../utils";
import { Logger } from "../../logger";
export class JSGenerator implements Generator {
  format = "js";
  packageManager: PackageManager;
  private logger: Logger;
  constructor({
    packageManager,
    logger,
  }: {
    packageManager: PackageManager;
    logger: Logger;
  }) {
    this.packageManager = packageManager;
    this.logger = logger;
  }

  async generate() {
    const cwd = process.cwd();

    const isPackageJSONAvailable = await isPackageJSONPresent(cwd);
    if (!isPackageJSONAvailable) {
      this.logger.log(`Initializing ${this.packageManager.name} project...`);
      this.packageManager.init();
    }

    this.logger.log("Installing empirical dependencies...");
    this.packageManager.installDevDependency(EMPIRICAL_PKG_NAME);

    this.logger.log(`Setting up sample ${this.format} configuration file ...`);
    await copyConfigFile({
      source: {
        file: `empiricalrun-config.${this.format}`,
        dir: path.join(__dirname, "./assets"),
      },
      target: {
        file: `${GEN_CONFIG_FILE_NAME}.${this.format}`,
        dir: process.cwd(),
      },
    });

    this.logger.log("Adding empirical cache directory to gitignore");
    await generateGitIgnore(cwd);
  }
}
