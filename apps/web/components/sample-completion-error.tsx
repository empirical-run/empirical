import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function SampleCompletionError({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <section className="flex justify-center h-full w-full">
      <section className="flex flex-col items-center space-y-1 text-muted-foreground">
        <ExclamationTriangleIcon height={22} width={22} />
        <p className="text-center text-sm w-3/5">{errorMessage}</p>
      </section>
    </section>
  );
}
