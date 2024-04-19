import { DatasetSample, RunCompletionStats } from "@empiricalrun/types";
import { RunResult } from "../types";

function sumObjectsByKey(...objs: any[]) {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = (a[k] || 0) + b[k];
    }
    return a;
  }, {});
}

export function aggregateRunStats(
  newStats: RunCompletionStats,
  oldStats: RunCompletionStats | undefined,
): RunCompletionStats {
  let avgLatency = undefined;
  if (oldStats?.latency?.average && newStats.latency?.average) {
    const total =
      oldStats.outputs.count * oldStats.latency.average +
      newStats.outputs.count * newStats.latency.average;
    avgLatency = total / (oldStats.outputs.count + newStats.outputs.count);
  }

  let avgTokensUsed = undefined;
  if (oldStats?.tokens_used?.average && newStats.tokens_used?.average) {
    const total =
      oldStats.outputs.count * oldStats.tokens_used.average +
      newStats.outputs.count * newStats.tokens_used.average;
    avgTokensUsed = total / (oldStats.outputs.count + newStats.outputs.count);
  }

  return {
    outputs: sumObjectsByKey(oldStats?.outputs || {}, newStats.outputs),
    scores: newStats.scores.map((score) => {
      const oldScore = oldStats?.scores.find((s) => s.name === score.name);
      const count = score.count + (oldScore?.count || 0);
      return {
        name: score.name,
        count,
        average:
          (score.count * score.average +
            (oldScore?.count || 0) * (oldScore?.average || 0)) /
          count,
      };
    }),
    latency: avgLatency ? { average: avgLatency } : undefined,
    tokens_used: avgTokensUsed ? { average: avgTokensUsed } : undefined,
  };
}

export function statsAfterRemoved(
  run: RunResult,
  sample: DatasetSample,
): RunCompletionStats | undefined {
  const { stats, samples } = run;
  if (!stats) {
    return stats;
  }
  const { scores, outputs } = stats;
  const foundSample = samples.find((s) => s.dataset_sample_id === sample.id);
  const keyToChange = foundSample && foundSample.error ? "failed" : "success";

  let avgLatency = run.stats?.latency?.average;
  if (avgLatency && foundSample && foundSample.output.latency) {
    const count = samples.length; // Assuming all outputs have latencies
    const oldTotal = avgLatency * count;
    avgLatency =
      count > 1
        ? (oldTotal - foundSample.output.latency) / (count - 1)
        : undefined;
  }
  let avgTokensUsed = run.stats?.tokens_used?.average;
  if (avgTokensUsed && foundSample && foundSample.output.tokens_used) {
    const count = samples.length; // Assuming all outputs have tokens_used
    const oldTotal = avgTokensUsed * count;
    avgTokensUsed =
      count > 1
        ? (oldTotal - foundSample.output.tokens_used) / (count - 1)
        : undefined;
  }

  return {
    outputs: {
      ...outputs,
      count: foundSample ? outputs.count - 1 : outputs.count,
      [keyToChange]: outputs[keyToChange] - 1,
    },
    scores: scores.map((score) => {
      const foundScore =
        foundSample &&
        foundSample.scores?.find(({ name }) => name === score.name);
      let { count, average } = score;
      if (foundScore) {
        const oldTotal = average * count;
        count = count - 1;
        const newTotal = oldTotal - foundScore.score;
        average = newTotal / count;
      }
      return {
        ...score,
        count,
        average,
      };
    }),
    latency: avgLatency ? { average: avgLatency } : undefined,
    tokens_used: avgTokensUsed ? { average: avgTokensUsed } : undefined,
  };
}
