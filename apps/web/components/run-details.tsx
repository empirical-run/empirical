import { Button } from "./ui/button";
import CodeViewer from "./ui/code-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RunCompletion } from "@empiricalrun/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

export const RunDetails = ({
  onClose,
  runResult,
}: {
  onClose?: () => void;
  runResult: RunCompletion;
}) => {
  if (!runResult) {
    return null;
  }

  return (
    <Card className="my-4 rounded-md">
      <CardHeader className="flex flex-row w-full justify-between pb-0">
        <div className="flex flex-col">
          <CardTitle className="flex flex-row space-x-1 items-center">
            <span>{runResult.model}</span>
            <Badge
              variant={"secondary"}
              className=" text-xs text-muted-foreground whitespace-nowrap"
            >
              Run #{runResult.id}
            </Badge>
          </CardTitle>
        </div>
        <div className="flex flex-row mt-0 gap-2">
          <Button variant={"outline"} size={"sm"} onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompt">
          <TabsList className="w-fit mb-4 rounded-sm">
            <TabsTrigger value="prompt" className="text-xs rounded-sm">
              Prompt template
            </TabsTrigger>
          </TabsList>
          <TabsContent value="prompt">
            <CodeViewer
              value={runResult.prompt as string}
              language="prompt"
              readOnly
            />
          </TabsContent>
          <TabsContent value="configuration" />
          <TabsContent value="tools" />
        </Tabs>
      </CardContent>
    </Card>
  );
};
