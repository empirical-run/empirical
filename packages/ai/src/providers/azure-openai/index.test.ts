import { expect, test, describe, vi } from "vitest";
import { AzureOpenAIProvider } from "./index";
import { AIError } from "../../error";

describe.concurrent("Azure OpenAI provider tests", () => {
  test("end to end test azure openai call", async () => {
    const chatCompletion = await AzureOpenAIProvider.chat({
      model: "gpt-35-deployment",
      messages: [
        {
          role: "user",
          content: "What is the largest continent in the world?",
        },
      ],
    });
    expect(chatCompletion.choices.length).toBeGreaterThan(0);
    expect(chatCompletion.choices[0]?.message.content).toContain("Asia");
  }, 10000);

  test("handle unavailable model", async () => {
    try {
      await AzureOpenAIProvider.chat({
        model: "gpt-35", // unavailable model deployment name
        messages: [
          {
            role: "user",
            content: "What is the largest continent in the world?",
          },
        ],
      });
      // the above promise should fail
      expect("shouldnt reach this line").toBeFalsy();
    } catch (e) {
      expect(e).toBeInstanceOf(AIError);
      expect((e as AIError).message).toBe(
        "Failed to fetch output from model gpt-35: api response status: 404",
      );
    }
  }, 10000);

  test("handle fetch errors", async () => {
    const originalFetch = global.fetch;
    const errorStr = "Failed to fetch";
    global.fetch = vi.fn().mockRejectedValue("Failed to fetch");
    try {
      await AzureOpenAIProvider.chat({
        model: "gpt-35", // unavailable model deployment name
        messages: [
          {
            role: "user",
            content: "What is the largest continent in the world?",
          },
        ],
      });
    } catch (e) {
      expect(e).toBeInstanceOf(AIError);
      expect((e as AIError).message).toBe(
        `Failed to fetch output from model gpt-35: ${errorStr}`,
      );
    }
    global.fetch = originalFetch;
  }, 10000);
});
