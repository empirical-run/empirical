import { PackageManager } from "../../pkg-managers/interface";
import { Generator } from "../interface";
import { generateGitIgnore } from "../utils";
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
  }
}
