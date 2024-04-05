import { MoreInfo } from "./ui/more-info";
import { Badge } from "./ui/badge";
import { cn } from "./ui/lib";
import { Button } from "./ui/button";
import { RunCompletion } from "@empiricalrun/types";
import ScoreBadge from "./ui/score-badge";
import { Separator } from "./ui/separator";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";

export type Header = {
  title: string;
  description?: string;
  runResult?: RunCompletion;
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
      className={`flex-1 flex flex-col rounded-none justify-center relative border-r min-w-[400px] last:border-none bg-zinc-900`}
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
}: {
  onClickRemoveRun?: (runResult: RunCompletion) => void;
  showPrompt?: (runResult: RunCompletion) => void;
  onClickAddRun?: (runResult: RunCompletion) => void; // TODO: whether to keep the interface name as run completion?
  headers: Header[];
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
    return (
      <div
        key={`header-${index}`}
        className={`flex-1 flex flex-col rounded-none justify-center relative ${
          isActive ? "bg-muted" : "bg-zinc-900"
        } border-r min-w-[400px] last:border-none`}
      >
        <section className="flex flex-col">
          <section className="flex flex-row my-2 mx-4 justify-center">
            <section className=" font-semibold text-sm flex flex-1 w-full items-center">
              <ModelTitle
                model={header.runResult?.run_config.name}
                className="text-muted-foreground"
              />
              <Badge
                variant={"secondary"}
                className="text-muted-foreground text-xs bg-transparent p-0 ml-1"
              >
                #{header.runResult?.id}
              </Badge>
            </section>
            <Button
              variant={"secondary"}
              onClick={() => showPrompt?.(header.runResult!)}
              className="self-end"
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
                <section className="flex flex-row space-x-2 text-muted-foreground items-center mx-4 my-2 justify-end">
                  <section className="flex flex-row text-xs gap-1 items-center">
                    {(header.runResult?.stats?.scores || []).map((s) => (
                      <>
                        <section className="flex flex-row gap-1 items-center">
                          <ScoreBadge title={s.name} score={s.avgScore} />
                        </section>
                      </>
                    ))}
                  </section>
                </section>
              </>
            )}
        </section>
      </div>
    );
  });
};
