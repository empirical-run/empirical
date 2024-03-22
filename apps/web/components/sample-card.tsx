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
    () => inputTabs || sample?.inputs.map((i) => i.name) || [],
    [sample, inputTabs],
  );
  const { activeTab, onChangeTab } = useSyncedTabs(tabs);
  const activeInput = useMemo(() => {
    if (activeTab && sample?.inputs) {
      return sample.inputs.filter((i) => i.name === activeTab)[0];
    }
    return undefined;
  }, [activeTab, sample.inputs]);

  return (
    <Card
      className={`flex flex-1 flex-col rounded-md items-stretch border-zinc-900`}
    >
      <CardContent className="flex flex-col flex-1 p-2 mt-2 pb-0 items-stretch relative">
        <div className="flex flex-row space-x-2 justify-end absolute right-4 top-4">
          <>
            {activeInput && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="right-5 top-0 z-10 capitalize text-xs"
                    size={"xs"}
                  >
                    Expand
                    <ArrowTopRightIcon height={12} width={12} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>{activeInput.name}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 h-full">
                    <CodeViewer
                      value={
                        typeof activeInput.value === "string"
                          ? activeInput.value
                          : JSON.stringify(activeInput.value, null, 2)
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
        {sample?.inputs?.length > 0 && (
          <Tabs
            value={activeTab}
            className="h-full"
            onValueChange={onChangeTab}
          >
            <TabsList className=" rounded-sm">
              {sample?.inputs.map((input) => (
                <TabsTrigger
                  key={input.name}
                  value={input.name}
                  className="text-xs rounded-sm"
                >
                  {input.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {sample?.inputs.map((input) => {
              console.log(input.name);
              console.log(input.value);
              return (
                <TabsContent
                  key={input.name}
                  value={input.name}
                  // 2.25rem as the height of the tabs is h-9 by default. change this if tab height changes
                  className="h-[calc(100%-3rem)]"
                >
                  <CodeViewer
                    value={
                      typeof input.value === "string"
                        ? input.value
                        : JSON.stringify(input.value, null, 2)
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
        {!sample?.inputs?.length && <ZeroStateSampleCard />}
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
