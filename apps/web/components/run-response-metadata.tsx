import { Separator } from "./ui/separator";

export const RunResponseMetadata = ({
  title,
  value,
  hideSeparator = false,
}: {
  title: string;
  value?: number | string;
  hideSeparator?: boolean;
}) => {
  if (!value) {
    return;
  }
  return (
    <>
      {!hideSeparator && <Separator orientation="vertical" className="h-6" />}
      <p className="text-sm text-muted-foreground">
        {title}: {value}
      </p>
    </>
  );
};
