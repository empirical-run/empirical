import json
import sys
import importlib


sys.path.append(sys.argv[1])
user_module = importlib.import_module(sys.argv[2])

result = user_module.execute(json.loads(sys.argv[3]))
print("execution_output:", json.dumps(result))
