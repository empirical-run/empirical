import { Badge } from "./badge";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./tooltip";

export const ResponseMetadataBadge = ({
  title,
  value,
}: {
  title: string;
  value?: number | string;
}) => {
  if (!value) {
    return;
  }
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger>
          <Badge variant={"secondary"} className="text-xs">
            {title}: {value}
          </Badge>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
