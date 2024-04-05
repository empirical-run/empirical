import { Button } from "./ui/button";
import CodeViewer from "./ui/code-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RunConfig } from "@empiricalrun/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { TriangleRightIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";

export const RunDetails = ({
  onClose,
  runId,
  runConfig,
  onClickRun,
}: {
  onClickRun?: (runConfig: RunConfig) => void;
  runId?: string;
  onClose?: () => void;
  runConfig: RunConfig;
}) => {
  if (!runConfig) {
    return null;
  }
  const [runConfigState, setRunConfigState] = useState<RunConfig | undefined>();
  useEffect(() => setRunConfigState(runConfig), [runConfig]);
  const updatePrompt = useCallback(
    (prompt: string | undefined = "") => {
      if (runConfigState && runConfigState.type === "model") {
        setRunConfigState({
          ...runConfigState,
          prompt,
        });
      }
    },
    [runConfigState],
  );
  const updateParameters = useCallback(
    (parametersStr: string | undefined = "") => {
      if (runConfigState) {
        setRunConfigState({
          ...runConfigState,
          parameters: JSON.parse(parametersStr),
        });
      }
    },
    [runConfigState],
  );
  const onClickRunCallback = useCallback(() => {
    if (onClickRun && runConfigState) {
      onClickRun(runConfigState);
    }
  }, [runConfigState]);

  return (
    <Card className="my-4 rounded-md">
      <CardHeader className="flex flex-row w-full justify-between pb-0">
        <div className="flex flex-col">
          <CardTitle className="flex flex-row space-x-1 items-center">
            <span>{runConfig.name}</span>
            <Badge
              variant={"secondary"}
              className=" text-xs text-muted-foreground whitespace-nowrap"
            >
              #{runId}
            </Badge>
          </CardTitle>
        </div>
        <div className="flex flex-row mt-0 gap-2">
          <Button
            variant={"default"}
            size={"sm"}
            className="pl-1"
            onClick={onClickRunCallback}
          >
            <TriangleRightIcon width={20} height={20} />
            <span>Run</span>
          </Button>
          <Button variant={"outline"} size={"sm"} onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompt">
          <TabsList className="w-fit mb-4 rounded-sm">
            {runConfig.type === "model" && (
              <TabsTrigger value="prompt" className="text-xs rounded-sm">
                Prompt template
              </TabsTrigger>
            )}
            <TabsTrigger value="parameters" className="text-xs rounded-sm">
              Parameters
            </TabsTrigger>
          </TabsList>
          {runConfig.type === "model" && (
            <TabsContent value="prompt">
              <CodeViewer
                value={runConfig.prompt as string}
                language="prompt"
                onChange={updatePrompt}
              />
            </TabsContent>
          )}
          <TabsContent value="parameters">
            <CodeViewer
              value={JSON.stringify(runConfig.parameters || "", null, 2)}
              language="json"
              onChange={updateParameters}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
