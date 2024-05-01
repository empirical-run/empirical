import { describe, expect, test } from "vitest";
import { extractTargetFromOutput } from "./index";

describe.concurrent("test extractTarget", () => {
  test("extractTarget renders template with data", () => {
    const output = {
      value: "Hello World",
    };
    const result = extractTargetFromOutput(output, "{{output.value}}");
    expect(result).toEqual("Hello World");
  });

  test("dump json string while extracting", () => {
    const output = {
      tool_calls: [{ function: "foo" }, { function: "bar" }],
    };
    const result = extractTargetFromOutput(
      output,
      "{{output.tool_calls | dump}}",
    );
    expect(result).toEqual('[{"function":"foo"},{"function":"bar"}]');
  });

  test("able to properies from array", () => {
    const output = {
      tool_calls: [{ function: "foo" }, { function: "bar" }],
    };
    const result = extractTargetFromOutput(
      output,
      "{{output.tool_calls[0].function}}",
    );
    expect(result).toEqual("foo");
  });

  test("shouldnt throw error for missing deep nested property", () => {
    const output = {
      tool_calls: [],
    };
    const result = extractTargetFromOutput(
      output,
      "{{output.tool_calls[0].function}}",
    );
    expect(result).toEqual("");
  });

  test("handle cases when output is undefined", () => {
    const output = undefined;
    const result = extractTargetFromOutput(
      // @ts-ignore: checking runtime failures
      output,
      "{{output.tool_calls[0].function}}",
    );
    expect(result).toEqual("");
  });
});
