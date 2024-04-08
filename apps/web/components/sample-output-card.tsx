import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import CodeViewer from "./ui/code-viewer";
import {
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { RunCompletion, RunOutputSample } from "@empiricalrun/types";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import EmptySampleCompletion from "./empty-sample-completion";

import ScoreBadge from "./ui/score-badge";
import SampleCompletionError from "./sample-completion-error";
import { Separator } from "./ui/separator";
import { JsonAsTab } from "./json-as-tab";

type Diff = {
  type: string;
  text: string;
  enabled: boolean;
};

export default function SampleOutputCard({
  baseResult,
  baseSample,
  comparisonResults,
  comparisonSamples,
  isActiveColumn = false,
  onFetchCompletion,
  onClickCard = () => {},
}: {
  baseResult?: RunCompletion;
  baseSample?: RunOutputSample;
  comparisonSamples?: RunOutputSample[];
  comparisonResults?: RunCompletion[];
  isActiveColumn?: boolean;
  setSelections?: Dispatch<any>;
  onFetchCompletion?: (runResult: RunCompletion) => void;
  onClickCard?: () => void;
}) {
  const [diffView, setDiffView] = useState<Diff>({
    text: "",
    type: "",
    enabled: false,
  });

  const showCompareAgainst = useMemo(
    () =>
      baseSample?.expected?.value ||
      comparisonSamples?.some(
        (comparisonSample, index) =>
          comparisonSample?.output &&
          comparisonResults?.[index]?.id !== baseResult?.id,
      ),
    [
      baseResult?.id,
      baseSample?.expected?.value,
      comparisonResults,
      comparisonSamples,
    ],
  );

  const clearDiffView = useCallback(() => {
    setDiffView({
      type: "",
      text: "",
      enabled: false,
    });
  }, []);

  const enableDiffView = useCallback(
    ({ type, text }: { type: string; text: string }) => {
      setDiffView({
        type,
        text,
        enabled: true,
      });
    },
    [],
  );

  const handleDiffOnMount: DiffOnMount = useCallback((editor) => {
    editor.updateOptions({
      readOnly: true,
      cursorStyle: "block",
      renderLineHighlight: "none",
      lineNumbersMinChars: 3,
      renderSideBySide: true,
      autoIndent: "full",
      scrollBeyondLastLine: false,
      wordWrap: "on",
    });
  }, []);

  const onClickFetchCompletion = useCallback(
    () => onFetchCompletion?.(baseResult!),
    [baseResult, onFetchCompletion],
  );

  const containerWrapper = useRef<HTMLDivElement>(null);
  const showOutput = useMemo(
    () => baseSample && !diffView.enabled && !baseSample?.error,
    [baseSample, diffView],
  );

  useEffect(() => {
    clearDiffView();
  }, [baseResult?.id, clearDiffView]);

  const showOutputLoading = !baseSample || !baseSample?.output;
  return (
    <Card
      className={`flex flex-col flex-1 ${
        isActiveColumn
          ? "border-x border-muted rounded-none"
          : "border-zinc-900 rounded-md"
      }`}
      onClick={onClickCard}
    >
      <CardHeader className="p-2">
        {baseResult && baseSample && (
          <CardTitle className="flex flex-row space-x-2 items-center">
            <div className="flex flex-1 flex-row space-x-2 justify-end">
              {baseSample.scores?.map((s) => {
                if (!s) {
                  return null;
                }
                return (
                  <ScoreBadge
                    title={s.name}
                    score={s.score}
                    description={s.message}
                    className="flex flex-row space-x-1"
                  />
                );
              })}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <DotsVerticalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {showCompareAgainst ? (
                    <>
                      <DropdownMenuLabel className="text-xs">
                        Compare against
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={!diffView.enabled}
                        onCheckedChange={clearDiffView}
                      >
                        <span className="text-xs">none</span>
                      </DropdownMenuCheckboxItem>
                      {baseSample?.expected?.value && (
                        <DropdownMenuCheckboxItem
                          checked={
                            diffView.enabled && diffView.type === "expected"
                          }
                          onCheckedChange={() => {
                            enableDiffView({
                              type: "expected",
                              text: baseSample?.expected?.value || "",
                            });
                          }}
                        >
                          <span className="text-xs">expected</span>
                        </DropdownMenuCheckboxItem>
                      )}
                      {comparisonSamples?.map((s, i) => {
                        const result = comparisonResults?.[i];
                        if (result?.id === baseResult.id) {
                          return;
                        }
                        return (
                          <DropdownMenuCheckboxItem
                            key={`${baseResult.id}-${baseSample.id}-comparison-${i}`}
                            checked={
                              diffView.enabled && diffView.type === result?.id
                            }
                            onCheckedChange={() => {
                              enableDiffView({
                                type: result?.id || "",
                                text: s?.output.value || "",
                              });
                            }}
                          >
                            <span className="text-xs">
                              {result?.run_config.name}
                            </span>
                            <span className=" text-muted-foreground ml-2 font-light">
                              {" "}
                              #{result?.id}
                            </span>
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        )}
        {baseSample?.error && (
          <SampleCompletionError errorMessage={baseSample.error.message} />
        )}
        {showOutputLoading && (
          <EmptySampleCompletion
            onClickFetchCompletion={onClickFetchCompletion}
            loading={!!(baseSample && !baseSample?.output)}
          />
        )}
      </CardHeader>
      <CardContent
        className="flex flex-col h-full p-2 gap-4"
        ref={containerWrapper}
      >
        <section className="flex flex-col">
          <p className=" text-sm font-medium mb-2">Output</p>
          {diffView.enabled && baseSample && (
            <DiffEditor
              original={baseSample?.output.value || ""}
              modified={diffView.text}
              height={`${
                containerWrapper.current?.clientHeight
                  ? containerWrapper.current?.clientHeight - 24 // reduce the padding value
                  : 100
              }px`}
              language={"json"}
              onMount={handleDiffOnMount}
              theme="tomorrow-night-blue"
              width="100%"
              loading=""
            />
          )}
          {showOutput && (
            <CodeViewer
              value={baseSample?.output.value || ""}
              language="json"
              readOnly
            />
          )}
        </section>
        {!diffView.enabled && baseSample?.output.metadata && (
          <section className="flex flex-col h-[200px] mt-2">
            <Separator
              orientation="horizontal"
              className="w-[60%] self-center"
            />
            <p className=" text-sm font-medium mt-2 mb-2">Metadata</p>
            <section className="relative flex flex-col flex-1">
              <JsonAsTab
                storeKey={baseResult?.id!}
                data={baseSample?.output.metadata!}
              />
            </section>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
