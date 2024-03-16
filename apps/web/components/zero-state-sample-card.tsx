import { Button } from "./ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";

export default function ZeroStateSampleCard({
  text = "Edit prompt",
  onClickCTA,
}: {
  text?: string;
  onClickCTA?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {onClickCTA && (
        <Button
          variant={"secondary"}
          size={"xs"}
          className="flex flex-row w-fit mb-2 gap-1"
          onClick={onClickCTA}
        >
          <Pencil1Icon width={12} height={12} />
          <span>{text}</span>
        </Button>
      )}
      <div className="text-center text-xs text-muted-foreground">{`Add {{variable_name}} to your prompt to test different scenarios`}</div>
    </div>
  );
}
