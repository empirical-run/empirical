import { Button } from "./ui/button";
import { TriangleRightIcon } from "@radix-ui/react-icons";

export default function EmptySampleCompletion({
  onClickFetchCompletion,
  loading,
}: {
  onClickFetchCompletion: () => void;
  loading: boolean;
}) {
  return (
    <section className=" flex justify-center h-full w-full pt-4">
      <section className=" flex flex-col items-center space-y-1">
        {!loading && (
          <>
            <Button
              variant={"secondary"}
              size={"xs"}
              className=" flex flex-row w-fit mb-2 pl-1"
              onClick={onClickFetchCompletion}
            >
              <TriangleRightIcon width={18} height={18} />
              <span>Run</span>
            </Button>
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
