# Docs

This is based on [Mintlify's starter kit](https://github.com/mintlify/starter).

## Development

Install dependencies (e.g. [Mintlify CLI](https://www.npmjs.com/package/mintlify)) to run the docs locally. To install, use the following command

```
pnpm docs:install
```

Run the following command to start mintlify local instance
```
pnpm docs:dev
```
> Note: ensure running above commands from root directory of this repository

## Deployment

Changes should be auto-deployed to production automatically after pushing to the `main` branch - through Mintlify's GitHub App (which is installed on this repo).
