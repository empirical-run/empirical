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
  }, 10000);

  test("test JSON mode fro gemini-1.5-pro-latest using passthrough parameter", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.5-pro-latest",
      messages: [
        {
          role: "user",
          content: `List a few popular cookie recipes using this JSON schema: {'type': 'object', 'properties': { 'recipe_name': {'type': 'string'}}}`,
        },
      ],
      response_mime_type: "application/json",
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    expect(
      JSON.parse(chatCompletion.choices[0]?.message.content!),
    ).toBeDefined();
    expect(
      JSON.parse(chatCompletion.choices[0]?.message.content!)[0]["recipe_name"],
    ).toBeDefined();
  }, 10000);

  test("passthrough model parameters works on gemini-1.5-pro", async () => {
    const chatCompletion = await GoogleAIProvider.chat({
      model: "gemini-1.5-pro-latest",
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
  }, 10000);

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
  }, 10000);
});
