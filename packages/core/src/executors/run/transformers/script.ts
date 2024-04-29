import { PythonShell } from "python-shell";
import path from "path";
import { Transformer } from "./interface";
import { BatchTaskManager } from "@empiricalrun/ai";
import os from "os";
import { RunConfig } from "@empiricalrun/types";

//TODO: make this configurable
const scriptTimeout = 20000;
const wrapperScriptDirectory = path.join(__dirname, "..", "..", "..", "python");
const wrapperScriptFile = "executor_wrapper.py";
const executionOutputIdentifier = "execution_output:";

export const getScriptExecutor = (runConfig: RunConfig): Transformer => {
  const maxThreads = os.cpus().length;
  const batchCount = runConfig.parameters?.concurrency
    ? Math.min(runConfig.parameters?.concurrency, maxThreads)
    : maxThreads;

  console.log(`Executing script with ${batchCount} threads.`);
  const batch = new BatchTaskManager(batchCount, 100);

  return async (runConfig, sample, runtimeOptions) => {
    let output = { value: "" };
    if (runConfig.type !== "py-script") {
      return {
        output,
        error: {
          code: "EX_102",
          message: "Incorrect selection of run execution.",
        },
      };
    }

    const scriptPath = runConfig.path;
    if (!scriptPath) {
      return {
        output,
        error: {
          code: "EX_103",
          message: "Script path not provided for script executor",
        },
      };
    }

    let basePath = path.dirname(scriptPath);
    let moduleName = path.basename(scriptPath).replace(".py", "");
    let pythonArgs = [
      basePath,
      moduleName,
      JSON.stringify(sample.inputs),
      JSON.stringify(runConfig.parameters || {}),
    ];
    const { executionDone } = await batch.waitForTurn();
    let startTime = Date.now();

    try {
      const runOutput = await new Promise<string[]>((resolve, reject) => {
        let output: string[] = [];
        const shell = new PythonShell(wrapperScriptFile, {
          pythonPath: runtimeOptions?.pythonPath || undefined,
          scriptPath: wrapperScriptDirectory,
          args: pythonArgs,
        });

        const pythonKiller = setTimeout(() => {
          shell.childProcess.kill();
          const message = `Python script execution timed out after ${scriptTimeout} milliseconds.`;
          reject(message);
        }, scriptTimeout);

        shell.childProcess.on("spawn", () => {
          startTime = Date.now();
        });

        shell.on("message", (message: string) => {
          if (message.indexOf(executionOutputIdentifier) === 0) {
            output.push(message.replace(executionOutputIdentifier, ""));
          } else {
            console.log(message);
          }
        });

        shell.on("pythonError", (message) => {
          reject(message.traceback);
        });

        shell.end(() => {
          clearTimeout(pythonKiller);
          resolve(output);
        });
      });
      const result = JSON.parse(runOutput[0]!);
      executionDone();
      return {
        output: {
          value: result["value"],
          metadata: result["metadata"] || undefined,
          tokens_used: result["tokens_used"] || undefined,
          finish_reason: result["finish_reason"] || undefined,
          latency: result["latency"] || Date.now() - startTime,
        },
      };
    } catch (e) {
      executionDone();
      console.error(e);
      return {
        output: {
          value: "",
        },
        error: {
          // TODO: better error code
          code: "EX_104",
          message: `Error executing Python script: ${e}`,
        },
      };
    }
  };
};
