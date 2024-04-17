import { expect, test } from "vitest";
import { replacePlaceholders } from "./";

test("replace placeholders works", () => {
  expect(replacePlaceholders("Hello, {{name}}!", { name: "John" })).to.equal(
    "Hello, John!",
  );
});

test("replace placeholders works with spaces", () => {
  expect(replacePlaceholders("Hello, {{ name }}!", { name: "John" })).to.equal(
    "Hello, John!",
  );
});

test("replace placeholders works recursively", () => {
  expect(
    replacePlaceholders("Hello, {{ name }}!", {
      name: "{{surname}}",
      surname: "Doe",
    }),
  ).to.equal("Hello, Doe!");
});
