import { Score } from "@empiricalrun/types";
import ScoreBadge from "./ui/score-badge";
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from "@radix-ui/react-icons";
import { useScoresView } from "../hooks/useScoresView";
import { Button } from "./ui/button";

export function Scores({ scores }: { scores: Score[] }) {
  const { setExpandState, expandState } = useScoresView();
  const scoresPresent = !!scores?.length;
  const showExpandViewOption = scoresPresent && scores.some((s) => !!s.message);
  return (
    <div className="flex flex-row flex-1 justify-start px-2 gap-2">
      <div
        className={`flex ${expandState ? "flex-col flex-1" : "flex-row"} justify-start gap-2`}
      >
        {scores?.map((s) => {
          if (!s) {
            return null;
          }
          return (
            <>
              <div className="flex flex-row space-x-2">
                <ScoreBadge title={s.name} score={s.score} />
                {expandState && (
                  <p className=" items-center text-xs text-muted-foreground font-normal self-center">
                    {s.message}
                  </p>
                )}
              </div>
            </>
          );
        })}
      </div>
      <div className=" flex flex-row items-center">
        {showExpandViewOption && (
          <Button
            onClick={() => {
              setExpandState(!expandState);
            }}
            variant={"outline"}
            size={"icon"}
          >
            {expandState && <DoubleArrowUpIcon height={12} width={12} />}
            {!expandState && <DoubleArrowDownIcon height={12} width={12} />}
          </Button>
        )}
      </div>
    </div>
  );
}
