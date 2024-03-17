export function generateHex(len: number) {
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export function replacePlaceholders(string: string, obj: any) {
  return string.replace(/{{(\w+)}}/g, function (match, key) {
    return obj[key];
  });
}
