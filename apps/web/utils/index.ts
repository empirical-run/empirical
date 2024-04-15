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
        avgScore:
          (score.count * score.avgScore +
            (oldScore?.count || 0) * (oldScore?.avgScore || 0)) /
          count,
      };
    }),
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
      let { count, avgScore } = score;
      if (foundScore) {
        const oldTotal = avgScore * count;
        count = count - 1;
        const newTotal = oldTotal - foundScore.score;
        avgScore = newTotal / count;
      }
      return {
        ...score,
        count,
        avgScore,
      };
    }),
  };
}
