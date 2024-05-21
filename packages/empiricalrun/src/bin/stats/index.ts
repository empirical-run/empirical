import { getStatsForRun } from "../../index";
import { RunCompletion } from "@empiricalrun/types";
import { green, yellow, bold, cyan, red } from "picocolors";
import { table } from "table";

const percentStr = (value: number) => `${value.toFixed(0)}%`;
const latencyStr = (value: number) => `${value.toFixed(0)}ms`;

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
  const scorerNames = [
    ...new Set(
      runs.flatMap(
        (run) => run?.stats?.scores?.map((score) => score.name) || [],
      ),
    ),
  ];
  const rows = [
    [
      " ",
      ...runs.map((c) =>
        enableColors ? bold(c.run_config.name) : c.run_config.name!,
      ),
    ],
    [
      enableColors ? bold("Outputs") : "Outputs",
      ...runs.map((c) => {
        const metric = percentStr((c?.stats?.outputs.success || 0) * 100);
        return enableColors
          ? setMetricColor(metric, c?.stats?.outputs.success || 0)
          : metric;
      }),
    ],
  ];
  if (scorerNames.length > 0) {
    rows.push(["Scores", ...runs.map(() => " ")]);
    scorerNames.map((sn) => {
      rows.push([
        enableColors ? bold(sn) : sn,
        ...runs.map((c) => {
          const scoreStats = c.stats?.scores.filter((s) => s.name === sn)[0];
          if (scoreStats) {
            const metric = percentStr(scoreStats.average * 100);
            return enableColors
              ? setMetricColor(metric, scoreStats.average)
              : metric;
          } else {
            return "-";
          }
        }),
      ]);
    });
  }
  if (runs.some((r) => !!r.stats?.latency?.average)) {
    rows.push([
      "Avg latency",
      ...runs.map(({ stats }) =>
        stats?.latency?.average ? latencyStr(stats?.latency?.average) : " ",
      ),
    ]);
  }
  return rows;
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
  return `### Empirical Run Summary\n${markdownTable}`;
}

export function printStatsSummary(runs: RunCompletion[]) {
  const hasAvgLatency = runs.some(({ stats }) => !!stats?.latency?.average);
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
          lineIndex === 3 ||
          lineIndex === rowCount ||
          (hasAvgLatency && lineIndex === rowCount - 1)
        );
      },
      columns: [{ alignment: "left" }],
    }),
  );
}

export function failedOutputsSummary(runs: RunCompletion[]):
  | {
      code?: string;
      message: string;
    }
  | undefined {
  const failedOutputs = runs
    .filter((run) => run.stats?.outputs.failed && run.stats?.outputs.failed > 0)
    .map((run) => run.samples)
    .flat();
  // TODO: Better summary of errors, maybe through the progress callback
  // TODO: Ensure error is not undefined
  if (failedOutputs.length > 0 && failedOutputs[0]!.error) {
    return { ...failedOutputs[0]!.error };
  }
}
