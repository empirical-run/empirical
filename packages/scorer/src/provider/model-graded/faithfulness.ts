import { ScoringFn } from "../../interface/scorer";
import OpenAI from "openai";
import { EmpiricalAI, replacePlaceholders } from "@empiricalrun/ai";

export const name = "llm-faithfulness";

// The few shot example is based on the implementation from Ragas
// https://github.com/explodinggradients/ragas/blob/main/src/ragas/metrics/_faithfulness.py
// TODO: add their license to satisfy Apache 2.0 conditions
const prompt = `Given the following context, determine whether the statements are supported by
 the information present in the context. Provide a brief explanation for each statement before arriving at the
 verdict (Yes/No). Provide a final verdict for each statement in order at the end in the given format.

Context:\nJohn is a student at XYZ University. He is pursuing a degree in Computer Science. He is enrolled in
 several courses this semester, including Data Structures, Algorithms, and Database Management. John is a
 diligent student and spends a significant amount of time studying and completing assignments. He often
 stays late in the library to work on his projects.

Statements:
1. John is majoring in Biology.
2. John is taking a course on Artificial Intelligence.
3. John is a dedicated student.
4. John has a part-time job.
5. John is interested in computer programming.\n
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

Context:\n{{context}}
{{statements}}
Answer:
`;

export const checkLlmFaithfulness: ScoringFn = async ({ sample, config }) => {
  let context = "";
  if (config.type !== "llm-faithfulness") {
    return [
      {
        name,
        score: 0,
        message: "invalid scoring function detected",
      },
    ];
  }
  if (config.context) {
    let replacements: any = { ...sample.inputs };
    if (sample.expected) {
      replacements.expected = sample.expected;
    }
    context = replacePlaceholders(config.context, replacements);
  }

  // TODO: Figure out how to use placeholders for this scorer
  // Output is not used currently, nor are claims replaced with placeholders
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: replacePlaceholders(prompt, {
        context,
        statements: config.claims.reduce((agg, claim, index) => {
          return `${agg}\nstatement ${index + 1}: ${claim}`;
        }, ""),
      }),
    },
  ];

  try {
    const response = await askLlmForEvalResult(messages, config.claims.length);
    const totalScore = Object.keys(response).reduce(
      (score, key) => score + (response[key] === "Yes" ? 1 : 0),
      0,
    );
    const reasonsForNo = Object.keys(response).reduce(
      (reasons: string[], key) =>
        response[key] === "No"
          ? [...reasons, response[`explanation_${key.split("_").pop()}`]!]
          : reasons,
      [],
    );
    return [
      {
        score: totalScore / config.claims.length,
        name: config.name || name,
        message: reasonsForNo.join("\n"),
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
  numStatements: number,
): Promise<{ [key: string]: string }> {
  const ai = new EmpiricalAI("openai");
  const properties = [...Array(numStatements).keys()].reduce(
    (agg: any, index) => {
      agg[`explanation_${index + 1}`] = {
        type: "string",
        description: `Explanation for the evaluation of statement ${index + 1}, shared as a step-by-step chain of thought`,
      };
      agg[`verdict_${index + 1}`] = {
        type: "string",
        enum: ["Yes", "No"],
        description: `Verdict for statement ${index + 1}`,
      };
      return agg;
    },
    {},
  );
  const required = Object.keys(properties);
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
            properties,
            required,
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
