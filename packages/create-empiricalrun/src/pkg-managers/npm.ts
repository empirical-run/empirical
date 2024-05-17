import { PackageManager } from "./interface";
import { exec } from "child_process";

export class NPM implements PackageManager {
  static check(userAgent: string): boolean {
    return userAgent.includes("npm");
  }

  get name() {
    return "npm";
  }

  async installDependency(pkg: string) {
    await exec(`npm install ${pkg} --save`);
  }
}
