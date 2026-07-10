import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const runtimeFiles = [
  "src/app/App.tsx",
  "src/app/appendicectomy-state.ts",
  "src/components/AppendicectomyCoreDetails.tsx",
  "src/components/AppendicectomyOperativeDetails.tsx",
  "src/components/AppendicectomyCompletionDetails.tsx",
  "src/components/GeneratedNote.tsx",
  "src/components/ReviewCopyGate.tsx",
];

function readRuntimeSource() {
  return runtimeFiles.map((file) => readFileSync(resolve(process.cwd(), file), "utf8")).join("\n");
}

describe("appendicectomy privacy and rendering boundary", () => {
  it("contains no clinical storage, network, HTML injection, or browser-form submission APIs", () => {
    const source = readRuntimeSource();

    for (const forbidden of [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "fetch(",
      "XMLHttpRequest",
      "sendBeacon",
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
