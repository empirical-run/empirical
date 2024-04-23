import { expect, test, describe } from "vitest";
import { AzureOpenAIProvider } from "./index";

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
});
