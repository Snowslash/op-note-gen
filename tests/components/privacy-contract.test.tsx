import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const runtimeFiles = [
  "src/app/App.tsx",
  "src/app/procedure-state.ts",
  "src/app/procedure-form-definitions.ts",
  "src/components/CoreDetails.tsx",
  "src/components/ImplantRows.tsx",
  "src/components/ProcedureOperativeDetails.tsx",
  "src/components/CompletionDetails.tsx",
  "src/components/GeneratedNote.tsx",
  "src/components/ReviewCopyGate.tsx",
];

function readRuntimeSource() {
  return runtimeFiles.map((file) => readFileSync(resolve(process.cwd(), file), "utf8")).join("\n");
}

describe("application privacy and rendering boundary", () => {
  it("contains no clinical storage, network, HTML injection, or browser-form submission APIs", () => {
    const source = readRuntimeSource();

    for (const forbidden of [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "fetch(",
      "XMLHttpRequest",
      "sendBeacon",
      "WebSocket",
      "EventSource",
      "console.",
      "dangerouslySetInnerHTML",
      "execCommand",
      "<form",
      "formAction",
    ]) {
      expect(source).not.toContain(forbidden);
    }
    expect(source).toContain("navigator.clipboard?.writeText");
  });
});
