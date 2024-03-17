import { Badge } from "./badge";
import { Separator } from "./separator";

export type BadgeType = {
  name: string;
  value: string;
};

export default function BadgeList({ badges }: { badges: BadgeType[] }) {
  const badgeMap = badges.reduce((agg, b) => {
    if (agg.get(b.name)) {
      const data = agg.get(b.name);
      if (data) {
        data.value = `${data.value}, ${b.value}`;
      }
    } else {
      agg.set(b.name, { ...b });
    }
    return agg;
  }, new Map<string, BadgeType>());
  const combinedBadges = Array.from(badgeMap.values());
  return (
    <section className="flex flex-row flex-wrap items-start gap-1">
      {combinedBadges.map((b, i) => {
        return (
          <Badge
            key={`badge-${i}`}
            variant={"outline"}
            className="flex flex-row items-center space-x-2 border-cyan-950 bg-cyan-950 bg-opacity-30"
          >
            <span className=" text-xs text-cyan-800">{b.name}</span>
            <Separator orientation="vertical" className="bg-cyan-950 h-2" />
            <span className="text-xs text-cyan-600">{b.value}</span>
          </Badge>
        );
      })}
    </section>
  );
}
