import React, { useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";
import RunButton from "./RunButton";
import "./App.css";
import * as monaco from "monaco-editor";

const defaultCode = `// This area is uneditable
console.log("But this part is");
// But this other part isn't`;

function App() {
  const [editor, setEditor] = useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >();
  const [content, setContent] = useState<string>(defaultCode);
  const [output, setOutput] = useState("");
  const run = () => {
    setOutput("");
    const preCode = `
console.log = (...args) => { self.postMessage({type: "log", args: args})};
`;
    const code = content ?? "";
    const postCode = `
self.postMessage({type: "terminate"})`;
    const fullCode = preCode + code + postCode;
    const blob = new Blob([fullCode], {
      type: "text/javascript",
    });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    w.onerror = (ev) => {
      console.log(ev);
    };
    w.onmessage = (ev) => {
      if (ev.data.type === "terminate") {
        w.terminate();
        URL.revokeObjectURL(url);
        return;
      }

      if (ev.data.type === "log") {
        setOutput((output) => output + ev.data.args.join(" ") + "\n");
        return;
      }
    };
  };

  const onChange = (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => {
    setContent(value ?? "");
  };

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    setEditor(editor);
    const dec: monaco.editor.IModelDeltaDecoration = {
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 999,
      },
      options: { className: "noedit" },
    };
    const decorations = [dec];
    editor.getModel()?.deltaDecorations([], decorations);
    editor.onKeyDown((e) => {
      const pos = editor.getPosition();
      if (!pos) return;
      if (pos.lineNumber !== 1) return;
      e.preventDefault();
      e.stopPropagation();
    });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Editor
        value={content}
        onMount={onMount}
        onChange={onChange}
        options={{ fontSize: 25 }}
        defaultLanguage="javascript"
        theme={"vs-dark"}
      />

      <Box
        sx={{ height: "100px", overflow: "scroll", backgroundColor: "#ddd" }}
      >
        <Typography sx={{ whiteSpace: "pre-wrap" }}>{output}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <RunButton onRun={run} sx={{ width: "100%" }} />
      </Box>
    </Box>
  );
}

export default App;
