import { EmpiricalrunConfig } from "@empiricalrun/types";
import { getFileLoaderForFileName } from "./loaders/file";
import {
  buildErrorLog,
  buildSuccessLog,
  buildWarningLog,
} from "./logger/cli-logger";

export async function readEmpiricalConfig(): Promise<EmpiricalrunConfig> {
  const cwd = process.cwd();
  const fileName = "empiricalrc";
  try {
    const loader = await getFileLoaderForFileName(fileName, cwd);
    const config = await loader<EmpiricalrunConfig>();
    console.log(buildSuccessLog(`read ${fileName} file successfully`));
    config.runs.forEach((r) => {
      // if scorers are not set for a run, then override it with the global scorers
      if (!r.scorers && config.scorers) {
        r.scorers = config.scorers;
      }
    });
    return config;
  } catch (err: any) {
    console.log(buildErrorLog(`Failed to read ${fileName} file`));
    console.log(buildWarningLog("Please ensure running init command first"));
    process.exit(1);
  }
}
