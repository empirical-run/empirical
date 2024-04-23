import { expect, test } from "vitest";
import { AzureOpenAIProvider } from "./index";

test("passthrough model parameters are sent in request", async () => {
  const chatCompletion = await AzureOpenAIProvider.chat({
    // TODO: check if this is a viable solution. Can deployment name be a replacement for model ?
    model: "gpt-35-deployment",
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
}, 10000);
