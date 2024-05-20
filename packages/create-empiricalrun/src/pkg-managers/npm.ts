import { execSync } from "child_process";
import { PackageManager } from "./interface";

export class NPM implements PackageManager {
  name = "npm";
  exec = "npx";
  static check(userAgent: string): boolean {
    return userAgent.includes("npm");
  }

  private executeCommand(cmd: string) {
    execSync(cmd, {
      stdio: "inherit",
    });
  }

  private getCommand(cmd: string) {
    return `${this.name} ${cmd}`;
  }

  install() {
    const cmd = this.getCommand("i");
    this.executeCommand(cmd);
  }

  init() {
    const cmd = this.getCommand("init -y");
    this.executeCommand(cmd);
    this.install();
  }

  installDependency(pkg: string) {
    const cmd = this.getCommand(`i ${pkg} --save`);
    this.executeCommand(cmd);
  }

  installDevDependency(pkg: string) {
    const cmd = this.getCommand(`i ${pkg} --save-dev`);
    this.executeCommand(cmd);
  }
}
