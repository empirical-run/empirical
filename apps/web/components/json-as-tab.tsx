import { useCallback, useEffect, useMemo, useState } from "react";
import { useSyncedTabs } from "../hooks/useSyncedTab";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  TriangleRightIcon,
  PlusCircledIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import CodeViewer from "./ui/code-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function JsonAsTab({
  storeKey = "",
  data,
  defaultTabs,
  showRunButton,
  onSampleAdd,
  onSampleRemove,
  onEditorContentUpdate,
  onClickRunAll,
}: {
  storeKey: string;
  data: { [key: string]: any };
  defaultTabs?: string[];
  showRunButton?: boolean;
  onSampleAdd?: () => void;
  onSampleRemove?: () => void;
  onEditorContentUpdate?: (key: string, value: string) => void;
  onClickRunAll?: () => void;
}) {
  const tabs = useMemo(
    () => defaultTabs || Object.keys(data),
    [data, defaultTabs],
  );
  const { activeTab: remoteActiveTab, onChangeTab: remoteOnChangeTab } =
    useSyncedTabs(tabs, storeKey);
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const activeTabValue = useMemo(() => {
    if (activeTab && data) {
      return data[activeTab];
    }
    return undefined;
  }, [activeTab, data]);

  useEffect(() => {
    if (remoteActiveTab && data[remoteActiveTab]) {
      setActiveTab(remoteActiveTab);
    } else if (!activeTab) {
      setActiveTab(Object.keys(data)[0]);
    }
  }, [remoteActiveTab]);

  const onChangeTab = useCallback(
    (tab: string) => {
      console.log(tab);
      setActiveTab(tab);
      remoteOnChangeTab(tab);
    },
    [remoteOnChangeTab],
  );

  return (
    <>
      <div className="flex flex-row space-x-2 justify-end">
        <>
          {activeTabValue && (
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
                      typeof activeTabValue === "string"
                        ? activeTabValue
                        : JSON.stringify(activeTabValue, null, 2)
                    }
                    readOnly // expand sheet is readonly
                    scrollable
                    language="json"
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
          {onClickRunAll && showRunButton && (
            <Button
              variant={"secondary"}
              size={"xs"}
              className="flex flex-row pl-1"
              onClick={onClickRunAll}
            >
              <TriangleRightIcon width={18} height={18} />
              <span>Run this row</span>
            </Button>
          )}
          {onSampleAdd && (
            <Button
              variant={"link"}
              size={"xs"}
              onClick={() => onSampleAdd()}
              className=" self-end justify-end p-0"
            >
              <PlusCircledIcon />
            </Button>
          )}
          {onSampleRemove && (
            <Button
              variant={"link"}
              size={"xs"}
              onClick={() => onSampleRemove()}
              className=" self-end justify-end p-0"
            >
              <MinusCircledIcon />
            </Button>
          )}
        </>
      </div>
      {tabs.length > 0 && (
        <Tabs
          value={activeTab}
          defaultValue={activeTab}
          className="h-full"
          onValueChange={onChangeTab}
        >
          <TabsList className=" rounded-sm w-full overflow-x-scroll justify-start no-scrollbar">
            {tabs.map((name) => (
              <TabsTrigger
                key={name}
                value={name}
                className="text-xs rounded-sm"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(data || {}).map((el) => {
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
                  language="text"
                  readOnly={false}
                  scrollable
                  onChange={(value) => onEditorContentUpdate?.(key, value!)}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </>
  );
}
