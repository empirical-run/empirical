import { PackageManager } from "../pkg-managers/interface";
import { Generator } from "./interface";
import { JSGenerator } from "./js";
import { JSONGenerator } from "./json";
import { TSGenerator } from "./ts";

export function getGenerator(
  format: string,
  packageManager: PackageManager,
): Generator {
  if (format.includes("Javascript")) {
    return new JSGenerator({ packageManager });
  } else if (format.includes("Typescript")) {
    return new TSGenerator({ packageManager });
  }
  return new JSONGenerator();
}
