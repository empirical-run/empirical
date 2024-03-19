import { Scorer } from "../../interface/scorer";
import { inputsForReplacements } from "../../utils";
import { PythonShell } from "python-shell";
import path from "path";

export const name = "py-script";

const pythonWrapper = (basePath: string, moduleName: string) => {
  // This method locates the evaluate method from the python script file
  // and calls it with the args: evaluate(output, inputs)
  return `
import json
import sys

sys.path.append('${basePath}')
from ${moduleName} import evaluate

result = evaluate(sys.argv[1], json.loads(sys.argv[2]))
print(json.dumps(result))
`;
};

export const scoreWithPythonScript: Scorer = async (
  sample,
  output,
  scriptPath,
) => {
  if (!scriptPath) {
    return {
      score: 0,
      name,
      message: "Script path is empty",
    };
  }
  let replacements: any = inputsForReplacements(sample.inputs);
  if (sample.expected) {
    // This scorer supports {{expected}} as placeholder
    replacements.expected = sample.expected;
  }
  let basePath = path.dirname(scriptPath);
  let moduleName = path.basename(scriptPath).replace(".py", "");

  const runOutput = await PythonShell.runString(
    pythonWrapper(basePath, moduleName),
    {
      args: [output, JSON.stringify(replacements)],
    },
  );

  // runOutput has stdout from execution of the Python script
  const result = runOutput[runOutput.length - 1];
  return JSON.parse(result);
};
