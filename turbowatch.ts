import { watch } from "turbowatch";

void watch({
  debounce: {
    wait: 0,
  },
  project: __dirname,
  triggers: [
    {
      expression: [
        "allof",
        ["not", ["dirname", "node_modules"]],
        [
          "anyof",
          ["match", "*.ts", "basename"],
          ["match", "*.tsx", "basename"],
          ["match", "*.py", "basename"],
        ],
        // Posthog API key is written during build time, which
        // should not trigger another build due to watch
        ["not", ["match", "constants.ts", "basename"]],
      ],
      name: "build",
      onChange: async ({ spawn }) => {
        await spawn`pnpm install`;
        await spawn`pnpm run build --force`;
        await spawn`pnpm install`;
      },
      interruptible: true,
    },
  ],
});
