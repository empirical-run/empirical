export default function EmptySampleCompletion({
  loading,
}: {
  loading: boolean;
}) {
  return (
    <section className=" flex justify-center h-full w-full pt-8">
      <section className=" flex flex-col items-center space-y-1">
        {!loading && (
          <>
            <p className=" text-xs text-muted-foreground font-bold">
              No completion for this prompt
            </p>
            <p className=" text-xs text-muted-foreground">
              Click &rdquo;run&rdquo; to see completion
            </p>
          </>
        )}
        {loading && (
          <p className=" text-xs text-muted-foreground font-bold">Loading...</p>
        )}
      </section>
    </section>
  );
}
