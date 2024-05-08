# Evaluating multi-turn chat
This example illustrates how to score outputs for multi-turn chat scenarios.

### Dataset
The dataset configured is configured in a [Google Sheet](https://docs.google.com/spreadsheets/d/1fZ_3FFj94SiucglQOTrCHQTZVhrWJwWqfSk-vEIp8_I/edit#gid=0). 

### Run Configuration
The run is implemented using python script. The run configuration mentions `chat.py` as part of configuration.
Essentially `chat.py` implements multi-turn conversation.

### Scorer Configuration
The scoring mechanism is implemented through a Python script named `score.py`.

## Steps to run
To execute the example:
1. Install dependencies:
    ```
    poetry install
    ```

1. Evaluate multi-turn chat using Empirical:
    ```
    npx @empiricalrun/cli run --python-path `poetry env info -e`
    ```
    >Note: Ensure `OPENAI_API_KEY` is exported before running above command.
1. Visualize the output:
    ```
    npx @empiricalrun/cli ui
    ```