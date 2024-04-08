import { useMemo } from "react";
import { useSyncedTabs } from "../hooks/useSyncedTab";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import CodeViewer from "./ui/code-viewer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function JsonAsTab({
  storeKey = "",
  data,
  defaultTabs,
}: {
  storeKey: string;
  data: { [key: string]: any };
  defaultTabs?: string[];
}) {
  const tabs = useMemo(
    () => defaultTabs || Object.keys(data),
    [data, defaultTabs],
  );
  const { activeTab, onChangeTab } = useSyncedTabs(tabs, storeKey);
  const activeTabValue = useMemo(() => {
    if (activeTab && data) {
      return data[activeTab];
    }
    return undefined;
  }, [activeTab, data]);
  return (
    <>
      <div className="flex flex-row space-x-2 justify-end absolute right-4 top-4">
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
      {Object.keys(data || {}).length > 0 && activeTab && (
        <Select value={activeTab} onValueChange={onChangeTab}>
          <SelectTrigger className="w-fit border-none">
            <SelectValue placeholder="Select parameter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(data || {}).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
          <div className="mt-2">
            <CodeViewer
              value={(() => {
                const value = data[activeTab];
                return typeof value === "string"
                  ? value!
                  : JSON.stringify(value, null, 2);
              })()}
              language="json"
              readOnly
              scrollable
            />
          </div>
        </Select>
      )}
    </>
  );
}
