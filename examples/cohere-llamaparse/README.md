# cohere-llamaparse

This examples tests a document parsed by [LlamaCloud](https://cloud.llamaindex.ai/login) and Cohere's Command R+ model with document searching.

## Usage

```
poetry install
```

Run the Empirical while defining the env variables `LLAMA_CLOUD_API_KEY` and `CO_API_KEY`.

```
LLAMA_CLOUD_API_KEY=foo CO_API_KEY=bar npx @empiricalrun/cli run --python-path `poetry env info -e`
```
