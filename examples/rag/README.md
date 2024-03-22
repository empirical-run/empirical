# RAG

This example shows `py-script` runner and evaluator. This example requires Python.

## Setup
In order to initialise the setup, run the following command.

```
poetry install
```

For RAG, we first need to configure a document loader and generate question based on the document.
For document, we chose an arxiv paper which can be downloaded by running the following command

```
poetry run python prepary.py
```

Once the document is downloaded in path `./arxiv-papers` we need to generate a dataset which contains questions based on the document downloaded. 
Run the following command to generate dataset.

```
poetry run python dataset_generator.py
```

This command will generate a dataset inside the folder `.empiricalrun` with the name `dataset.jsonl`. 

## Running the example

1. Run the command to get the path for python virtual env
    ```
    poetry env info
    ```

1. Copy the virtual env path for Python and replace the placeholder `SET_PYTHON_PATH` in the `.empiricalrun.json`

1. Run using Empirical
    ```
    npx @empiricalrun/cli run
    ```
1. Visualise the output
    ```
    npx @empiricalrun/cli ui
    ```