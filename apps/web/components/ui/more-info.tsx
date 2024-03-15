import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export function MoreInfo({ info }: { info: string | undefined }) {
  if (!info) {
    return null;
  }
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <QuestionMarkCircledIcon height={12} width={12} />
        </TooltipTrigger>
        <TooltipContent className=" max-w-xs">{info}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
