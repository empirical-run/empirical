import { expect, test } from "vitest";
import { replacePlaceholders } from "./";

test("replace placeholders works", () => {
  expect(replacePlaceholders("Hello, {{name}}!", { name: "John" })).to.equal(
    "Hello, John!",
  );
});

test("replace placeholders works even with spaces", () => {
  expect(replacePlaceholders("Hello, {{ name }}!", { name: "John" })).to.equal(
    "Hello, John!",
  );
});
