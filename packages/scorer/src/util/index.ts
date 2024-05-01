import nunjucks from "nunjucks";

export function extractTargetFromOutput(
  output: object,
  target: string = "{{output.value}}",
) {
  return nunjucks.renderString(target, { output }).replaceAll("&quot;", '"');
}
