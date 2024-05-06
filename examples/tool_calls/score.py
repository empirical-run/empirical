import json


def evaluate(output, inputs):
    expected_output = inputs.get("expected_tool_call", "")
    if expected_output == "":
        return []
    tool_calls = output.get("tool_calls", [])
    tool_calls_present = len(tool_calls) > 0
    try:
        if tool_calls_present:
            function = tool_calls[0].get("function", {})
            function_name = function.get("name", "")
            if expected_output.get("name") != function_name:
                raise AssertionError(
                    f"Incorrect tool call. expected: {expected_output.get("name")}"
                )
            function_parameters_str = function.get("arguments", "")
            function_parameters = {}
            function_parameters = json.loads(function_parameters_str)
            if function_parameters != expected_output.get("arguments"):
                raise AssertionError(
                    f"Incorrect arguments passed. expected: {json.dumps(expected_output.get("arguments"))}",
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
