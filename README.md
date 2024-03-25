# empirical.run

[![npm](https://img.shields.io/npm/v/@empiricalrun/cli)](https://npmjs.com/package/@empiricalrun/cli)
[![Discord](https://dcbadge.vercel.app/api/server/NeR6jj8dw9?style=flat&compact=true)](https://discord.gg/NeR6jj8dw9)

Empirical is the fastest way to test different LLMs, prompts and other configurations, across all the scenarios that matter.

With Empirical, you can:

- Run your test datasets locally against off-the-shelf models
- Test your own models and RAG applications (see [how to](todo))
- Reports to view, compare, analyze run results with the UI
- Score your outputs with [scoring functions](todo)
- Run tests on CI/CD (coming soon!)

[Watch a 2 mins demo video](https://www.loom.com/share/5992fdf0edc443e282f44936e6c32672) | [See docs](https://docs.empirical.run)


## Usage

1. Create a sample configuration file called `empiricalrc.json`. See [config file API reference](todo).

    ```sh
    npx @empiricalrun/cli init
    ```

1. Make a run

    ```sh
    npx @empiricalrun/cli run
    ```

1. Open the UI 

    ```sh
    npx @empiricalrun/cli ui
    ```

## Examples

- Retrieval augmented generation (RAG): see this for custom run provider
- Text-to-SQL
- Code generation
- Chatbot: see this for llm-criteria scorer

## Contribute

Follow these steps to set up the repository for development and contribution.

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
