import { RunCompletionStats, ScoreStats } from "@empiricalrun/types";
import { useScoreSummary } from "../hooks/useScoreSummary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "./ui/tabs";
import ScoreBadge from "./ui/score-badge";

export function ScoreSummary({
  runId,
  stats,
}: {
  runId: string;
  stats: RunCompletionStats;
}) {
  const { scores, messages } = useScoreSummary({ runId });
  const scoreNames = stats.scores.map((s) => s.name);
  const statsMap = stats.scores.reduce(
    (agg, s) => {
      agg[s.name] = s;
      return agg;
    },
    {} as { [key: string]: ScoreStats },
  );
  return (
    <section className="flex flex-row gap-2">
      <Tabs defaultValue="scores" className="w-full">
        <TabsList>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="scores">
          <section className="flex flex-col gap-4">
            {scoreNames.map((scoreName) => {
              const filteredScores = scores.filter((s) => s.name === scoreName);
              return (
                <section className="flex flex-col gap-1">
                  <section className="flex flex-row">
                    <ScoreBadge
                      title={scoreName}
                      score={statsMap[scoreName]?.avgScore || 0}
                    />
                  </section>
                  <section className="flex flex-row">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Score</TableHead>
                          <TableHead>Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredScores.map((score) => (
                          <TableRow
                            key={`${score.name}-${score.count}-${score.score}`}
                          >
                            <TableCell className="font-medium">
                              {score.score}
                            </TableCell>
                            <TableCell>{score.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                </section>
              );
            })}
          </section>
        </TabsContent>
        <TabsContent value="messages">
          <section className="flex flex-col gap-4">
            {scoreNames.map((scoreName) => {
              const filteredMessages = messages.filter(
                (s) => s.name === scoreName,
              );
              return (
                <section className="flex flex-col gap-1">
                  <section className="flex flex-row">
                    <ScoreBadge
                      title={scoreName}
                      score={statsMap[scoreName]?.avgScore || 0}
                    />
                  </section>
                  <section className="flex flex-row">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Message</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMessages.map((message) => (
                          <TableRow key={`${message.name}-${message.count}`}>
                            <TableCell className="font-medium">
                              {message.message || (
                                <i className=" text-muted">{"[Empty]"}</i>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {message.score}
                            </TableCell>
                            <TableCell>{message.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                </section>
              );
            })}
          </section>
        </TabsContent>
      </Tabs>
    </section>
  );
}
