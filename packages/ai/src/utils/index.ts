export function detectMimeTypeFromBase64Img(str: string) {
  return str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || "";
}
