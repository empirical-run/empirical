import { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("pkg:lib", {
    description: "Adds a new ts library to packages",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "package name",
        default: "package-name",
        validate: (name: string) => {
          if (/\s/g.test(name)) {
            throw new Error("Name can't have spaces");
          }
          return true;
        },
        transformer: (name: string) => name.toLowerCase(),
      },
      {
        type: "input",
        name: "description",
        message: "package description",
        default: "",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "{{ turbo.paths.root }}/packages/{{name}}",
        base: "templates/package/library",
        templateFiles: "templates/package/library",
      },
    ],
  });
}
