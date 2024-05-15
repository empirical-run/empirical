import { describe, expect, test } from "vitest";
import { GoogleAIProvider } from "./index";

describe.concurrent("test google ai provider", () => {
  test("passthrough model parameters are sent in request", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.0-pro",
      messages: [
        {
          role: "user",
          content: "What is the largest continent in the world?",
        },
      ],
      temperature: 0.1,
      stopSequences: ["Asia"],
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    expect(chatCompletion.choices[0]?.message.content).not.toContain("Asia");
  }, 20000);

  test("test JSON mode for gemini-1.5-pro-latest using passthrough parameter", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.5-pro-latest",
      messages: [
        {
          role: "user",
          content: `List a few popular cookie recipes using this JSON schema: {'type': 'array', 'items': { 'type': 'object', 'properties': { 'recipe_name': { 'type': 'string' }}}}`,
        },
      ],
      response_mime_type: "application/json",
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    const contents = chatCompletion.choices[0]?.message.content!;
    expect(JSON.parse(contents)).toBeDefined();
    expect(JSON.parse(contents)[0]["recipe_name"]).toBeDefined();
  }, 120000);

  test("passthrough model parameters works", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.0-pro",
      messages: [
        {
          role: "user",
          content: "What is the largest continent in the world?",
        },
      ],
      temperature: 0.1,
      stopSequences: ["Asia"],
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    expect(chatCompletion.choices[0]?.message.content).not.toContain("Asia");
  }, 20000);

  test("availability of total tokens in response", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.0-pro",
      messages: [
        {
          role: "user",
          content: "What is the largest continent in the world?",
        },
      ],
      temperature: 0.1,
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    expect(chatCompletion.choices[0]?.message.content).toContain("Asia");
    expect(chatCompletion.usage?.total_tokens).toBeGreaterThan(0);
  }, 20000);

  test("handle tool call", async () => {
    const resp = await GoogleAIProvider.chat({
      model: "gemini-1.0-pro",
      messages: [
        {
          role: "user",
          content:
            "Extract data from message: Hi my name is John Doe. I'm 26 years old and I work in real estate.",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_data",
            description: "extract name from message",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "the name of the person, e.g. Alexa",
                },
              },
              required: ["name"],
            },
          },
        },
      ],
    });
    expect(resp.choices[0]?.message.tool_calls?.[0]?.function.name).toBe(
      "extract_data",
    );
  }, 20000);
});
