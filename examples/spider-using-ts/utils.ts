import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";


export function getFileName(): string {
  return `${uuidv4().slice(0, 6)}.db`;
}

export function loadJson(name: string): any {
  const file = fs.readFileSync(name, "utf-8");
  return JSON.parse(file);
}

export function removeBackticks(text: string): string {
  /**
   * If we find backticks, return the code snippet from within them
   */
  const prunedText = text.replace("```sql", "");
  const found = prunedText.match(/```(.*?)```/s);
  if (found && found.length > 1) {
    return found[1];
  } else {
    return prunedText;
  }
}

export function cleanClosingBraces(text: string): string {
  /**
   * For Claude
   */
  return text.replace("</SQL>", "");
}