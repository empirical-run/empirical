import { Card, CardContent } from "./ui/card";
import { DatasetSample } from "@empiricalrun/types";
import ZeroStateSampleCard from "./zero-state-sample-card";
import { JsonAsTab } from "./json-as-tab";

export default function SampleCard({
  sample,
  inputTabs,
}: {
  sample: DatasetSample;
  inputTabs?: string[];
}) {
  return (
    <Card
      className={`flex flex-1 flex-col rounded-md items-stretch border-zinc-900`}
    >
      <CardContent className="flex flex-col flex-1 p-2 pb-0 items-stretch relative">
        <JsonAsTab
          storeKey="input"
          data={sample?.inputs}
          defaultTabs={inputTabs}
        />
        {!Object.keys(sample?.inputs).length && <ZeroStateSampleCard />}
      </CardContent>
    </Card>
  );
}
