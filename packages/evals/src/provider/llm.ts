import { Scorer } from "../interface/scorer";
import OpenAI from "openai";

async function askLlmForEvalResult(
  messages: OpenAI.ChatCompletionMessageParam[],
): Promise<{ reason: string; result: "Yes" | "No" }> {
  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
    tools: [
      {
        type: "function",
        function: {
          name: "set_evaluator_response",
          description: "Sets the response of the evaluation",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description:
                  "Reasoning for the evaluation, shared as a step-by-step chain of thought",
              },
              result: { type: "string", enum: ["Yes", "No"] },
            },
            required: ["reason", "result"],
          },
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "set_evaluator_response" },
    },
  });
  const rawResponse = completion.choices[0]!;
  const response = rawResponse.message.tool_calls![0];
  return JSON.parse(response!.function.arguments);
}

export const name = "llm-criteria";

export const checkLlmCriteria: Scorer = async (inputs, output, expected) => {
  const prompt = `Are these two queries equivalent?\n\nQuery 1: ${output}\nQuery 2: ${expected}`;
  const systemPrompt = "You are an expert evaluator";
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const { result, reason } = await askLlmForEvalResult(messages);
  return {
    score: result === "Yes" ? 1 : 0,
    name: name,
    message: reason,
  };
};

// LLM returns - function call
// - reasoning
// - response_choice (between Yes or No)
