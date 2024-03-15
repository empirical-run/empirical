import OpenAI from "openai";

const openai = new OpenAI();

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function completion({
  model,
  messages,
}: {
  model: string;
  messages: Message[];
}) {
  const completion = await openai.chat.completions.create({
    messages,
    model,
  });
  return completion.choices[0];
}
