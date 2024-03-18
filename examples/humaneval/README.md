# HumanEval

This example runs OpenAI's [HumanEval](https://github.com/openai/human-eval) benchmark on Empirical.

## Usage

1. Download the dataset from [this link](https://github.com/openai/human-eval/blob/master/data/HumanEval.jsonl.gz)

1. Extract and keep the dataset as `HumanEval.jsonl` 

1. Run with Empirical
    ```
    npx @empiricalrun/cli run
    ```

## Development

To run the python eval script locally, run:

```sh
python eval.py "def truncate_number(number):\n    integer_part = int(number)\n    decimal_part = number - integer_part\n    return decimal_part" "\n\nMETADATA = {\n    'author': 'jt',\n    'dataset': 'test'\n}\n\n\ndef check(candidate):\n    assert candidate(3.5) == 0.5\n    assert abs(candidate(1.33) - 0.33) < 1e-6\n    assert abs(candidate(123.456) - 0.456) < 1e-6\n" "truncate_number"
```
