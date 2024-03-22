import { Separator } from "./ui/separator";
import { MoreInfo } from "./ui/more-info";
import { Badge } from "./ui/badge";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { cn } from "./ui/lib";
import { Button } from "./ui/button";
import { RunCompletion } from "@empiricalrun/types";

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
}: {
  showPrompt?: (runResult: RunCompletion) => void;
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
          </section>

          {header.runResult?.run_config.type === "model" && (
            <>
              <Separator orientation="horizontal" className={`${overlayBg}`} />
              <section className="flex flex-row space-x-2 text-muted-foreground items-center justify-center ml-2">
                <Button
                  variant={"link"}
                  onClick={() => showPrompt?.(header.runResult!)}
                  className="p-0 h-6"
                  size={"sm"}
                >
                  <span>View Prompt</span>
                  <ArrowTopRightIcon />
                </Button>
              </section>
            </>
          )}
        </section>
      </div>
    );
  });
};
