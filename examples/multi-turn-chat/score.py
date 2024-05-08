from typing import TypedDict
from openai import AsyncOpenAI
import json
from enum import Enum


class ScorerResultEnum(Enum):
    YES = "Yes"
    NO = "No"


class ScorerResult(TypedDict):
    result: ScorerResultEnum
    reason: str


async def llm_score(output, criteria) -> ScorerResult:
    system_prompt = "You are an expert evaluator who grades an output string based on a criteria. The output must fulfil the criteria to pass the evaluation."
    openai = AsyncOpenAI()
    completion = await openai.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Criteria: {criteria}\n\nOutput: {output}"},
        ],
        model="gpt-3.5-turbo",
        temperature=0.1,
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "set_evaluator_response",
                    "description": "Sets the response of the evaluation",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reason": {
                                "type": "string",
                                "description": "Reasoning for the evaluation, shared as a step-by-step chain of thought",
                            },
                            "result": {
                                "type": "string",
                                "enum": [
                                    ScorerResultEnum.YES.value,
                                    ScorerResultEnum.NO.value,
                                ],
                            },
                        },
                        "required": ["reason", "result"],
                    },
                },
            },
        ],
        tool_choice={
            "type": "function",
            "function": {"name": "set_evaluator_response"},
        },
    )
    response = completion.choices[0].message.tool_calls[0]
    return ScorerResult(**json.loads(response.function.arguments))


async def evaluate(output, inputs):
    thread: list[object] = output.get("metadata", {}).get("messages", [])
    assistant_responses: list[object] = [
        obj for obj in thread if obj["role"] == "assistant"
    ]
    success = 0
    message = ""
    total = len(inputs)
    for idx, assistant_response in enumerate(assistant_responses):
        score = await llm_score(
            assistant_response.get("content"),
            inputs[idx].get("acceptable_response", ""),
        )
        if score["result"] == ScorerResultEnum.YES.value:
            success = success + 1

        message = (
            f"{message} [{idx}]: {score['reason']}"
            if message != ""
            else f"[{idx}]: {score['reason']}"
        )

    return {
        "score": success / total,
        "message": message,
    }
