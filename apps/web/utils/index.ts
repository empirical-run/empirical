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
    // TODO
    latency: { average: 0 },
    tokens_used: { average: 0 },
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
    // TODO
    latency: { average: 0 },
    tokens_used: { average: 0 },
  };
}
