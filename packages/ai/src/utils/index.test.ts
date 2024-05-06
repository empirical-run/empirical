import { describe, expect, test } from "vitest";
import { replacePlaceholders } from "./";

describe("replacePlaceholders", () => {
  test("works", () => {
    expect(replacePlaceholders("Hello, {{name}}!", { name: "John" })).to.equal(
      "Hello, John!",
    );
  });

  test("works with spaced syntax", () => {
    expect(
      replacePlaceholders("Hello, {{ name }}!", { name: "John" }),
    ).to.equal("Hello, John!");
  });

  test("works recursively", () => {
    expect(
      replacePlaceholders("Hello, {{ name }}!", {
        name: "{{surname}}",
        surname: "Doe",
      }),
    ).to.equal("Hello, Doe!");
  });

  test("works with variables that have spaces in them", () => {
    expect(
      replacePlaceholders("Hello, {{ first name }}!", { "first name": "John" }),
    ).to.equal("Hello, John!");
  });

  test("maintains data type: number", () => {
    expect(replacePlaceholders("{{ age }}", { age: 9 })).to.equal(9);
  });

  test("maintains data type: object", () => {
    const object = [{ foo: "bar" }];
    expect(replacePlaceholders("{{ object }}", { object })).to.equal(object);
  });

  test("doesnot maintain data type if string more than placeholder element", () => {
    const object = [{ foo: "bar" }];
    expect(replacePlaceholders(" {{ object }} ", { object })).to.equal(
      " [object Object] ",
    );
  });
});
