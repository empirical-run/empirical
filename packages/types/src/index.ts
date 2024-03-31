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

export interface ScorerBase {
  type: string;
  threshold?: number;
}

export interface LLMScorer extends ScorerBase {
  type: "llm-criteria";
  name?: string;
  criteria?: string;
}

export interface DeterministicScorer extends ScorerBase {
  type: "is-json" | "sql-syntax" | "sql-semantic";
}

export interface ScriptScorer extends ScorerBase {
  type: "py-script";
  name?: string;
  path?: string;
}

export type Scorer = LLMScorer | DeterministicScorer | ScriptScorer;

export type Prompt = string | ChatPrompt[];

export type Provider = {
  type: string;
  value: string;
};

interface RunConfigBase {
  type: string;
  name?: string;
  scorers?: Scorer[];
}

export interface ModelRunConfig extends RunConfigBase {
  type: "model";
  provider: "openai" | "mistral" | "google" | "anthropic";
  model: string;
  prompt?: Prompt;
}

export interface JSScriptRunConfig extends RunConfigBase {
  type: "js-script";
  value: string;
}

export interface PyScriptRunConfig extends RunConfigBase {
  type: "py-script";
  value: string;
  pythonPath?: string;
}

export type IRunConfig = ModelRunConfig | PyScriptRunConfig | JSScriptRunConfig;

export interface ScoreStats {
  name: string;
  count: number;
  avgScore: number;
}

export interface RunOutputStats {
  outputs: {
    count: number;
    success: number;
    failed: number;
  };
  scores: ScoreStats[];
}

export interface RunCompletion {
  id: string;
  run_config: IRunConfig;
  dataset_config: { id: string };
  samples: RunOutputSample[];
  stats?: RunOutputStats;
  created_at: Date;
}

export type DatasetSample = {
  id: string;
  inputs: { [key: string]: string };
  expected?: string;
};

export type Dataset = {
  id: string;
  samples: DatasetSample[];
};

export type DatasetSampleConfig = {
  id?: string;
  inputs: { [key: string]: string };
  expected?: string;
};

export type DatasetConfig =
  | {
      samples: DatasetSampleConfig[];
    }
  | {
      path: string;
    };

// TODO: fix types. text generation and others how does that show up ?
export enum ModelTypes {
  CHAT = "chat",
}

export type RunOutput = {
  value: string | null | undefined;
  metadata?: object | undefined;
};

export type RunOutputSample = {
  id?: string;
  annotations?: string[];
  scores?: Score[];
  inputs: { [key: string]: string };
  output: RunOutput;
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
