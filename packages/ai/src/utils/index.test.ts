import { expect, test } from "vitest";
import { replacePlaceholders } from "./";

test("replace placeholders works", () => {
  expect(replacePlaceholders("Hello, {{name}}!", { name: "John" })).to.equal(
    "Hello, John!",
  );
});

test("replace placeholders works with spaced syntax", () => {
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

test("replace placeholders works with variables that have spaces in them", () => {
  expect(
    replacePlaceholders("Hello, {{ first name }}!", { "first name": "John" }),
  ).to.equal("Hello, John!");
});
