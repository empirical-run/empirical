import { Scorer } from "../../interface/scorer";
import { inputsForReplacements, replacePlaceholders } from "../../utils";
import { exec as rawExec } from "child_process";
import util from "util";
const exec = util.promisify(rawExec);

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
  const scriptPath = replacePlaceholders(value as string, replacements);

  try {
    const { stdout, stderr } = await exec(scriptPath, { timeout: 5000 });
    if (stderr) {
      console.log("stderr from script scorer:", stderr);
    }
    return JSON.parse(stdout);
  } catch (err) {
    // might have timed out
    console.log("err:", err);
    return {
      score: 0,
      name: "unit-tests", // TODO: script is not a great name to show on the ui, so we change it from inside the python script
      message: "Script timed out",
    };
  }
};
