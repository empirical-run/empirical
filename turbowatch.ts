import { watch } from "turbowatch";

void watch({
  project: __dirname,
  triggers: [
    {
      expression: [
        "allof",
        ["not", ["dirname", "node_modules"]],
        ["match", "*.ts", "basename"],
      ],
      name: "build",
      onChange: async ({ spawn }) => {
        await spawn`pnpm run build --force`;
        await spawn`pnpm install`;
      },
    },
  ],
});
