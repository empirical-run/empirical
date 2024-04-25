import json


def evaluate(output, inputs):
    metadata = output.get("metadata")
    citations = metadata.get("citations") if metadata else None
    should_have_citation = inputs.get("should have citations") == "yes"
    if should_have_citation:
        return [
            {
                "score": 1 if citations else 0,
                "message": json.dumps(citations[0]) if citations else "No citations found",
                "name": "has-citations",
            }
        ]
    else:
        return []
