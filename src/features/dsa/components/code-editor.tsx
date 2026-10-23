"use client";

import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import type { Extension } from "@codemirror/state";

const docketTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "rgba(255,255,255,0.018)",
      color: "#e9e5dc",
      fontSize: "12.5px",
    },
    ".cm-content": {
      fontFamily: "var(--font-mono), ui-monospace, monospace",
      padding: "12px 0",
      caretColor: "#c08a5d",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#4b4d50",
      border: "none",
      fontFamily: "var(--font-mono), ui-monospace, monospace",
      fontSize: "11px",
    },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.025)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#9b9c9a" },
    ".cm-selectionBackground, ::selection": { backgroundColor: "rgba(192,138,93,0.22) !important" },
    ".cm-cursor": { borderLeftColor: "#c08a5d" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-line": { padding: "0 12px" },
  },
  { dark: true },
);

function languageExtension(language: string | null): Extension[] {
  switch (language) {
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "cpp":
      return [cpp()];
    case "javascript":
      return [javascript({ jsx: true })];
    case "typescript":
      return [javascript({ jsx: true, typescript: true })];
    default:
      return [];
  }
}

export default function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  minHeight = "220px",
}: {
  value: string;
  language: string | null;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-black/15">
      <CodeMirror
        value={value}
        height={minHeight}
        theme="dark"
        extensions={[docketTheme, ...languageExtension(language)]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          autocompletion: false,
        }}
      />
    </div>
  );
}
