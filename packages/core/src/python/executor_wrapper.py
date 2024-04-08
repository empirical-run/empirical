import json
import sys
import importlib
from datetime import datetime

print("started python execution", datetime.now())
sys.path.append(sys.argv[1])
user_module = importlib.import_module(sys.argv[2])

result = user_module.execute(json.loads(sys.argv[3]), json.loads(sys.argv[4]))
print("got output", datetime.now())
print("execution_output:", json.dumps(result))
