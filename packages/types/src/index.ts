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

export type Provider = {
  type: string;
  value: string;
};

export type Run = {
  name: string;
  model: Model;
  prompt?: Prompt;
  assert?: Assert[];
};

export type RunCompletion = {
  id: string;
  name?: string;
  model: Model;
  prompt?: Prompt;
  dataset_id: string;
  assert?: Assert[];
  samples: RunOutputSample[];
  created_at: Date;
};

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

export type RunOutputSample = {
  id?: string;
  annotations?: string[];
  scores: Score[];
  inputs: DatasetSampleInput[];
  output: string;
  expected?: {
    value: string;
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
