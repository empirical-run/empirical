import re
import os
import sqlite3
import json
import uuid


def get_file_name():
    return str(uuid.uuid4())[:6] + ".db"


def load_json(name):
    f = open(name)
    return json.load(f)


def create_and_load_database(db_name, sqlite_file_name):
    if os.path.isfile(sqlite_file_name):
        os.remove(sqlite_file_name)
    con = sqlite3.connect(sqlite_file_name)
    cur = con.cursor()
    schema_script = load_json("/Users/arjun/notebooks/schema.json")[db_name]
    cur.executescript(schema_script)  # First create tables
    create_script = load_json("/Users/arjun/notebooks/create.json")[db_name]
    cur.executescript(create_script)  # Then load data
    con.close()


def remove_backticks(text):
    """If we find backticks, return the code snippet from within them"""
    pruned_text = text.replace("```sql", "```")
    found = re.findall(r"```(.*?)```", pruned_text, re.DOTALL)
    if len(found):
        return found[0]
    else:
        return pruned_text


def evaluate(output, inputs):
    database_name = inputs["database_name"]
    file_name = get_file_name()
    create_and_load_database(database_name, file_name)
    con = sqlite3.connect(file_name)
    cur = con.cursor()
    try:
        res = cur.execute(remove_backticks(output["value"]))
        first_row = res.fetchone()
        if first_row:
            passed = 1
            message = "Result preview: " + ", ".join([str(x) for x in first_row])
        else:
            passed = 0.5
            message = "No results found"
    except Exception as e:
        passed, message = 0, repr(e)
    os.remove(file_name)
    return [{"score": passed, "message": message, "name": "exec-accuracy"}]


if __name__ == "__main__":
    create_and_load_database('concert_singer', 'singer.db')