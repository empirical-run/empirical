export function replacePlaceholders(string: string, obj: any) {
  return string.replace(/{{(\w+)}}/g, function (match, key) {
    return obj[key];
  });
}
