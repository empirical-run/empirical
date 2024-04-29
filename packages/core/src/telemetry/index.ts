import { EmpiricalStore } from "../store";
import { RunConfig, Dataset } from "@empiricalrun/types";
import { PostHog } from "posthog-node";
import { POSTHOG_API_KEY } from "./constants";

export class Telemetry {
  client;
  store;
  constructor() {
    this.store = new EmpiricalStore();
    try {
      const apiKey = POSTHOG_API_KEY;
      if (!apiKey.includes("dummy-value")) {
        this.client = new PostHog(apiKey, {
          host: "https://us.i.posthog.com",
          flushAt: 0,
          flushInterval: 500,
        });
      }
    } catch (err) {
      //
    }
  }

  async shutdown() {
    try {
      if (this.client) {
        await this.client.shutdown();
      }
    } catch (err) {
      //
    }
  }

  async logEvent(event: string, properties: Record<string, any> = {}) {
    try {
      if (this.client) {
        this.client.capture({
          distinctId: await this.userId(),
          event: `cli.${event}`,
          properties: {
            ...properties,
            ...this.defaultProperties(),
          },
        });
      }
    } catch (err) {
      //
    }
  }

  private async userId(): Promise<string> {
    return (await this.store.getUserData()).id;
  }

  private defaultProperties() {
    return {
      is_ci: process.env.CI === "true",
      ci_platform: getCiPlatformName(),
    };
  }
}

function getCiPlatformName() {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.GITLAB_CI === "true") {
    return "gitlab";
  } else if (process.env.GITHUB_ACTIONS === "true") {
    return "github";
  }
  return "unknown";
}

export function runEventProperties(runs: RunConfig[], dataset: Dataset) {
  return {
    dataset_size: dataset.samples?.length || 0,
    providers_count_model: runs.filter(({ type }) => type === "model").length,
    providers_count_script: runs.filter(({ type }) => type.endsWith("script"))
      .length,
  };
}
