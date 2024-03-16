import { useCallback, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import CodeViewer from "./ui/code-viewer";
import { DatasetSample, DatasetSampleInput } from "@empiricalrun/types";
import {
  ArrowTopRightIcon,
  MinusCircledIcon,
  PlusCircledIcon,
  TriangleRightIcon,
} from "@radix-ui/react-icons";
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
  mode = "view",
  onSampleInputUpdate,
  onSampleRemove,
  onSampleAdd,
  hasMissingCompletion = false,
  onClickRunOnAllModels,
  inputTabs,
  onClickEditPrompt,
}: {
  sample: DatasetSample;
  mode?: "edit" | "view";
  onSampleInputUpdate?: (
    sampleId: string,
    sampleInput: DatasetSampleInput,
  ) => void;
  onSampleRemove?: (sample: DatasetSample) => void;
  onSampleAdd?: (sample: DatasetSample) => void;
  hasMissingCompletion?: boolean;
  onClickRunOnAllModels?: (sample: DatasetSample) => void;
  inputTabs?: string[];
  onClickEditPrompt?: () => void;
}) {
  const [inputEdited, setInputEdited] = useState(false);
  const tabs = useMemo(
    () => inputTabs || sample?.inputs.map((i) => i.name) || [],
    [sample, inputTabs],
  );
  const { activeTab, onChangeTab } = useSyncedTabs(tabs);

  const showRunOnAllModels = useMemo(
    () => inputEdited || hasMissingCompletion,
    [hasMissingCompletion, inputEdited],
  );

  const onClickRunAll = useCallback(() => {
    setInputEdited(false);
    onClickRunOnAllModels?.(sample);
  }, [onClickRunOnAllModels, sample]);

  const activeInput = useMemo(() => {
    if (activeTab && sample?.inputs) {
      return sample.inputs.filter((i) => i.name === activeTab)[0];
    }
    return undefined;
  }, [activeTab, sample.inputs]);

  const isEditMode = useMemo(() => mode === "edit", [mode]);

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
                      value={activeInput.value}
                      readOnly={mode === "view"}
                      onChange={(value) => {
                        setInputEdited(true);
                        onSampleInputUpdate?.(sample.id, {
                          ...activeInput,
                          value: value || "",
                        });
                      }}
                      scrollable
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {showRunOnAllModels && (
              <Button
                variant={"secondary"}
                size={"xs"}
                className="flex flex-row pl-1"
                onClick={onClickRunAll}
              >
                <TriangleRightIcon width={18} height={18} />
                <span>Run all</span>
              </Button>
            )}
            {isEditMode && onSampleAdd && (
              <Button
                variant={"link"}
                size={"xs"}
                onClick={() => onSampleAdd?.(sample)}
                className=" self-end justify-end p-0"
              >
                <PlusCircledIcon />
              </Button>
            )}
            {isEditMode && onSampleRemove && (
              <Button
                variant={"link"}
                size={"xs"}
                onClick={() => onSampleRemove?.(sample)}
                className=" self-end justify-end p-0"
              >
                <MinusCircledIcon />
              </Button>
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
              return (
                <TabsContent
                  key={input.name}
                  value={input.name}
                  // 2.25rem as the height of the tabs is h-9 by default. change this if tab height changes
                  className="h-[calc(100%-3rem)]"
                >
                  <CodeViewer
                    value={input.value}
                    language="text"
                    readOnly={mode === "view"}
                    onChange={(value) => {
                      setInputEdited(true);
                      onSampleInputUpdate?.(sample.id, {
                        ...input,
                        value: value || "",
                      });
                    }}
                    scrollable
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        )}
        {!sample?.inputs?.length && (
          <ZeroStateSampleCard onClickCTA={onClickEditPrompt} />
        )}
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
