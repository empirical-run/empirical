/* eslint-disable no-unused-vars */
import { ScoringFn } from "../../interface/scorer";
import OpenAI from "openai";
import { EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

export const name = "llm-faithfulness";

const prompt = `Prompt: Natural language inference
Consider the given context and following statements, then determine whether they are supported by the information present in the context.Provide a brief explanation for each statement before arriving at the verdict (Yes/No). Provide a final verdict for each statement in order at the end in the given format. Do not deviate from the specified format.

Context:\nJohn is a student at XYZ University. He is pursuing a degree in Computer Science. He is enrolled in several courses this semester, including Data Structures, Algorithms, and Database Management. John is a diligent student and spends a significant amount of time studying and completing assignments. He often stays late in the library to work on his projects.
statements:\n1. John is majoring in Biology.\n2. John is taking a course on Artificial Intelligence.\n3. John is a dedicated student.\n4. John has a part-time job.\n5. John is interested in computer programming.\n
Answer:
1. John is majoring in Biology.
Explanation: John's major is explicitly mentioned as Computer Science. There is no information suggesting he is majoring in Biology.  Verdict: No.
2. John is taking a course on Artificial Intelligence.
Explanation: The context mentions the courses John is currently enrolled in, and Artificial Intelligence is not mentioned. Therefore, it cannot be deduced that John is taking a course on AI. Verdict: No.
3. John is a dedicated student.
Explanation: The prompt states that he spends a significant amount of time studying and completing assignments. Additionally, it mentions that he often stays late in the library to work on his projects, which implies dedication. Verdict: Yes.
4. John has a part-time job.
Explanation: There is no information given in the context about John having a part-time job. Therefore, it cannot be deduced that John has a part-time job.  Verdict: No.
5. John is interested in computer programming.
Explanation: The context states that John is pursuing a degree in Computer Science, which implies an interest in computer programming. Verdict: Yes.
Final verdict for each statement in order: No. No. Yes. No. Yes.
context:\n{{context}}
{{statements}}
Answer:
`;

export const checkLlmFaithfulness: ScoringFn = async ({
  sample,
  output,
  config,
}) => {
  // let context = "";
  if (config.type !== "llm-faithfulness") {
    return [
      {
        name,
        score: 0,
        message: "invalid scoring function detected",
      },
    ];
  }
  // if (config.criteria) {
  //   let replacements: any = { ...sample.inputs };
  //   if (sample.expected) {
  //     // llm-criteria supports {{expected}} as placeholder
  //     replacements.expected = sample.expected;
  //   }
  //   criteria = replacePlaceholders(config.criteria, replacements);
  // }

  // TODO: placeholders for context and claims
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    // { role: "system", content: systemPrompt },
    {
      role: "user",
      content: replacePlaceholders(prompt, {
        context: config.context,
        statements: config.claims.reduce((agg, claim, index) => {
          return `${agg}\nstatement ${index}: ${claim}`;
        }, ""),
      }),
    },
  ];
  console.log(messages);

  try {
    const response = await askLlmForEvalResult(messages);
    console.log(response);
    return [
      {
        score: 0, // TODO: calculate it as average of all verdicts
        name: config.name || name,
        message: "reason", // TODO: aggregate explanations, maybe ones that are "No"
      },
    ];
  } catch (err) {
    return [
      {
        score: 0,
        name: config.name || name,
        message:
          (err as Error).message ||
          "Failed to call LLM using @empiricalrun/ai package",
      },
    ];
  }
};

async function askLlmForEvalResult(
  messages: OpenAI.ChatCompletionMessageParam[],
): Promise<any> {
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
            // TODO: make properties depend on number of statements
            type: "object",
            properties: {
              explanation_1: {
                type: "string",
                description:
                  "Explanation for the evaluation of statement 1, shared as a step-by-step chain of thought",
              },
              verdict_1: {
                type: "string",
                enum: ["Yes", "No"],
                description: "Verdict for statement 1",
              },
              explanation_2: {
                type: "string",
                description:
                  "Explanation for the evaluation of statement 2, shared as a step-by-step chain of thought",
              },
              verdict_2: {
                type: "string",
                enum: ["Yes", "No"],
                description: "Verdict for statement 2",
              },
            },
            required: [
              "explanation_1",
              "verdict_1",
              "explanation_2",
              "verdict_2",
            ],
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
