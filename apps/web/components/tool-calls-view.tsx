import { ChatCompletionMessageToolCall } from "@empiricalrun/types";
import CodeViewer from "./ui/code-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ToolCalls({
  toolCalls,
}: {
  toolCalls: ChatCompletionMessageToolCall[] | undefined;
}) {
  if (!toolCalls) {
    return null;
  }
  if (toolCalls.length === 0) {
    return null;
  }
  const tabs = toolCalls.filter((t) => t.type === "function");
  return (
    <>
      <Tabs defaultValue={tabs[0]?.id} className="h-full">
        <TabsList className=" rounded-sm w-full overflow-x-scroll justify-start no-scrollbar">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs rounded-sm"
            >
              {tab.function.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            // 2.25rem as the height of the tabs is h-9 by default. change this if tab height changes
            className="h-[calc(100%-3rem)]"
          >
            <CodeViewer
              value={JSON.stringify(
                JSON.parse(tab.function.arguments),
                null,
                2,
              )}
              language="text"
              readOnly
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
