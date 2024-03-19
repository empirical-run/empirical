

def evaluate(output, inputs):
    # Concat the output and tests (from inputs)
    code = output + "\n\n" + inputs["test"]
    # Concat code to run the tests
    code += f"\ncheck({inputs['entry_point']})"
    passed, reason = 0, ""
    try:
        exec(code)
        passed = 1
    except Exception as e:
        reason = str(e)
        passed = 0
    return {"score": passed, "message": reason, "name": "unit-tests"}
