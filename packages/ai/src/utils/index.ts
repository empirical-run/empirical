export * from "./batch-tasks";

export function replacePlaceholders(string: string, obj: any) {
  const regex = /{{([^}]*)}}/g;
  let replacement = string;
  let found = replacement.match(regex);
  while (found) {
    replacement = replacement.replace(regex, function (match, key) {
      return obj[key.trim()];
    });
    found = replacement.match(regex);
  }
  return replacement;
}

function isReservedParameter(paramName: string) {
  const reservedParameters = [
    "model",
    "messages",
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
    "timeout",
    "tools",
    "tool_choice",
  ];
  return reservedParameters.indexOf(paramName) >= 0;
}

export function getPassthroughParams(body: { [key: string]: any }) {
  return Object.keys(body)
    .filter((key) => !isReservedParameter(key))
    .reduce((passthroughParams: { [key: string]: any }, key) => {
      passthroughParams[key] = body[key];
      return passthroughParams;
    }, {});
}
