import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function SampleCompletionError({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <section className="flex justify-center h-full w-full">
      <section className="flex flex-col items-center space-y-1 text-destructive">
        <ExclamationTriangleIcon height={20} width={20} />
        <p className="text-center text-sm w-3/5 font-medium">{errorMessage}</p>
      </section>
    </section>
  );
}
