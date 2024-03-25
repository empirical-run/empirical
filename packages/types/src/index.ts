export * from "./ai";

export enum RoleType {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
}

export type ChatPrompt = {
  role: string;
  comment: string;
};

export type Scorer = {
  type: string;
  threshold?: number;
  value?: string;
};

export type Prompt = string | ChatPrompt[];

export type Provider = {
  type: string;
  value: string;
};

interface RunConfigBase {
  type: string;
  name?: string;
  scorers?: Scorer[];
  metadata?: object;
}

export interface IModelRunConfig extends RunConfigBase {
  type: "model";
  provider: "openai" | "mistral" | "google" | "anthropic";
  model: string;
  prompt?: Prompt;
}

export interface IJSScriptRunConfig extends RunConfigBase {
  type: "js-script";
  value: string;
}

export interface IPyScriptRunConfig extends RunConfigBase {
  type: "py-script";
  value: string;
  pythonPath?: string;
}

export type IRunConfig =
  | IModelRunConfig
  | IPyScriptRunConfig
  | IJSScriptRunConfig;

export interface IDatasetConfig {
  id: string;
}

export interface RunCompletion {
  id: string;
  run_config: IRunConfig;
  dataset_config: IDatasetConfig;
  samples: RunOutputSample[];
  created_at: Date;
}

export type DatasetSampleInput = {
  name: string;
  value: string;
};

export type DatasetSample = {
  id: string;
  inputs: DatasetSampleInput[];
  expected?: string;
};

export type Dataset = {
  id: string;
  path?: string;
  samples?: DatasetSample[];
};

// TODO: fix types. text generation and others how does that show up ?
export enum ModelTypes {
  CHAT = "chat",
}

export type RunOutputType = {
  value: string | null | undefined;
  metadata?: object | undefined;
};

export type RunOutputSample = {
  id?: string;
  annotations?: string[];
  scores?: Score[];
  inputs: DatasetSampleInput[];
  output: RunOutputType;
  expected?: {
    value: string;
  };
  error?: {
    code?: string;
    message: string;
  };
  dataset_sample_id: string;
  created_at?: Date;
  run_id: string;
};

export type Score = {
  score: number;
  name: string;
  message: string;
};
