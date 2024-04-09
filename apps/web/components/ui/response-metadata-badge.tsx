import { Badge } from "./badge";

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
    <Badge
      variant={"secondary"}
      className="text-xs cursor-default hover:bg-secondary"
    >
      {title}: {value}
    </Badge>
  );
};
