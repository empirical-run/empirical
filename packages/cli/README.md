# empirical.run CLI

[![npm](https://img.shields.io/npm/v/@empiricalrun/cli)](https://npmjs.com/package/@empiricalrun/cli)
[![Discord](https://dcbadge.vercel.app/api/server/NeR6jj8dw9?style=flat&compact=true)](https://discord.gg/NeR6jj8dw9)

Empirical is the fastest way to test different LLMs, prompts and other model configurations, across all the scenarios
that matter for your application.

With Empirical, you can:

- Run your test datasets locally against off-the-shelf models
- Test your own custom models and RAG applications (see [how-to](https://docs.empirical.run/models/custom))
- Reports to view, compare, analyze outputs on a web UI
- Score your outputs with [scoring functions](https://docs.empirical.run/scoring/basics)
- Run tests on CI/CD (coming soon!)

[Watch demo video](https://www.loom.com/share/5992fdf0edc443e282f44936e6c32672) | [See all docs](https://docs.empirical.run)


## Usage

Empirical bundles together a CLI and a web app. The CLI handles running tests and
the web app visualizes results.

Everything runs locally, with a JSON configuration file, `empiricalrc.json`.

> Required: [Node.js](https://nodejs.org/en) 20+ needs to be installed on your system.

### Start with a basic example

This example converts incoming unstructured user messages into structured JSON objects
using an LLM.

1. Use the CLI to create a sample configuration file called `empiricalrc.json`.

    ```sh
    npx @empiricalrun/cli init
    ```

2. Run the test samples against the models with the `run` command.

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

