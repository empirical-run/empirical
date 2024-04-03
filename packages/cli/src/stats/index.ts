import { getStatsForRun } from "@empiricalrun/core";
import { RunCompletion } from "@empiricalrun/types";
import { green, yellow, bold, cyan, red } from "picocolors";
import { table } from "table";

const percentStr = (value: number) => `${value.toFixed(0)}%`;

const setMetricColor = (metric: string, value: number) => {
  if (value === 1) {
    return green(metric);
  } else if (value > 0) {
    return yellow(metric);
  } else {
    return red(metric);
  }
};

export function setRunSummary(runs: RunCompletion[]) {
  runs.forEach((r) => (r.stats = getStatsForRun(r)));
}

export function printStatsSummary(runs: RunCompletion[]) {
  // TODO: should get rid of this once config has separate scorer object
  const scorerNames = runs[0]?.stats?.scores.map((s) => s.name) || [];
  const runStatsSummary = [
    [bold("Stats"), ...runs.map((c) => bold(c.run_config.name))],
    [
      bold("outputs"),
      ...runs.map((c) => {
        const metric = percentStr((c?.stats?.outputs.success || 0) * 100);
        return setMetricColor(metric, c?.stats?.outputs.success || 0);
      }),
    ],
    ...scorerNames.map((sn) => {
      return [
        bold(sn),
        ...runs.map((c) => {
          const scoreStats = c.stats?.scores.filter((s) => s.name === sn)[0];
          if (scoreStats) {
            const metric = percentStr(scoreStats.avgScore * 100);
            return setMetricColor(metric, scoreStats.avgScore);
          } else {
            return percentStr(0);
          }
        }),
      ];
    }),
  ];
  console.log(
    table(runStatsSummary, {
      header: {
        alignment: "center",
        content: bold(cyan("Empirical Run Summary")),
      },
      columnDefault: {
        alignment: "right",
      },
      drawHorizontalLine: (lineIndex, rowCount) => {
        return (
          lineIndex === 0 ||
          lineIndex === 1 ||
          lineIndex === 2 ||
          lineIndex === rowCount
        );
      },
      columns: [{ alignment: "left" }],
    }),
  );
}
