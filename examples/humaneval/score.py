import re


def remove_backticks(text):
    """If we find backticks, return the code snippet from within them"""
    pruned_text = text.replace("```python", "```")
    found = re.findall(r"```(.*?)```", pruned_text, re.DOTALL)
    if len(found):
        return found[0]
    else:
        return pruned_text


def evaluate(output, inputs):
    """Concatenate the output and tests (from inputs) and run them"""
    code = remove_backticks(output["value"]) + "\n\n" + inputs["test"]
    code += f"\ncheck({inputs['entry_point']})"
    
    try:
        exec(code, globals())
        passed, reason = 1, "Tests passed"
    except Exception as e:
        passed, reason = 0, repr(e)
    
    return {"score": passed, "message": reason}
