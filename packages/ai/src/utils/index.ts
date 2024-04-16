export * from "./batch-tasks";

export function replacePlaceholders(string: string, obj: any) {
  return string.replace(/{{(\w+)}}/g, function (match, key) {
    return obj[key];
  });
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
