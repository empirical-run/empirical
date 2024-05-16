import json


def evaluate(output, inputs):
    """
    Returns score=1 if the output has the expected tool calls by checking for their
    expected name and parameters. Returns score=0 otherwise.
    """
    expected_output = inputs.get("expected_tool_call", "")
    if expected_output == "":
        return []
    tool_calls = output.get("tool_calls", [])
    tool_calls_present = len(tool_calls) > 0
    try:
        if tool_calls_present:
            if len(expected_output) != len(tool_calls):
                raise AssertionError(
                    f"{len(expected_output)} tool calls expected but got {len(tool_calls)}"
                )
            for i, tool_call in enumerate(tool_calls):
                function = tool_call.get("function", {})
                function_name = function.get("name", "")
                expected_tool_call = expected_output[i]
                if expected_tool_call.get("name") != function_name:
                    raise AssertionError(
                        f"Incorrect tool call. expected: {expected_output.get("name")} but got: {function_name}"
                    )
                function_parameters_str = function.get("arguments", "")
                function_parameters = json.loads(function_parameters_str)
                if function_parameters != expected_tool_call.get("arguments"):
                    raise AssertionError(
                        f"Incorrect arguments passed. expected: {json.dumps(expected_tool_call.get("arguments"))}",
                    )
        else:
            raise RuntimeError("missing tool calls in response")
    except Exception as e:
        return {
            "score": 0,
            "message": str(e),
        }
    return {
        "score": 1,
        "message": "",
    }
