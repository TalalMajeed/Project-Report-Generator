import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@monaco-editor/react";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <main>
      <Editor
        className="monaco"
        height={"100svh"}
        defaultLanguage="javascript"
      />
    </main>
  </StrictMode>
);
