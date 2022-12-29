import React, { useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";
import RunButton from "./RunButton";
import * as monaco from "monaco-editor";

function App() {
  const [content, setContent] = useState<string | undefined>(
    "for(let i = 0; i < 10; i++) console.log(Math.random());"
  );
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

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {};

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Editor
        onMount={onMount}
        value={content}
        onChange={(c) => setContent(c)}
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
