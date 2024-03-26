# HumanEval

This example shows a `py-script` scorer with OpenAI's [HumanEval](https://github.com/openai/human-eval) benchmark. This example requires Python.

## Run the example

1. Run this script to prepare the dataset in `.empiricalrun/HumanEval.jsonl` 
    ```
    python prepare.py
    ```

1. Run with Empirical
    ```
    npx @empiricalrun/cli run
    ```

You can also manually download dataset

1. Download the dataset from [this link](https://github.com/openai/human-eval/blob/master/data/HumanEval.jsonl.gz)

1. Extract and keep the dataset as `HumanEval.jsonl` 
