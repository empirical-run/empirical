import {
  Editor,
  Monaco,
  OnChange,
  OnMount,
  useMonaco,
} from "@monaco-editor/react";
import React, { useCallback, useEffect, useRef } from "react";
import darkTheme from "monaco-themes/themes/Sunburst.json";

export type CustomAction = {
  id: string;
  label: string;
  run: () => void;
  keybindings: number[];
};

const isMonacoInitialised = false;

function initializeMonaco(monaco: Monaco) {
  if (isMonacoInitialised) {
    return;
  }

  monaco.editor.defineTheme("tomorrow-night-blue", {
    base: "vs-dark",
    inherit: darkTheme.inherit,
    rules: [...darkTheme.rules, { token: "delimiter", foreground: "ffa500" }],
    colors: darkTheme.colors,
  });
  monaco.editor.setTheme("tomorrow-night-blue");
  monaco.languages.register({
    id: "prompt",
  });
  monaco.languages.setMonarchTokensProvider("prompt", {
    tokenizer: {
      root: [[/\{{(\w+)\}}/, "delimiter"]],
    },
  });
}

export default function CodeViewer({
  value,
  language = "json",
  readOnly = false,
  onChange,
  customCommands,
  focus = false,
  scrollable = false,
  onMount = () => {},
  minHeightForScroll,
}: {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: OnChange;
  customCommands?: CustomAction[];
  focus?: boolean;
  scrollable?: boolean;
  onMount?: () => void;
  minHeightForScroll?: number;
}) {
  const monaco = useMonaco();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>();
  const actionReferences = useRef<any[]>([]);

  useEffect(() => {
    if (monaco) {
      initializeMonaco(monaco);
    }
  }, [monaco]);

  useEffect(() => () => editorRef.current?.dispose(), []);

  const bringEditorInFocus = useCallback(() => {
    if (editorRef.current) {
      const lineNumber = editorRef.current.getModel()
        ? editorRef.current.getModel()?.getLineCount() || 0
        : 0;
      editorRef.current.setPosition({
        lineNumber,
        column: editorRef.current.getModel()?.getLineMaxColumn(lineNumber) || 0,
      });
      if (focus) {
        editorRef.current?.focus();
      }
    }
  }, [focus]);

  const handleOnMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      editor.updateOptions({
        readOnly: readOnly,
        cursorStyle: "block",
        cursorBlinking: "blink",
        renderLineHighlight: "none",
        lineNumbersMinChars: 3,
        autoIndent: "full",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        minimap: {
          enabled: false,
        },
      });
      bringEditorInFocus();
      const updateHeight = () => {
        const element = editor.getDomNode();
        if (element) {
          const editorContentHeight = editor.getContentHeight();
          const contentHeight =
            editorContentHeight > 40 ? editorContentHeight : 40;

          if (scrollable && containerRef.current) {
            if (minHeightForScroll) {
              const height =
                editorContentHeight > minHeightForScroll
                  ? minHeightForScroll
                  : editorContentHeight;
              containerRef.current.style.height = height + "px";
              element.style.height = height + "px";
            } else {
              element.style.height = containerRef.current.clientHeight + "px";
            }
            return;
          }
          const newHeight = `${contentHeight}px`;
          if (element.style.height !== newHeight) {
            element.style.height = `${contentHeight}px`;
            if (containerRef.current) {
              containerRef.current.style.height = `${contentHeight}px`;
            }
            editor.layout();
          }
        }
      };
      editor.onDidContentSizeChange(updateHeight);
      onMount();
    },
    [bringEditorInFocus, readOnly, scrollable],
  );

  useEffect(() => {
    editorRef.current?.updateOptions({
      readOnly,
    });

    if (!readOnly && editorRef.current) {
      customCommands?.forEach((customCommand) => {
        const actionReference = editorRef.current.addAction({
          ...customCommand,
        });
        actionReferences.current.push(actionReference);
      });
    } else if (actionReferences.current && readOnly) {
      actionReferences.current.forEach((actionReference) => {
        actionReference.dispose();
      });
      actionReferences.current = [];
    }
  }, [customCommands, readOnly]);

  return (
    <div className="h-full min-h-[40px] w-full relative" ref={containerRef}>
      <Editor
        value={value}
        height="100%"
        language={language}
        onMount={handleOnMount}
        theme="tomorrow-night-blue"
        width="100%"
        loading=""
        onChange={onChange}
        className="absolute"
        options={{
          scrollbar: {
            alwaysConsumeMouseWheel: false,
            handleMouseWheel: scrollable,
          },
        }}
      />
    </div>
  );
}
