## Tool Calls Example
This example illustrates how to score the behavior of Large Language Models (LLMs) with respect to tool calls. 
The scenario involves querying LLMs with questions related to restaurant reviews, using a predefined set of tools.

### Dataset
The dataset configured is `dataset.json`. 
The dataset is a cherry-pick version of [NexusFlow PlaceAPIBenchmark](https://huggingface.co/datasets/Nexusflow/PlacesAPIBenchmark).

### Configuration
The function calling parameters are set in `empiricalrc.json`.

### Scorer Configuration
The scoring mechanism is implemented through a Python script named `score.py`.

## Steps to run
To execute the example, follow these steps:

Run the following command:
```
npx empiricalrun
```
