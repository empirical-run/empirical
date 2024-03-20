import { Scorer } from "../../interface/scorer";
import { inputsForReplacements } from "../../utils";
import { PythonShell } from "python-shell";
import path from "path";
import { promises as fs } from "fs";

const pythonWrapper = `
import json
import sys
import importlib


sys.path.append(sys.argv[1])
user_module = importlib.import_module(sys.argv[2])

result = user_module.evaluate(sys.argv[3], json.loads(sys.argv[4]))
print(json.dumps(result))
`;

export const name = "py-script";

const scriptTimeout = 2000;
const wrapperScriptDirectory = path.join(__dirname, "py");
const wrapperScriptFile = "wrapper.py";

async function writeIfWrapperFileIsMissing() {
  const wrapperPath = path.join(wrapperScriptDirectory, wrapperScriptFile);
  try {
    await fs.readFile(wrapperPath);
  } catch (err) {
    // File doesn't exist, so write it
    await fs.mkdir(wrapperScriptDirectory, { recursive: true });
    await fs.writeFile(wrapperPath, pythonWrapper);
  }
}

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

  await writeIfWrapperFileIsMissing();
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
