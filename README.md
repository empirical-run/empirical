# Empirical

[![npm](https://img.shields.io/npm/v/empiricalrun)](https://npmjs.com/package/empiricalrun)
[![Discord](https://img.shields.io/badge/discord-empirical.run-blue?logo=discord&logoColor=white&color=5d68e8)](https://discord.gg/NeR6jj8dw9)

Empirical is the fastest way to test different LLMs and model configurations, across
all the scenarios that matter for your application.

With Empirical, you can

- Run your test datasets locally against [off-the-shelf](https://docs.empirical.run/models/model) or [custom models](https://docs.empirical.run/models/custom)
- Compare model outputs on a web UI, and [test changes quickly](https://docs.empirical.run/reporter)
- Score your outputs with [scoring functions](https://docs.empirical.run/scoring/basics)
- Run [tests on CI/CD](https://docs.empirical.run/running-in-ci)

https://github.com/empirical-run/empirical/assets/284612/3309283c-ddad-4c4e-8175-08a32460686c

## Usage

[**See all docs →**](https://docs.empirical.run/quickstart)

Empirical bundles together a test runner and a web app. These can be used through
the CLI in your terminal window.

Empirical relies on a configuration file, typically located at `empiricalrc.js`
which describes the test to run.

### Start with a basic example

In this example, we will ask an LLM to extract entities from user messages and
give us a structured JSON output. For example, "I'm Alice from Maryland" will
become `{name: 'Alice', location: 'Maryland'}`.

Our test will succeed if the model outputs valid JSON.

1. Use the CLI to create a sample configuration file called `empiricalrc.js`.

    ```sh
    npm init empiricalrun

    # For TypeScript
    npm init empiricalrun -- --using-ts
    ```

2. Run the example dataset against the selected models.

    ```sh
    npx empiricalrun
    ```

   This step requires the `OPENAI_API_KEY` environment variable to
   authenticate with OpenAI. This execution will cost $0.0026, based
   on the selected models.

3. Use the `ui` command to open the reporter web app and see side-by-side results.

    ```sh
    npx empiricalrun ui
    ```

### Make it yours

Edit the `empiricalrc.js` file to make Empirical work for your use-case.

- Configure which [models to use](https://docs.empirical.run/models/basics)
- Configure [your test dataset](https://docs.empirical.run/dataset/basics)
- Configure [scoring functions](https://docs.empirical.run/scoring/basics) to grade output quality

## Contribution guide

See [development docs](development/README.md).
