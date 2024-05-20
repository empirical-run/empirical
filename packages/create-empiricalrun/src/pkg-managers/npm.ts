import { execSync } from "child_process";
import { PackageManager } from "./interface";
import { execPromisified } from "./utils";

export class NPM implements PackageManager {
  static check(userAgent: string): boolean {
    return userAgent.includes("npm");
  }

  get name() {
    return "npm";
  }

  async install() {
    await execPromisified("npm install");
  }

  async init() {
    await execPromisified(`npm init -y`);
    await this.install();
  }

  async installDependency(pkg: string) {
    execSync(`npm install ${pkg} --save`, {
      stdio: "inherit",
    });
  }

  async installDevDependency(pkg: string) {
    execSync(`npm install ${pkg} --save-dev`, {
      stdio: "inherit",
    });
  }
}
