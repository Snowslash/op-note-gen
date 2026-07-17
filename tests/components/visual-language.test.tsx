/// <reference types="node" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const globals = readFileSync(path.join(process.cwd(), "src/styles/globals.css"), "utf8");
const app = readFileSync(path.join(process.cwd(), "src/app/App.tsx"), "utf8");
const buttons = readFileSync(path.join(process.cwd(), "src/components/ui/button.tsx"), "utf8");
const workflowSteps = readFileSync(path.join(process.cwd(), "src/app/workflow/WorkflowSteps.tsx"), "utf8");
const completionDetails = readFileSync(path.join(process.cwd(), "src/components/CompletionDetails.tsx"), "utf8");

describe("shared visual language contract", () => {
  it("consumes the exact versioned successor contract", () => {
    expect(globals).toContain('@import "@sangeev/estate-ui/contract.css"');
    expect(app).toContain('from "@sangeev/estate-ui"');
    expect(app).toContain('variant="standard-app"');
    expect(app).toContain('<EstatePageTitle variant="app">Operation Note Generator</EstatePageTitle>');
    expect(app).toContain('<EstateBoundary');
  });

  it("keeps square buttons and a single safety boundary", () => {
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
