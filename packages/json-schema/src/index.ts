import { createGenerator, Config } from "ts-json-schema-generator";
import path from "path";
import fs from "fs";
import packageJson from "./../../cli/package.json";

const tsconfigPath = path.join(__dirname, "./../../ai/tsconfig.json");
const typesPath = path.join(__dirname, "./../../ai/src/index.ts");

const config: Config = {
  path: typesPath,
  tsconfig: tsconfigPath,
  type: "RunsConfig",
};
const schema = createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
const outputPath = path.join(__dirname, "./../dist");
fs.mkdirSync(path.join(__dirname, "./../dist"), { recursive: true });
// create a version file
fs.writeFileSync(`${outputPath}/v${packageJson.version}.json`, schemaString);
// create latest version file
fs.writeFileSync(`${outputPath}/latest.json`, schemaString);
