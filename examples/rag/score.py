from ragas import evaluate as ragas_evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    answer_correctness,
)
from datasets import Dataset


def evaluate(output, inputs, metadata):
    metrics = [
        faithfulness,
        answer_relevancy,
        answer_correctness,
    ]
    result_dict = {
        "question": [inputs["question"]],
        "ground_truth": [metadata["ground_truth"]],
        "answer": [output],
        "contexts": [metadata["contexts"]],
    }
    result_ds = Dataset.from_dict(result_dict)
    scores = ragas_evaluate(
        result_ds,
        metrics=metrics,
    )
    return [
        {"score": scores["faithfulness"], "message": "", "name": "faithfulness"},
        {
            "score": scores["answer_relevancy"],
            "message": "",
            "name": "answer relevancy",
        },
        {
            "score": scores["answer_correctness"],
            "message": "",
            "name": "answer correctness",
        },
    ]
