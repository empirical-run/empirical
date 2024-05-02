# Empirical

[![npm](https://img.shields.io/npm/v/@empiricalrun/cli)](https://npmjs.com/package/@empiricalrun/cli)
[![Discord](https://img.shields.io/badge/discord-empirical.run-blue?logo=discord&logoColor=white&color=5d68e8)](https://discord.gg/NeR6jj8dw9)

Empirical is the fastest way to test your LLM app and iterate over prompts and other model configuration.

With Empirical, you can:

- Run your test datasets locally against off-the-shelf models
- Test your own custom models and RAG applications (see [how-to](https://docs.empirical.run/models/custom))
- Reports to view, compare, analyze outputs on a web UI
- Score your outputs with [scoring functions](https://docs.empirical.run/scoring/basics)
- Run [tests on CI/CD](https://docs.empirical.run/running-in-ci)

https://github.com/empirical-run/empirical/assets/284612/3309283c-ddad-4c4e-8175-08a32460686c

## Usage

[See quick start on docs →](https://docs.empirical.run/quickstart)

Empirical bundles together a CLI and a web app. The CLI handles running tests and
the web app visualizes results.

Everything runs locally, with a JSON configuration file, `empiricalrc.json`.

> Required: [Node.js](https://nodejs.org/en) 20+ needs to be installed on your system.

### Start with a basic example

In this example, we will ask an LLM to parse user messages to extract entities and
give us a structured JSON output. For example, "I'm Alice from Maryland" will
become `"{name: 'Alice', location: 'Maryland'}"`.

Our test will succeed if the model outputs valid JSON.

1. Use the CLI to create a sample configuration file called `empiricalrc.json`.

    ```sh
    npx @empiricalrun/cli init
    cat empiricalrc.json
    ```

2. Run the test samples against the models with the `run` command. This step requires
   the `OPENAI_API_KEY` environment variable to authenticate with OpenAI. This
   execution will cost $0.0026, based on the selected models.

    ```sh
    npx @empiricalrun/cli run
    ```

3. Use the `ui` command to open the reporter web app and see side-by-side results.

    ```sh
    npx @empiricalrun/cli ui
    ```

### Make it yours

Edit the `empiricalrc.json` file to make Empirical work for your use-case.

- Configure which [models to use](https://docs.empirical.run/models/basics)
- Configure [your test dataset](https://docs.empirical.run/dataset/basics)
- Configure [scoring functions](https://docs.empirical.run/scoring/basics) to grade output quality


## Contribution guide

See [development docs](development/README.md).
