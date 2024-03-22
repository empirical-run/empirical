import { PythonShell } from "python-shell";
import path from "path";
import { Executor } from "./interface";

//TODO: make this configurable
const scriptTimeout = 20000;
const wrapperScriptDirectory = path.join(__dirname, "..", "..", "python");
const wrapperScriptFile = "executor_wrapper.py";
const executionOutputIdentifier = "execution_output:";

export const scriptExecutor: Executor = async (runConfig, sample) => {
  let output = "";
  if (runConfig.type !== "py-script") {
    return {
      output: "",
      error: {
        code: "EX_102",
        message: "Incorrect selection of run execution.",
      },
    };
  }
  const scriptPath = runConfig.value;
  if (!scriptPath) {
    return {
      output,
      error: {
        code: "EX_103",
        message: "Script path not provided for script executor",
      },
    };
  }
  const inputsMap = sample.inputs.reduce((map, i) => {
    map.set(i.name, i.value);
    return map;
  }, new Map<string, string>());
  let basePath = path.dirname(scriptPath);
  let moduleName = path.basename(scriptPath).replace(".py", "");
  let pythonArgs = [
    basePath,
    moduleName,
    JSON.stringify(Object.fromEntries(inputsMap)),
  ];

  const runOutput = await new Promise<string[]>((resolve) => {
    let output: string[] = [];
    const shell = new PythonShell(wrapperScriptFile, {
      pythonPath: runConfig.pythonPath || undefined,
      scriptPath: wrapperScriptDirectory,
      args: pythonArgs,
    });

    const pythonKiller = setTimeout(function () {
      // TODO: handle the error better
      console.log("script timed out");
      shell.childProcess.kill();
    }, scriptTimeout);

    shell.on("message", function (message: string) {
      if (message.indexOf(executionOutputIdentifier) === 0) {
        output.push(message.replace(executionOutputIdentifier, ""));
      } else {
        console.log(message);
      }
    });

    shell.on("pythonError", function (message) {
      // TODO: handle the error better
      console.error(message);
    });

    shell.end(function () {
      clearTimeout(pythonKiller);
      resolve(output);
    });
  });
  const result = JSON.parse(runOutput[0]!);

  return {
    output: result["output"],
    metadata: result["metadata"],
  };
};
