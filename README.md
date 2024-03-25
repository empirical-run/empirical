# empirical.run

[![npm](https://img.shields.io/npm/v/@empiricalrun/cli)](https://npmjs.com/package/@empiricalrun/cli)
[![Discord](https://dcbadge.vercel.app/api/server/NeR6jj8dw9?style=flat&compact=true)](https://discord.gg/NeR6jj8dw9)

Empirical is the fastest way to test different LLMs, prompts and other model configurations, across all the scenarios
that matter for your application.

With Empirical, you can:

- Run your test datasets locally against off-the-shelf models
- Test your own custom models and RAG applications (see [how-to](https://docs.empirical.run/models/custom))
- Reports to view, compare, analyze run results with the UI
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


## Contribution guide

Follow these steps to set up this monorepo for development.

### Setup

Setup package manager
```sh
corepack install
```

To install and build apps and packages, run the following command:
```sh
pnpm install
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```sh
pnpm dev
```
To start web app, follow steps below:

```sh
# link cli 
pnpm link ./packages/cli
# pick an example
cd ./examples/basic
# run against an example
npx @empiricalrun/cli run
# view the output on a webapp
npx @empiricalrun/cli ui
```

After following the above steps, the web app will be running on http://localhost:8000

#### Adding new package
To add new package run following command:

```sh
pnpm run gen:workspace
```

### Test

To run tests (add `:watch` for watch mode)

```sh
pnpm test
pnpm test:watch
```

To run some tests (e.g. from `script.test.ts`), use the `-t` flag

```sh
pnpm test:watch -- -t script
```
