import { Config, loadDataset, JSScriptScorer } from "empiricalrun";
import { executeQuery, getConnection, getSchema } from "./src/db";

async function datasetLoader() {
  let dataset = await loadDataset({
    path: "https://docs.google.com/spreadsheets/d/1x_p0lX2pJEyGkFoe1A9nY3q87qOJUd547f2lz99ugiM/edit#gid=1000015421"
  })
  dataset.samples = dataset.samples.map(sample => {
    // get DB schema for the mentioned database name
    sample.inputs.schema = getSchema(sample.inputs.database_name)
    return sample;
  })
  return dataset
}

async function execAccuracy ({ output, inputs }) {
  let score = 0;
  let message: string;
  try {
    const dbName = inputs.database_name;
    const con = await getConnection(dbName);
    const res = await executeQuery(con, output.value!);
    const [firstRow] = res;
    score = firstRow ? 1 : 0.5;
    message = firstRow ? "Result preview: " + firstRow.join(", "): "No results found"
  } catch (e) {
    score = 0;
    message = String(e);
  }
  return {
    score,
    message
  };
}

const config: Config = {
  runs: [
    {
      provider: "openai",
      type: "model",
      model: "gpt-3.5-turbo",
      prompt:
        "You are an SQLite expert who can convert natural language questions to SQL queries for the database schema given below.\n\nDatabase schema:\n{{schema}}\n\nAnswer the following question with only the SQL query.\n\nQuestion: {{question}}",
    },
    {
      type: "model",
      provider: "fireworks",
      model: "llama-v3-8b-instruct",
      prompt:
        "You are an SQLite expert who can convert natural language questions to SQL queries for the database schema given below.\n\nDatabase schema:\n{{schema}}\n\nAnswer the following question with only the SQL query.\n\nQuestion: {{question}}",
    }
  ],
  dataset: datasetLoader,
  scorers: [
    {
      type: "sql-syntax",
    },
    execAccuracy
  ]
};

export default config;
