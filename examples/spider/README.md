# Text-to-SQL

LLMs are good at converting natural language questions to SQL queries. This examples uses that
scenario to demo Empirical. This example is based on the [Spider](https://github.com/taoyds/spider) dataset.

In this example, we generate and score them on

1. SQL syntax (with the `sql-syntax` scorer): Checks if the output syntax is valid SQL. For example, if the output is in
   markdown syntax (with backticks), it is not a valid SQL query.
2. Execution accuracy (with the `py-script` scorer): We run the generated SQL query against a test database, and check
   if the query returns a result. This scorer cleans query outputs that have backticks
   ([see code](./execution_accuracy.py)).

This example requires Python.

## Usage

1. Run the prepare script to put together the example database.
  ```sh
  python prepare.py
  ```

1. Review the `empiricalrc.json` configuration, and make changes if any. The current configuration runs models
   from OpenAI, Anthropic and Google, and thus, requires [relevant environment variables](https://docs.empirical.run/models/basic).
  ```sh
  cat empiricalrc.json
  ```

1. Run with Empirical
  ```sh
  npx @empiricalrun/cli run
  ```

1. See results on the Empirical web reporter
  ```sh
  npx @empiricalrun/cli ui
  ```
