import { Scorer } from "../../interface/scorer";
import { inputsForReplacements } from "../../utils";
import { PythonShell } from "python-shell";
import path from "path";
import { Score } from "@empiricalrun/types";

export const name = "py-script";

const scriptTimeout = 10000;
const wrapperScriptDirectory = path.join(__dirname, "..", "..", "python");
const wrapperScriptFile = "wrapper.py";
const executionOutputIdentifier = "scorer_output:";

export const scoreWithPythonScript: Scorer = async ({
  sample,
  output,
  value: userScriptPath,
  options,
}): Promise<Score[]> => {
  if (!userScriptPath) {
    return [
      {
        score: 0,
        name,
        message: "Python script path is not provided for running the scorer",
      },
    ];
  }

  let inputsAsMap: any = inputsForReplacements(sample.inputs);
  let basePath = path.dirname(userScriptPath);
  let moduleName = path.basename(userScriptPath).replace(".py", "");
  let pythonArgs = [
    basePath,
    moduleName,
    JSON.stringify(output) || "",
    JSON.stringify(inputsAsMap),
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
          { score: 0, name, message: "Scorer script timed out" },
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
            name,
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
