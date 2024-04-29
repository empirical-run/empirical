def evaluate(output, inputs):
    should_have_citation = inputs.get("should have citations") == "yes"

    if should_have_citation:
        citations = output.get("metadata", {}).get("citations")
        return [
            {
                "score": 1 if citations else 0,
                "message": "" if citations else "No citations found",
                "name": "has-citations",
            }
        ]
    else:
        return []
