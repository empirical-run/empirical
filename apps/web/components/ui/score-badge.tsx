import { Badge } from "./badge";

const colorMap: { [key: number]: { border: string; bg: string } } = {
  0: {
    border: "border-red-800",
    bg: "bg-red-950",
  },
  1: {
    border: "border-red-800",
    bg: "bg-red-950",
  },
  2: {
    border: "border-orange-800",
    bg: "bg-orange-950",
  },
  3: {
    border: "border-orange-800",
    bg: "bg-orange-950",
  },
  4: {
    border: "border-amber-800",
    bg: "bg-amber-950",
  },
  5: {
    border: "border-amber-800",
    bg: "bg-amber-950",
  },
  6: {
    border: "border-yellow-800",
    bg: "bg-yellow-950",
  },
  7: {
    border: "border-yellow-800",
    bg: "bg-yellow-950",
  },
  8: {
    border: "border-lime-800",
    bg: "bg-lime-950",
  },
  9: {
    border: "border-green-800",
    bg: "bg-green-950",
  },
  10: {
    border: "border-emerald-800",
    bg: "bg-emerald-950",
  },
};

export default function ScoreBadge({
  title,
  score,
  className,
}: {
  title: string;
  score: number;
  className?: string;
}) {
  if (score === undefined) {
    return null;
  }
  const color = colorMap[Math.floor(score * 10)];

  return (
    <Badge
      variant={"outline"}
      className={`${className} text-xs ${color?.border} ${color?.bg} gap-1 whitespace-nowrap h-fit`}
    >
      {title} {`${(score * 100).toFixed(0)}%`}
    </Badge>
  );
}
