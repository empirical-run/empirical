export * from "./ai";

export enum RoleType {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
}

export type ChatPrompt = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ScorerBase {
  type: string;
  threshold?: number;
}

export interface LLMScorer extends ScorerBase {
  type: "llm-critic";
  name?: string;
  criteria: string;
}

export interface DeterministicScorer extends ScorerBase {
  type: "json-syntax" | "sql-syntax" | "sql-semantic";
}

export interface ScriptScorer extends ScorerBase {
  type: "py-script";
  name?: string;
  path: string;
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
  parameters?: {
    [key: string]: any;
  };
}

type ResponseFormat = {
  type: "json_object" | "text";
};

interface ModelParameters {
  // From OpenAI config: see OpenAI.ChatCompletionCreateParamsNonStreaming
  // TODO: This does not support logit_bias, tools, tool_choice, user, stream
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  logprobs?: boolean;
  n?: number;
  presence_penalty?: number;
  response_format?: ResponseFormat;
  seed?: number;
  stop?: string | Array<string>;
  top_logprobs?: number;
  timeout?: number;

  // For other models, we coerce the above known parameters to appropriate slots
  // If users require other parameters, we support passthrough for other key names
  [key: string]: any;
}

export interface ModelRunConfig extends RunConfigBase {
  type: "model";
  provider:
    | "openai"
    | "mistral"
    | "google"
    | "anthropic"
    | "fireworks"
    | "azure-openai";
  model: string;
  prompt?: Prompt;
  parameters?: ModelParameters;
}

export interface AssistantsRunConfig extends RunConfigBase {
  type: "assistant";
  assistant_id: string;
  prompt: string;
  parameters?: {
    model?: string;
    temperature?: number;
    instructions?: string;
    tool_choice?: any;

    // Passthrough
    [key: string]: any;
  };
}

export interface JSScriptRunConfig extends RunConfigBase {
  type: "js-script";
  path: string;
}

export interface PyScriptRunConfig extends RunConfigBase {
  type: "py-script";
  path: string;
  parameters?: {
    concurrency?: number;
    [key: string]: any;
  };
}

export type RunConfig =
  | ModelRunConfig
  | PyScriptRunConfig
  | JSScriptRunConfig
  | AssistantsRunConfig;

export interface ScoreStats {
  name: string;
  count: number;
  average: number;
}

export interface RunCompletionStats {
  outputs: {
    count: number;
    success: number;
    failed: number;
  };
  scores: ScoreStats[];
  latency?: {
    average: number;
  };
  tokens_used?: {
    average: number;
  };
}

export interface RunCompletion {
  id: string;
  run_config: RunConfig;
  dataset_config: { id: string };
  samples: RunSampleOutput[];
  stats?: RunCompletionStats;
  created_at: Date;
}

export type DatasetSampleInputs = { [key: string]: string };

export type DatasetSample = {
  id: string;
  inputs: DatasetSampleInputs;
  expected?: string;
};

export type Dataset = {
  id: string;
  samples: DatasetSample[];
};

export type DatasetSampleConfig = {
  id?: string;
  inputs: DatasetSampleInputs;
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
  finish_reason?: string;
  tokens_used?: number;
  latency?: number;
};

export type RunSampleOutput = {
  id?: string;
  annotations?: string[];
  scores?: Score[];
  inputs: DatasetSampleInputs;
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

export interface RunMetadataUpdate {
  type: "run_metadata";
  data: {
    run_config: RunConfig;
    id: string;
    dataset_config: { id: string };
    created_at: Date;
  };
}

export interface RunSampleScoreUpdate {
  type: "run_sample_score";
  data: {
    run_id: string;
    sample_id: string | undefined;
    dataset_sample_id: string;
    scores: Score[];
  };
}

export interface RunSampleUpdate {
  type: "run_sample";
  data: RunSampleOutput;
}

export interface RunStatsUpdate {
  type: "run_stats";
  data: RunCompletionStats;
}
// TODO: fix naming
export type RunUpdateType =
  | RunMetadataUpdate
  | RunSampleUpdate
  | RunSampleScoreUpdate
  | RunStatsUpdate;

export interface RuntimeOptions {
  envFilePath: string | string[];
  pythonPath: string;
}
