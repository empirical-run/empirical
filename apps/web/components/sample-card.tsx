import { useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import CodeViewer from "./ui/code-viewer";
import { DatasetSample } from "@empiricalrun/types";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import ZeroStateSampleCard from "./zero-state-sample-card";
import { useSyncedTabs } from "../hooks/useSyncedTab";

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
                <SheetContent className="w-[400px] sm:w-[540px]">
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
        {Object.keys(sample?.inputs || {}).length > 0 && (
          <Tabs
            value={activeTab}
            className="h-full"
            onValueChange={onChangeTab}
          >
            <TabsList className=" rounded-sm">
              {Object.keys(sample?.inputs || {}).map((name) => (
                <TabsTrigger
                  key={name}
                  value={name}
                  className="text-xs rounded-sm"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(sample?.inputs || {}).map((el) => {
              const [key, value] = el;
              return (
                <TabsContent
                  key={key}
                  value={key}
                  // 2.25rem as the height of the tabs is h-9 by default. change this if tab height changes
                  className="h-[calc(100%-3rem)]"
                >
                  <CodeViewer
                    value={
                      typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)
                    }
                    language="json"
                    readOnly
                    scrollable
                  />
                </TabsContent>
              );
            })}
          </Tabs>
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
