import { ScoringFn } from "../../interface/scorer";
import OpenAI from "openai";
import { EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

async function askLlmForEvalResult(
  messages: OpenAI.ChatCompletionMessageParam[],
): Promise<{ reason: string; result: "Yes" | "No" }> {
  const ai = new EmpiricalAI("openai");
  const completion = await ai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
    temperature: 0.1,
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

const systemPrompt = `You are an expert evaluator who grades an output string based on a criteria. The output must fulfil the criteria to pass the evaluation.`;

export const checkLlmCriteria: ScoringFn = async ({
  sample,
  output,
  config,
}) => {
  let criteria = "";
  if (config.type !== "llm-criteria") {
    return [
      {
        name,
        score: 0,
        message: "invalid scoring function detected",
      },
    ];
  }
  const scorerName = config.name || name;
  if (!output.value) {
    return [
      {
        name: scorerName,
        score: 0,
        message: "no output value to score",
      },
    ];
  }
  if (config.criteria) {
    let replacements: any = { ...sample.inputs };
    if (sample.expected) {
      // llm-criteria supports {{expected}} as placeholder
      replacements.expected = sample.expected;
    }
    criteria = replacePlaceholders(config.criteria, replacements);
  }
  if (!criteria) {
    return [
      {
        name: scorerName,
        score: 0,
        message: "criteria is not specified for the scorer",
      },
    ];
  }
  const prompt = `Criteria: ${criteria}\n\nOutput: ${output.value}`;
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  try {
    const { result, reason } = await askLlmForEvalResult(messages);
    return [
      {
        score: result === "Yes" ? 1 : 0,
        name: scorerName,
        message: reason,
      },
    ];
  } catch (err) {
    return [
      {
        score: 0,
        name: scorerName,
        message:
          (err as Error).message ||
          "Failed to call LLM using @empiricalrun/ai package",
      },
    ];
  }
};
