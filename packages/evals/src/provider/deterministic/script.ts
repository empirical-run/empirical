import { Scorer } from "../../interface/scorer";
import { inputsForReplacements } from "../../utils";
import { PythonShell } from "python-shell";
import path from "path";

export const name = "py-script";

const scriptTimeout = 2000;
const wrapperScriptDirectory = path.join(__dirname, "..", "..", "python");
const wrapperScriptFile = "wrapper.py";

export const scoreWithPythonScript: Scorer = async (
  sample,
  output,
  userScriptPath,
) => {
  if (!userScriptPath) {
    return {
      score: 0,
      name,
      message: "Script path is empty",
    };
  }

  let inputsAsMap: any = inputsForReplacements(sample.inputs);
  let basePath = path.dirname(userScriptPath);
  let moduleName = path.basename(userScriptPath).replace(".py", "");
  let pythonArgs = [
    basePath,
    moduleName,
    output || "",
    JSON.stringify(inputsAsMap),
  ];

  const wrapper: Promise<string[]> = new Promise((resolve) => {
    let runOutput: string[] = [];
    const shell = new PythonShell(wrapperScriptFile, {
      scriptPath: wrapperScriptDirectory,
      args: pythonArgs,
    });

    const pythonKiller = setTimeout(function () {
      runOutput.push(
        JSON.stringify({ score: 0, name, message: "Eval script timed out" }),
      );
      shell.childProcess.kill();
    }, scriptTimeout);

    shell.on("message", function (message) {
      runOutput.push(message);
    });

    shell.on("pythonError", function (message) {
      runOutput.push(
        JSON.stringify({
          score: 0,
          name,
          message: `Eval script error: ${message}`,
        }),
      );
    });

    shell.end(function () {
      clearTimeout(pythonKiller);
      resolve(runOutput);
    });
  });

  const runOutput = await wrapper;
  const result = runOutput[runOutput.length - 1];
  return JSON.parse(result!);
};
