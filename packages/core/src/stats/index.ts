import {
  RunCompletion,
  RunCompletionStats,
  Score,
  ScoreStats,
} from "@empiricalrun/types";

function getAverage(values: number[]) {
  const total = values.reduce((agg, v) => agg + v, 0);
  const count = values.length;
  return Number((total / count).toFixed(2));
}

function getAverageScore(scores: Score[]) {
  return getAverage(scores.map((s) => s.score));
}

export function getStatsForRun(run: RunCompletion): RunCompletionStats {
  const totalOutputsCount = run.samples.length;
  const failedOutputsCount = run.samples.filter((s) => !!s.error).length;
  const scoreMap = new Map<string, Score[]>();
  const latencies = new Array<number>();
  const tokens_used = new Array<number>();
  for (const sample of run.samples) {
    const scores = sample?.scores || [];
    for (const score of scores) {
      if (!scoreMap.get(score.name)) {
        scoreMap.set(score.name, []);
      }
      scoreMap.set(score.name, [...scoreMap.get(score.name)!, score]);
    }
    if (sample.output.latency) {
      latencies.push(sample.output.latency);
    }
    if (sample.output.tokens_used) {
      tokens_used.push(sample.output.tokens_used);
    }
  }
  const scoresStats: ScoreStats[] = [];
  scoreMap.forEach((scores: Score[], scoreName: string) => {
    const count = scores.length;
    const average = getAverageScore(scores);
    scoresStats.push({
      name: scoreName,
      count,
      average,
    });
  });
  return {
    outputs: {
      count: totalOutputsCount,
      success: Number(
        (
          (totalOutputsCount - failedOutputsCount) /
          (totalOutputsCount ? totalOutputsCount : 1)
        ).toFixed(2),
      ),
      failed: Number(
        (
          failedOutputsCount / (totalOutputsCount ? totalOutputsCount : 1)
        ).toFixed(2),
      ),
    },
    scores: scoresStats,
    latency: latencies.length > 0 ? {
      average: getAverage(tokens_used),
    } : undefined,
      average: getAverage(latencies),
    },
    tokens_used: {
      average: getAverage(tokens_used),
    },
  };
}
