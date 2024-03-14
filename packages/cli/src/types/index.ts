export enum RoleType {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
}

export type ChatPrompt = {
  role: string;
  comment: string;
};

export type Assert = {
  type: string;
  threshold?: number;
};

export type Prompt = string | ChatPrompt[];

export type Model = string;

export type Run = {
  name: string;
  model: Model;
  prompt?: Prompt;
  assert?: Assert;
};

export type DatasetSampleInput = {
  name: string;
  value: string;
};

export type DatasetSample = {
  inputs: DatasetSampleInput[];
  expected?: string;
};

export type Dataset = {
  samples: DatasetSample[];
};

export type RunsConfig = {
  version: string;
  runs: Run[];
  dataset: Dataset;
};
