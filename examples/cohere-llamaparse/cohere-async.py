import httpx
import os


async def execute(inputs, parameters):
    client = httpx.AsyncClient()
    response = await client.get(
      'https://api.cloud.llamaindex.ai/api/parsing/job/4763f2d1-5fe5-434e-abb7-b18b3e8d2577/result/markdown',
      headers={
        'accept': 'application/json',
        'Authorization': f'Bearer {os.environ.get("LLAMA_CLOUD_API_KEY", "")}'
      }
    )
    parsed_response = response.json()
    doc_content = parsed_response['markdown']
    response = await client.post(
        'https://api.cohere.ai/v1/chat',
        timeout=30.0, # default 10 is not working
        headers={
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {os.environ.get("CO_API_KEY", "")}'
        },
        json={
            "preamble": "You are a helpful assistant for a gaming payments company that connects merchants (gaming apps) with their users. Users pay on the gaming apps, and this company processes their payments\n\nUsers need help regarding their transactions and have questions that they will ask you. You need to represent this company and their merchant, and talk to the user in a helpful and polite tone.\n\nUse the documents that you have to find answers, instead of jumping to answer the question yourself.",
            "message": inputs["question"],
            "documents": [{"title": "Client Operations.pdf", "text": doc_content}],
        }
    )
    result = response.json()
    await client.aclose()
    return {
        "value": result["text"]
    }
