/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(path.join(process.cwd(), "src/styles/tokens.css"), "utf8");
const globals = readFileSync(path.join(process.cwd(), "src/styles/globals.css"), "utf8");
const app = readFileSync(path.join(process.cwd(), "src/app/App.tsx"), "utf8");
const buttons = readFileSync(path.join(process.cwd(), "src/components/ui/button.tsx"), "utf8");
const workflowSteps = readFileSync(path.join(process.cwd(), "src/app/workflow/WorkflowSteps.tsx"), "utf8");
const completionDetails = readFileSync(path.join(process.cwd(), "src/components/CompletionDetails.tsx"), "utf8");

const sharedTokens = [
  "--background: #f4f0e8",
  "--foreground: #1d1b18",
  "--card: #fbf8f2",
  "--primary: #8a1538",
  "--muted-foreground: #655e55",
  "--border: #c7b8a5",
  "--background: #1d1b18",
  "--foreground: #f4f0e8",
  "--card: #24211d",
  "--primary: #a3264d",
  "--ring: #c43b63",
];

describe("shared visual language contract", () => {
  it("keeps the canonical light and dark palette", () => {
    for (const token of sharedTokens) expect(tokens).toContain(token);
  });

  it("keeps square buttons, burgundy headings and a single safety boundary", () => {
    expect(globals).toMatch(/h1,\s*h2,\s*h3\s*\{\s*color:\s*var\(--primary\)/s);
    expect(tokens).toContain("--radius-sm: 0.125rem");
    expect(buttons).toContain("rounded-sm");
    expect(app).not.toContain("Draft safety");
    expect(app.match(/Privacy and safety information/g)).toHaveLength(1);
  });

  it("keeps component-only modules compatible with Fast Refresh", () => {
    expect(buttons).toContain("export { Button };");
    expect(workflowSteps).not.toContain("export const WORKFLOW_STAGES");
    expect(app).toContain('from "./workflow/stages"');
  });

  it("keeps static drain options at module scope", () => {
    const optionsDeclaration = completionDetails.indexOf("const STANDARD_DRAIN_LOCATIONS");
    const componentDeclaration = completionDetails.indexOf("export function CompletionDetails");

    expect(optionsDeclaration).toBeGreaterThan(-1);
    expect(optionsDeclaration).toBeLessThan(componentDeclaration);
  });
});
