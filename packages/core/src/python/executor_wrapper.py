import json
import sys
import importlib
import inspect
import asyncio

sys.path.append(sys.argv[1])
user_module = importlib.import_module(sys.argv[2])


async def executor():
    result = None

    if hasattr(user_module, "execute"):
        try:
            if inspect.iscoroutinefunction(user_module.execute):
                result = await user_module.execute(
                    json.loads(sys.argv[3]), json.loads(sys.argv[4])
                )
            else:
                result = user_module.execute(
                    json.loads(sys.argv[3]), json.loads(sys.argv[4])
                )
        except Exception as e:
            print(e)
            raise RuntimeError(e)
    else:
        raise KeyError(
            "Error: failed to find `execute` method in the python script provided."
        )
    if result is None:
        raise KeyError("Error: execute function did not return a result")

    print("execution_output:", json.dumps(result))


asyncio.run(executor())
