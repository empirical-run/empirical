import { IEmpiricalAIError } from "@empiricalrun/types";

export enum ScorerErrorEnum {
  // parameter errors
  INCORRECT_PARAMETERS = "SC101",
  MISSING_PARAMETERS = "SC102",
}

export class ScorerError extends Error implements IEmpiricalAIError {
  name = "ScorerError";
  constructor(
    public code: ScorerErrorEnum,
    public message: string,
  ) {
    super(message);
  }
}
