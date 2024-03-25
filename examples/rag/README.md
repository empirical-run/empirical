# RAG Pipeline Usage Example
This repository demonstrates the usage of `py-script` for running a RAG pipeline. It utilizes [RAGAS](https://docs.ragas.io/en/stable/index.html), [LangChain](https://www.langchain.com/), and [LlamaIndex](https://www.llamaindex.ai/) for question generation and pipeline setup.

The setup is inspired by [RAGAS doc on comparing different LLMs](https://docs.ragas.io/en/stable/concepts/metrics/answer_relevance.html).

## Setup
Ensure Poetry is installed on your machine. If not, install it using the instructions [here](https://python-poetry.org/docs/#installing-with-pipx)

- Install project dependencies:
    ```
    poetry install
    ```

- To evaluate RAG, configure a document loader and generate questions from an arXiv paper:
    ```
    poetry run python prepare.py
    ```

- Generate a dataset of relevant questions, context, and ground truth:
    ```
    poetry run python dataset_generator.py
    ```

By now you should see a dataset file named `dataset.jsonl` inside `.empiricalrun` directory.

## Running the example

1. Get the path for Python virtual env:
    ```
    poetry env info -e
    ```

1. Replace `SET_PYTHON_PATH` placeholder in .empiricalrun.json with the virtual env path.

1. Evaluate RAG pipeline using Empirical:
    ```
    npx @empiricalrun/cli run
    ```
1. Visualize the output:
    ```
    npx @empiricalrun/cli ui
    ```