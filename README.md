<div align="center">
<img src="https://www.empirical.run/images/og/default_og_image.png" width="500">

# Empirical.run
<!-- section for badges -->
Empirical is the fastest way to try different LLMs and prompt combinations, across all the scenarios that matter.
</div>

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
