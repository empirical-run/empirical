const tsj = require("ts-json-schema-generator");
const fs = require("fs");

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: "./packages/cli/src/types/index.ts",
  tsconfig: "./packages/cli/tsconfig.json",
  type: "RunsConfig", // Or <type-name> if you want to generate schema for that one type only
};

// const output_path = "path/to/output/file";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
console.log(schemaString);

// fs.writeFile(output_path, schemaString, (err) => {
//   if (err) throw err;
// });
