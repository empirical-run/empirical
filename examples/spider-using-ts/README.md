# Scoring Text-to-SQL outputs using Typescript

LLMs are good at converting natural language questions to SQL queries. This examples uses that
scenario to demo Empirical. 
This example is based on the [Spider](https://github.com/taoyds/spider) dataset and uses typescript config to score the outputs.

In this example, we generate SQL queries, and score them on

1. SQL syntax (with the `sql-syntax` scorer): Checks if the output syntax is valid SQL. For example, if the output is in
   markdown syntax (with backticks), it is not a valid SQL query.
2. Execution accuracy: We run the generated SQL query against a test database, and check
   if the query returns a result. This scorer cleans query outputs that have backticks
   ([see code](./empiricalrc.ts)).

This example requires Typescript.

## Usage

1. Review the `empiricalrc.ts` configuration, and make changes if any. The current configuration runs models
   from OpenAI, and Llama and thus, requires [relevant environment variables](https://docs.empirical.run/models/basic).
  ```sh
  cat empiricalrc.ts
  ```

1. Run with Empirical
  ```sh
  npx empiricalrun
  ```

1. See results on the Empirical web reporter
  ```sh
  npx empiricalrun ui
  ```