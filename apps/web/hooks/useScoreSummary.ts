import { useEffect, useState } from "react";

type ScoreSummary = {
  name: string;
  score: number;
  count: number;
};

type MessageSummary = {
  name: string;
  message: string;
  count: number;
  score: number;
};

export function useScoreSummary({ runId }: { runId: string }) {
  const [scores, setScores] = useState<ScoreSummary[]>([]);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/runs/${runId}/score/distribution`);
      const { data } = await resp.json();
      setScores(data.scores);
      setMessages(data.messages);
    })();
  }, [runId]);
  return {
    scores,
    messages,
  };
}
