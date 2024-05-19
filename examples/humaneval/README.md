# HumanEval

This example runs OpenAI's [HumanEval](https://github.com/openai/human-eval) benchmark with Empirical. Since
the benchmark generates Python code, we score the outputs using a custom `py-script` [scorer function](https://docs.empirical.run/scoring/python).

This example requires Python.

## Run this example

1. Run this script to prepare the dataset in `HumanEval.jsonl`. Alternatively, you can also [download the dataset](https://github.com/openai/human-eval/blob/master/data/HumanEval.jsonl.gz) manually.
    ```
    python prepare.py
    ```

2. Review the `empiricalrc.json` file, where we define which models to run the dataset against. You can configure [any supported model](https://docs.empirical.run/models/basics).

3. Ensure that you have the API key set for the selected model (e.g., for OpenAI models, define the `OPENAI_API_KEY` variable in your environment or in a `.env` file).

4. Run the dataset with Empirical.
    ```
    npx empiricalrun
    ```

5. See results with the Empirical UI.
    ```
    npx empiricalrun ui
    ```
