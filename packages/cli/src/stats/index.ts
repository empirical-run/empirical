import { getStatsForRun } from "@empiricalrun/core";
import { RunCompletion } from "@empiricalrun/types";
import { green, yellow, bold, cyan, red } from "picocolors";
import { table } from "table";

const percentStr = (value: any) => `${value}%`;

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

function runStatsSummary(
  runs: RunCompletion[],
  enableColors: boolean,
): string[][] {
  // TODO: should get rid of this once config has separate scorer object
  const scorerNames = runs[0]?.stats?.scores.map((s) => s.name) || [];
  return [
    [
      enableColors ? bold("Stats") : "Stats",
      ...runs.map((c) => bold(c.run_config.name)),
    ],
    [
      enableColors ? bold("outputs") : "outputs",
      ...runs.map((c) => {
        const metric = percentStr((c?.stats?.outputs.success || 0) * 100);
        return enableColors
          ? setMetricColor(metric, c?.stats?.outputs.success || 0)
          : metric;
      }),
    ],
    ...scorerNames.map((sn) => {
      return [
        enableColors ? bold(sn) : sn,
        ...runs.map((c) => {
          const scoreStats = c.stats?.scores.filter((s) => s.name === sn)[0];
          if (scoreStats) {
            const metric = percentStr(scoreStats.avgScore * 100);
            return enableColors
              ? setMetricColor(metric, scoreStats.avgScore)
              : metric;
          } else {
            return percentStr(0);
          }
        }),
      ];
    }),
  ];
}

export function markdownSummary(runs: RunCompletion[]): string {
  const markdownTable = table(runStatsSummary(runs, false), {
    border: {
      topBody: "",
      topJoin: "",
      topLeft: "",
      topRight: "",
      bottomBody: "",
      bottomJoin: "",
      bottomLeft: "",
      bottomRight: "",
      bodyLeft: "|",
      bodyRight: "|",
      bodyJoin: "|",
      joinBody: "-",
      joinLeft: "|",
      joinRight: "|",
      joinJoin: "|",
    },
    drawHorizontalLine: (index) => index === 1,
  });
  return `## Empirical Run Summary\n${markdownTable}`;
}

export function printStatsSummary(runs: RunCompletion[]) {
  console.log(
    table(runStatsSummary(runs, true), {
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
