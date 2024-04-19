import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Link1Icon, Share2Icon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useCallback, useState } from "react";
import InlineLoader from "./ui/inline-loader";
import { usePlaygroundLinks } from "../hooks/usePlaygroundLinks";
import { Dataset } from "@empiricalrun/types";
import { RunResult } from "../types";

export default function SharePlaygroundButton({
  dataset,
  runs,
}: {
  dataset: Dataset;
  runs: RunResult[];
}) {
  const { savePlaygroundLink } = usePlaygroundLinks();
  const [linkCreationPending, setLinkCreationPending] =
    useState<boolean>(false);
  const [link, setLink] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const onClickShare = useCallback(async () => {
    setLinkCreationPending(true);
    const resp = await savePlaygroundLink({
      data: { dataset, runs },
    });
    if (resp.success) {
      setLinkCreationPending(false);
      setLink(`https://www.empirical.run/playground/${resp.data.id}`);
    }
  }, [dataset, runs, savePlaygroundLink]);

  const onCopyLink = useCallback(() => {
    navigator.clipboard.writeText(link || "");
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1500);
  }, [link]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          onClick={onClickShare}
          variant={"secondary"}
          size={"xs"}
          className=" md:flex md:flex-row space-x-1 hidden px-2"
        >
          <Share2Icon height={14} width={14} />
          <span>Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share playground</h4>
            <p className="text-xs text-muted-foreground">
              Anyone with the link will be able to view the current state of the
              playground in read-only mode. Further changes won&apos;t be
              shared.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip open={showTooltip}>
              <TooltipTrigger>
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="gap-2 w-full"
                  disabled={linkCreationPending}
                  onClick={onCopyLink}
                >
                  {linkCreationPending && <InlineLoader />}
                  {!linkCreationPending && (
                    <>
                      <span>Copy Link</span>
                      <Link1Icon />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link copied to clipboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}
