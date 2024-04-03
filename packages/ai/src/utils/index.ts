export * from "./batch-tasks";

export function replacePlaceholders(string: string, obj: any) {
  return string.replace(/{{(\w+)}}/g, function (match, key) {
    return obj[key];
  });
}

function isKnownParameter(paramName: string) {
  const knownParameters = [
    "temperature",
    "max_tokens",
    "top_p",
    "frequency_penalty",
    "logprobs",
    "n",
    "presence_penalty",
    "response_format",
    "seed",
    "stop",
    "top_logprobs",
  ];
  const otherFieldsToSkip = ["model", "messages"];
  return [...knownParameters, ...otherFieldsToSkip].indexOf(paramName) >= 0;
}

export function getPassthroughParams(body: { [key: string]: any }) {
  let passthroughParams: { [key: string]: any } = {};

  Object.keys(body)
    .filter((key) => !isKnownParameter(key))
    .forEach((key) => {
      passthroughParams[key] = body[key];
      body[key] = undefined;
    });

  return passthroughParams;
}
