import re
import sqlite3


def remove_backticks(text):
    """If we find backticks, return the code snippet from within them"""
    pruned_text = text.replace("```sql", "```")
    found = re.findall(r"```(.*?)```", pruned_text, re.DOTALL)
    if len(found):
        return found[0]
    else:
        return pruned_text


def evaluate(output, inputs):
    con = sqlite3.connect("concert_singer.db")
    cur = con.cursor()
    try:
        res = cur.execute(remove_backticks(output["value"]))
        first_row = res.fetchone()
        if first_row:
            passed = 1
            message = "Result preview: " + ", ".join([str(x) for x in first_row])
        else:
            passed = 0
            message = "No results found"
    except Exception as e:
        passed, message = 0, repr(e)

    return [{"score": passed, "message": message, "name": "exec-accuracy"}]
