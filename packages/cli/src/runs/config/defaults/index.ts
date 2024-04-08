import { RunsConfig } from "../../../types";

export const config: RunsConfig = {
  runs: [
    {
      type: "model",
      provider: "openai",
      model: "gpt-3.5-turbo",
      prompt:
        "Extract the name, age and location from the message, and respond with a JSON object. If an entity is missing, respond with null.\n\nMessage: {{user_message}}",
      scorers: [
        {
          type: "is-json",
        },
      ],
    },
    {
      type: "model",
      provider: "openai",
      model: "gpt-4-turbo-preview",
      prompt:
        "Extract the name, age and location from the message, and respond with a JSON object. If an entity is missing, respond with null.\n\nMessage: {{user_message}}",
      scorers: [
        {
          type: "is-json",
        },
      ],
    },
  ],
  dataset: {
    samples: [
      {
        inputs: {
          user_message:
            "Hi my name is John Doe. I'm 26 years old and I work in real estate.",
        },
      },
      {
        inputs: {
          user_message:
            "This is Alice. I am a nurse from Maryland. I was born in 1990.",
        },
      },
    ],
  },
};
