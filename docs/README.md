# Docs

This is based on [Mintlify's starter kit](https://github.com/mintlify/starter).

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of your documentation (where mint.json is)

```
mintlify dev
```

## Deployment

Changes should be auto-deployed to production automatically after pushing to the main branch - through Mintlify's GitHub App (which is installed on this repo).

## Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `mint.json`
