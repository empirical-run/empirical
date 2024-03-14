import { RunsConfig } from "../../../types";

export const config: RunsConfig = {
  version: "0.0.1",
  runs: [
    {
      name: "gpt-3.5-turbo run",
      model: "openai:gpt-3.5-turbo",
      prompt:
        "You are expected to respond with a JSON object, which has above keys and corresponding entities. If an entity is missing, respond with null. \\n\\n{{user_message}}",
    },
    {
      name: "gpt-4-turbo-preview run",
      model: "openai:gpt-4-turbo-preview",
      prompt:
        "You are expected to respond with a JSON object, which has above keys and corresponding entities. If an entity is missing, respond with null. \\n\\n{{user_message}}",
    },
  ],
  dataset: {
    samples: [
      {
        inputs: [
          {
            name: "user_message",
            value:
              "Hi my name is John Doe. I'm 26 years old and I work in real estate.",
          },
        ],
      },
      {
        inputs: [
          {
            name: "user_message",
            value:
              "This is Alice. I am a nurse from Maryland. I was born in 1990.",
          },
        ],
      },
    ],
  },
};
