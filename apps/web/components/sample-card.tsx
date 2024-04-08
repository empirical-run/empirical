import { useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import CodeViewer from "./ui/code-viewer";
import { DatasetSample } from "@empiricalrun/types";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import ZeroStateSampleCard from "./zero-state-sample-card";
import { useSyncedTabs } from "../hooks/useSyncedTab";
import { SelectGroup } from "@radix-ui/react-select";

export default function SampleCard({
  sample,
  inputTabs,
}: {
  sample: DatasetSample;
  inputTabs?: string[];
}) {
  const tabs = useMemo(
    () => inputTabs || Object.keys(sample?.inputs || {}),
    [sample, inputTabs],
  );
  const { activeTab, onChangeTab } = useSyncedTabs(tabs);
  const activeInputValue = useMemo(() => {
    if (activeTab && sample?.inputs) {
      return sample.inputs[activeTab];
    }
    return undefined;
  }, [activeTab, sample.inputs]);
  return (
    <Card
      className={`flex flex-1 flex-col rounded-md items-stretch border-zinc-900`}
    >
      <CardContent className="flex flex-col flex-1 p-2 pb-0 items-stretch relative">
        <div className="flex flex-row space-x-2 justify-end absolute right-4 top-4">
          <>
            {activeInputValue && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="right-2 top-0 z-10 capitalize text-xs"
                    size={"xs"}
                  >
                    Expand
                    <ArrowTopRightIcon height={12} width={12} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[700px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>{activeTab}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 h-full">
                    <CodeViewer
                      value={
                        typeof activeInputValue === "string"
                          ? activeInputValue
                          : JSON.stringify(activeInputValue, null, 2)
                      }
                      readOnly
                      scrollable
                      language="json"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        </div>
        {Object.keys(sample?.inputs || {}).length > 0 && activeTab && (
          <Select value={activeTab} onValueChange={onChangeTab}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Select parameter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.keys(sample?.inputs || {}).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
            <div className="mt-2">
              <CodeViewer
                value={(() => {
                  const inputValue = sample?.inputs[activeTab];
                  return typeof inputValue === "string"
                    ? inputValue!
                    : JSON.stringify(inputValue, null, 2);
                })()}
                language="json"
                readOnly
                scrollable
              />
            </div>
          </Select>
        )}
        {!Object.keys(sample?.inputs).length && <ZeroStateSampleCard />}
      </CardContent>
      {/* {(sample?.annotations || []).length > 0 && (
        <CardFooter className="px-2 mt-4 flex flex-col flex-wrap items-start gap-4">
          <BadgeList
            badges={(sample.annotations || []).map((a) => {
              const mappedData = { ...a };
              mappedData.name =
                runResultFilterNameMap.get(mappedData.name) || mappedData.name;
              return mappedData;
            })}
          />
        </CardFooter>
      )} */}
    </Card>
  );
}
