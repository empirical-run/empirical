import { PackageManager, PackageManagerConstructor } from "./interface";
import { NPM } from "./npm";

const supportedPkgManager = [NPM];

export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;
  const PkgMngr: PackageManagerConstructor | undefined =
    supportedPkgManager.find((manager) => manager.check(userAgent!));
  if (!PkgMngr) {
    throw new Error("Package manager not supported");
  }
  return new PkgMngr();
}
