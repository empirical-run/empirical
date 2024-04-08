import { ScoringFn } from "../../interface/scorer";
import { PythonShell } from "python-shell";
import path from "path";
import { Score } from "@empiricalrun/types";

export const name = "py-script";

const scriptTimeout = 20000;
const wrapperScriptDirectory = path.join(__dirname, "..", "..", "python");
const wrapperScriptFile = "wrapper.py";
const executionOutputIdentifier = "scorer_output:";

export const scoreWithPythonScript: ScoringFn = async ({
  sample,
  output,
  config,
  options,
}): Promise<Score[]> => {
  if (config.type !== "py-script") {
    return [
      {
        score: 0,
        name,
        message: "invalid scorer function detected",
      },
    ];
  }
  if (!config.path) {
    return [
      {
        score: 0,
        name: config.name || name,
        message: "Python script path is not provided for running the scorer",
      },
    ];
  }

  let basePath = path.dirname(config.path);
  let moduleName = path.basename(config.path).replace(".py", "");
  let pythonArgs = [
    basePath,
    moduleName,
    JSON.stringify(output) || "",
    JSON.stringify(sample.inputs),
  ];

  const runOutput = await new Promise<string[]>((resolve) => {
    let runOutput: string[] = [];
    const shell = new PythonShell(wrapperScriptFile, {
      scriptPath: wrapperScriptDirectory,
      pythonPath: options?.pythonPath || undefined,
      args: pythonArgs,
    });

    const pythonKiller = setTimeout(function () {
      runOutput.push(
        JSON.stringify([
          {
            score: 0,
            name: config.name || name,
            message: "Scorer script timed out",
          },
        ]),
      );
      shell.childProcess.kill();
    }, scriptTimeout);

    shell.on("message", function (message) {
      if (message.indexOf(executionOutputIdentifier) === 0) {
        runOutput.push(message.replace(executionOutputIdentifier, ""));
      } else {
        console.log(message);
      }
    });

    shell.on("pythonError", function (message) {
      console.error(message);
      runOutput.push(
        JSON.stringify([
          {
            score: 0,
            name: config.name || name,
            message: `Scorer script error: ${message}`,
          },
        ]),
      );
    });

    shell.end(function () {
      clearTimeout(pythonKiller);
      resolve(runOutput);
    });
  });

  const result = runOutput[runOutput.length - 1];
  return JSON.parse(result!);
};
