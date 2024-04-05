import { BarLoader } from "react-spinners";

export default function EmptySampleCompletion({
  loading,
}: {
  loading: boolean;
}) {
  return (
    <section className="flex flex-row justify-center h-full w-full pt-8">
      <section className=" flex flex-col items-center space-y-1">
        {!loading && (
          <>
            <p className=" text-xs text-muted-foreground font-bold">
              No completion for this sample
            </p>
            <p className=" text-xs text-muted-foreground">
              Click &rdquo;run&rdquo; to see completion
            </p>
          </>
        )}
        {loading && <BarLoader color="#a1a1aa" width={80} height={4} />}
      </section>
    </section>
  );
}
