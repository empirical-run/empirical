import { cn } from "./lib";
import InlineLoader from "./inline-loader";

export default function PageLoader({
  className = "",
  description = "",
}: {
  className?: string;
  description?: string;
}) {
  return (
    <section className={`${cn(className, "flex flex-row justify-center")}`}>
      <section className="flex flex-col gap-2 items-center">
        <InlineLoader />
        {description && (
          <span className="text-xs text-muted-foreground ">{description}</span>
        )}
      </section>
    </section>
  );
}
