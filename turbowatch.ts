import { watch } from "turbowatch";

void watch({
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
      ],
      name: "build",
      onChange: async ({ spawn }) => {
        await spawn`pnpm install`;
        await spawn`pnpm run build`;
        await spawn`pnpm install`;
      },
    },
  ],
});
