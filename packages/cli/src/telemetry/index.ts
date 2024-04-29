import { EmpiricalStore } from "@empiricalrun/core";
import { RunConfig, Dataset } from "@empiricalrun/types";
import { PostHog } from "posthog-node";

export class Telemetry {
  client;
  store;
  constructor() {
    this.client = new PostHog(
      "phc_i8M8uSXpDBIGSJNmv9EM0k9Mg9JGDDsrjR1IqNMasLG",
      {
        host: "https://us.i.posthog.com",
        flushAt: 0,
        flushInterval: 500,
      },
    );
    this.store = new EmpiricalStore();
  }

  async userId(): Promise<string> {
    return (await this.store.getUserData()).id;
  }

  async shutdown() {
    await this.client.shutdown();
  }

  defaultProperties() {
    return {
      is_ci: process.env.CI === "true",
      ci_platform: getCiPlatformName(),
    };
  }

  async logEvent(event: string, properties: Record<string, any> = {}) {
    this.client.capture({
      distinctId: await this.userId(),
      event: `cli.${event}`,
      properties: {
        ...properties,
        ...this.defaultProperties(),
      },
    });
  }
}

function getCiPlatformName() {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.GITLAB_CI === "true") {
    return "gitlab";
  }
  if (process.env.GITHUB_ACTIONS === "true") {
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
