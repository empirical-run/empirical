import { IEmpiricalAIError } from "@empiricalrun/types";

export enum AIErrorEnum {
  NONE = "",
  // unknown error
  UNKNOWN = "AI101",
  // parameter based errors
  INCORRECT_PARAMETERS = "AI201",
  MISSING_PARAMETERS = "AI202",
  // failed completions
  DEFAULT_FAILED_CHAT_COMPLETION = "AI301",
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
