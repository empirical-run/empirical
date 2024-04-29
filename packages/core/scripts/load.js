const fs = require("fs");
const dotenv = require("dotenv");

function loadKeyFromEnv() {
  if (process.env.POSTHOG_API_KEY) {
    return process.env.POSTHOG_API_KEY;
  }
  let processEnv = {};
  // cwd is core package root
  const envFilePath = ["../../.env.local"];
  dotenv.config({ path: envFilePath, processEnv: processEnv });
  return processEnv.POSTHOG_API_KEY;
}

function main() {
  const apiKey = loadKeyFromEnv();
  const fileName = "./src/telemetry/constants.ts";
  const content = fs.readFileSync(fileName, "utf8");
  fs.writeFileSync(fileName,
    content.replace("dummy-value-replaced-during-build-time", apiKey));
}

main();

module.exports = {
  loadKeyFromEnv
};
