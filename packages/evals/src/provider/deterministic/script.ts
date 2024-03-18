import { Scorer } from "../../interface/scorer";
import { inputsForReplacements, replacePlaceholders } from "../../utils";
import { PythonShell } from "python-shell";

export const name = "script";

export const scoreWithScript: Scorer = async (sample, output, value) => {
  // Value is the path of the script, and has placeholders
  if (!value) {
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
  if (output) {
    // This scorer supports {{output}} as placeholder
    replacements.output = output;
  }

  const allArgs = value.split(" ");
  allArgs.shift(); // python

  const scriptPath = allArgs.shift();
  const args = allArgs.map((arg) => replacePlaceholders(arg, replacements));

  const runOutput = await PythonShell.run(scriptPath!, {
    args,
  });
  const result = runOutput[runOutput.length - 1];
  return JSON.parse(result);
};
