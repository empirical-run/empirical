import { MoreInfo } from "./ui/more-info";
import { cn } from "./ui/lib";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { RunResult } from "../types";
import { BarLoader } from "react-spinners";
import ScoreBadge from "./ui/score-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScoreSummary } from "./score-summary";
import { RunSampleOutputMetric } from "./run-response-metadata";

export type Header = {
  title: string;
  description?: string;
  runResult?: RunResult;
  type: "input" | "expected" | "completion";
  active?: boolean;
  evals?: string[];
};

function StaticHeader({
  title = "",
  description = "",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      className={`flex-1 flex flex-col rounded-none justify-center relative border-r min-w-[500px] last:border-none bg-zinc-900`}
    >
      <section className="flex flex-col">
        <section className="flex flex-row my-3 justify-center">
          <h3 className="text-muted-foreground font-bold text-xs uppercase gap-2 flex flex-1 w-full items-center justify-center">
            <span>{title}</span>
            {description && <MoreInfo info={description} />}
          </h3>
        </section>
      </section>
    </div>
  );
}

function ModelTitle({
  model,
  className,
}: {
  model?: string;
  className?: string;
}) {
  if (!model) {
    return null;
  }
  return (
    <>
      <span className={`${cn("mr-1", className)}`}>{model}</span>
    </>
  );
}

export const RunColumnHeaders = ({
  showPrompt,
  headers,
  onClickAddRun,
  onClickRemoveRun,
  datasetSampleCount,
}: {
  onClickRemoveRun?: (runResult: RunResult) => void;
  showPrompt?: (runResult: RunResult) => void;
  onClickAddRun?: (runResult: RunResult) => void; // TODO: whether to keep the interface name as run completion?
  headers: Header[];
  datasetSampleCount: number;
}) => {
  return headers.map((header, index) => {
    if (header.type !== "completion") {
      return (
        <StaticHeader
          title={header.title}
          description={header.description}
          key={`header-${index}`}
        />
      );
    }
    const isActive = !!header.active;
    const overlayBg = isActive ? "bg-zinc-900" : "";
    const averageLatency =
      header.runResult?.stats?.latency?.average &&
      header.runResult?.stats?.latency.average.toFixed(0);
    const averageTokens =
      header.runResult?.stats?.tokens_used?.average &&
      header.runResult?.stats?.tokens_used.average.toFixed(0);
    return (
      <div
        key={`header-${index}`}
        className={`flex-1 flex flex-col rounded-none justify-center relative ${
          isActive ? "bg-muted" : "bg-zinc-900"
        } border-r min-w-[500px] last:border-none`}
      >
        <section className="flex flex-col">
          <section className="flex flex-row my-2 mx-4 justify-center">
            <section className=" font-semibold text-sm flex flex-1 w-full items-center">
              <ModelTitle
                model={header.runResult?.run_config.name}
                className="text-muted-foreground"
              />
            </section>
            <Button
              variant={"secondary"}
              onClick={() => showPrompt?.(header.runResult!)}
              className="self-center"
              size={"xs"}
            >
              <span>{header.active ? "Hide" : "Show"} config</span>
            </Button>
            <section className=" flex flex-row gap-2">
              <section className="flex flex-row gap-0 items-center">
                <Button
                  variant={"link"}
                  size={"sm"}
                  className="px-1"
                  onClick={() => onClickRemoveRun?.(header.runResult!)}
                >
                  <MinusCircledIcon />
                </Button>
                <Button
                  variant={"link"}
                  size={"sm"}
                  className="px-1"
                  onClick={() => onClickAddRun?.(header.runResult!)}
                >
                  <PlusCircledIcon />
                </Button>
              </section>
            </section>
          </section>

          {header.runResult?.stats?.scores &&
            header.runResult?.stats?.scores.length > 0 && (
              <>
                <Separator
                  orientation="horizontal"
                  className={`${overlayBg}`}
                />
                <section className="flex flex-row space-x-2 text-muted-foreground items-center mx-4 my-2">
                  <section className="flex flex-row flex-1 text-xs gap-2 items-center flex-wrap">
                    {(header.runResult?.stats?.scores || []).map((s) => (
                      <>
                        <section className="flex flex-row gap-1 items-center">
                          <ScoreBadge title={s.name} score={s.average} />
                        </section>
                      </>
                    ))}
                  </section>
                  <section className=" flex flex-row text-xs gap-1 items-center">
                    {(header.runResult?.stats?.scores || []).length > 0 && (
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant={"secondary"} size={"xs"}>
                            Show summary
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[500px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle>Scores summary</SheetTitle>
                          </SheetHeader>
                          <div className="py-4 h-full overflow-scroll">
                            <ScoreSummary
                              runId={header.runResult.id}
                              stats={header.runResult.stats}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </section>
                </section>
              </>
            )}

          {(averageLatency || averageTokens) && (
            <>
              <Separator orientation="horizontal" className={`${overlayBg}`} />
              <section className="flex flex-row space-x-2 text-muted-foreground items-center mx-4 my-2">
                <section className="flex flex-row flex-1 text-xs gap-2 items-center">
                  {averageTokens && (
                    <RunSampleOutputMetric
                      title="Average tokens"
                      value={averageTokens}
                      hideSeparator
                    />
                  )}
                  {averageLatency && (
                    <RunSampleOutputMetric
                      title="Average latency"
                      value={`${averageLatency}ms`}
                      hideSeparator={!averageTokens}
                    />
                  )}
                </section>
              </section>
            </>
          )}

          {header.runResult?.loading && (
            <>
              <Separator orientation="horizontal" className={`${overlayBg}`} />
              <section className="flex flex-row space-x-2 text-muted-foreground items-center mx-4 my-2 justify-center">
                <section className="flex flex-col text-xs gap-1 items-center">
                  <>
                    {datasetSampleCount >
                      (header.runResult?.samples.length || 0) && (
                      <p>
                        {header.runResult?.samples.length} /{" "}
                        {datasetSampleCount} outputs fetched
                      </p>
                    )}
                    {datasetSampleCount ===
                      (header.runResult?.samples.length || 0) && (
                      <p>Scoring outputs</p>
                    )}
                    <BarLoader color="#a1a1aa" width={40} height={2} />
                  </>
                </section>
              </section>
            </>
          )}
        </section>
      </div>
    );
  });
};
