import path from "path";
import { EMPIRICAL_PKG_NAME, GEN_CONFIG_FILE_NAME } from "../../constant";
import { PackageManager } from "../../pkg-managers/interface";
import { Generator } from "../interface";
import {
  copyConfigFile,
  generateGitIgnore,
  isPackageJSONPresent,
} from "../utils";
export class JSGenerator implements Generator {
  format = "js";
  packageManager: PackageManager;
  constructor({ packageManager }: { packageManager: PackageManager }) {
    this.packageManager = packageManager;
  }

  async generate() {
    // generate json file
    const cwd = process.cwd();
    await generateGitIgnore(cwd);
    console.log("added git ignore");
    let isPackageJSONAvailable = await isPackageJSONPresent(cwd);
    if (!isPackageJSONAvailable) {
      console.log("No package json found, initializing npm project");
      await this.packageManager.init();
    }
    console.log("installing dependencies");
    isPackageJSONAvailable = await isPackageJSONPresent(cwd);
    if (isPackageJSONAvailable) {
      console.log("package.json found");
    }
    await this.packageManager.installDevDependency(EMPIRICAL_PKG_NAME);
    console.log("creating empiricalrc config");
    await copyConfigFile({
      source: {
        file: `empiricalrun-config.${this.format}`,
        dir: path.join(__dirname, "../../assets"),
      },
      target: {
        file: `${GEN_CONFIG_FILE_NAME}.${this.format}`,
        dir: process.cwd(),
      },
    });
    console.log("generatated empiricalrc config");
  }
}
