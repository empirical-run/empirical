import { IEmpiricalAIError } from "@empiricalrun/types";

export enum DatasetErrorEnum {
  INVALID_CONFIG = "DS101",
  FETCH_FAILED = "DS102",
  JSON_LOADER_FAILED = "DS103",
  JSONL_LOADER_FAILED = "DS104",
  UNSUPPORTED_FILE_EXTENSION = "DS105",
}

export class DatasetError extends Error implements IEmpiricalAIError {
  name = "DatasetError";
  constructor(
    public code: DatasetErrorEnum,
    public message: string,
  ) {
    super(message);
  }
}
