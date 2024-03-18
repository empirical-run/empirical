import sys
import json


def evaluate(output, test, func_name):
    # Concat the output and tests (from input)
    code = output + "\n\n" + test
    # Concat code to run the tests
    code += f"\ncheck({func_name})"
    passed = 0
    reason = ""
    try:
        exec(code)
        passed = 1
    except Exception as e:
        reason = str(e)
        passed = 0
    return json.dumps({"score": passed, "message": reason, "name": "unit-tests"})


if __name__ == "__main__":
    print(
        evaluate(
            sys.argv[1],
            sys.argv[2],
            sys.argv[3],
        )
    )
