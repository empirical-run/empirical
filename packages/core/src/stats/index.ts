import {
  RunCompletion,
  RunOutputStats,
  Score,
  ScoreStats,
} from "@empiricalrun/types";

function getAverage(scores: Score[]) {
  const totalScore = scores.reduce((agg, s) => agg + s.score, 0);
  const count = scores.length;
  return Number((totalScore / count).toFixed(2));
}

export function getStatsForRun(run: RunCompletion): RunOutputStats {
  const totalOutputsCount = run.samples.length;
  const failedOutputsCount = run.samples.filter((s) => !!s.error).length;
  const scoreMap = new Map<string, Score[]>();
  for (const sample of run.samples) {
    const scores = sample?.scores || [];
    for (const score of scores) {
      if (!scoreMap.get(score.name)) {
        scoreMap.set(score.name, []);
      }
      scoreMap.set(score.name, [...scoreMap.get(score.name)!, score]);
    }
  }
  const scoresStats: ScoreStats[] = [];
  scoreMap.forEach((scores: Score[], scoreName: string) => {
    const count = scores.length;
    const avgScore = getAverage(scores);
    scoresStats.push({
      name: scoreName,
      count,
      avgScore,
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
  };
}
