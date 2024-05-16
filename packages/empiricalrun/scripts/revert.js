const fs = require("fs");
const { loadKeyFromEnv } = require("./load");

function main() {
  const apiKey = loadKeyFromEnv();
  const fileName = "./src/telemetry/constants.ts";
  const content = fs.readFileSync(fileName, "utf8");
  // Reverses what load.js did
  fs.writeFileSync(
    fileName,
    content.replace(apiKey, "dummy-value-replaced-during-build-time"),
  );
}

main();
