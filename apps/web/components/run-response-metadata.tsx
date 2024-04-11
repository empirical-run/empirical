import { Separator } from "./ui/separator";

export const RunSampleOutputMetric = ({
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
      {!hideSeparator && <Separator orientation="vertical" className="h-3" />}
      <p className="text-xs text-muted-foreground font-medium">
        {title}: {value}
      </p>
    </>
  );
};
