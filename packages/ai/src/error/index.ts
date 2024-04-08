import { IEmpiricalAIError } from "@empiricalrun/types";

export enum AIErrorEnum {
  // unknown error
  UNKNOWN = "AI101",
  // parameter errors
  INCORRECT_PARAMETERS = "AI201",
  MISSING_PARAMETERS = "AI202",
  // failed completions
  FAILED_CHAT_COMPLETION = "AI301",
  // rate limiting
  RATE_LIMITED = "AI401",
}

export class AIError extends Error implements IEmpiricalAIError {
  name = "AIError";
  constructor(
    public code: AIErrorEnum,
    public message: string,
  ) {
    super(message);
  }
}
