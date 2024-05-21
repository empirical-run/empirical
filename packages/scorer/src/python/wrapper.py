import json
import sys
import importlib
import inspect
import asyncio


async def evaluator():
    sys.path.append(sys.argv[1])
    user_module = importlib.import_module(sys.argv[2])
    if hasattr(user_module, "evaluate"):
        if inspect.iscoroutinefunction(user_module.evaluate):
            result = await user_module.evaluate(
                json.loads(sys.argv[3]), json.loads(sys.argv[4])
            )
        else:
            result = user_module.evaluate(
                json.loads(sys.argv[3]), json.loads(sys.argv[4])
            )
    else:
        raise KeyError(
            "Error: failed to find `evaluate` method in the python script provided."
        )
    if result is None:
        raise KeyError("Error: `evaluate` function did not return a result")
    print("scorer_output:", json.dumps(result))


asyncio.run(evaluator())
