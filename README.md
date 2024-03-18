<div align="center">
<img src="https://www.empirical.run/images/og/default_og_image.png" width="500">

# Empirical.run
<!-- section for badges -->
Empirical is the fastest way to try different LLMs and prompt combinations, across all the scenarios that matter.
</div>

### Setup

To build all apps and packages, run the following command:

```
pnpm install
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```
To start web app, follow steps below:
```
cd packages/cli
npm i -g .
npx @empiricalrun/cli init
npx @empiricalrun/cli run
npx @empiricalrun/cli ui
```
After following the above steps, the web app will be running on http://localhost:8000

#### Adding new package
To add new package run following command:

```
pnpm run gen:workspace
```

### Test

To run tests (add `:watch` for watch mode)

```
pnpm test
pnpm test:watch
```
