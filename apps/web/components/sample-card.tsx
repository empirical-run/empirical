import { Card, CardContent } from "./ui/card";
import { DatasetSample, DatasetSampleInputs } from "@empiricalrun/types";
import ZeroStateSampleCard from "./zero-state-sample-card";
import { JsonAsTab } from "./json-as-tab";

export default function SampleCard({
  sample,
  inputTabs,
  onSampleRemove,
  onSampleAdd,
  onSampleInputUpdate,
  onClickRunOnAllModels,
}: {
  sample: DatasetSample;
  inputTabs?: string[];
  onSampleRemove?: (sample: DatasetSample) => void;
  onSampleAdd?: (sample: DatasetSample) => void;
  onSampleInputUpdate?: (
    sampleId: string,
    newSampleInputs: DatasetSampleInputs,
  ) => void;
  onClickRunOnAllModels: (sample: DatasetSample) => void;
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
          onSampleAdd={() => onSampleAdd?.(sample)}
          onSampleRemove={() => onSampleRemove?.(sample)}
          onEditorContentUpdate={(key: string, value: string) =>
            onSampleInputUpdate?.(sample.id, {
              [key]: value,
            })
          }
          onClickRunAll={() => onClickRunOnAllModels?.(sample)}
        />
        {!Object.keys(sample?.inputs).length && <ZeroStateSampleCard />}
      </CardContent>
    </Card>
  );
}
