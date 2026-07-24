/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const globals = readFileSync(path.join(process.cwd(), "src/styles/globals.css"), "utf8");
const app = readFileSync(path.join(process.cwd(), "src/app/App.tsx"), "utf8");
const buttons = readFileSync(path.join(process.cwd(), "src/components/ui/button.tsx"), "utf8");
const workflowSteps = readFileSync(path.join(process.cwd(), "src/app/workflow/WorkflowSteps.tsx"), "utf8");
const completionDetails = readFileSync(path.join(process.cwd(), "src/components/CompletionDetails.tsx"), "utf8");
const focusSources = [
  "src/components/ui/button.tsx",
  "src/components/ui/checkbox.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/radio-group.tsx",
  "src/components/ui/select.tsx",
  "src/components/ui/textarea.tsx",
].map((file) => readFileSync(path.join(process.cwd(), file), "utf8")).join("\n");

describe("shared visual language contract", () => {
  it("serves a landing page at the root while keeping the generator at /app/", () => {
    const landingPath = path.join(process.cwd(), "src/landing/LandingPage.tsx");
    const landingEntryPath = path.join(process.cwd(), "src/landing/main.tsx");
    const appHtmlPath = path.join(process.cwd(), "app/index.html");

    expect(existsSync(landingPath)).toBe(true);
    expect(existsSync(landingEntryPath)).toBe(true);
    expect(existsSync(appHtmlPath)).toBe(true);

    const landing = readFileSync(landingPath, "utf8");
    const landingCss = readFileSync(path.join(process.cwd(), "src/landing/styles.css"), "utf8");
    const landingEntry = readFileSync(landingEntryPath, "utf8");
    const rootHtml = readFileSync(path.join(process.cwd(), "index.html"), "utf8");
    const appHtml = readFileSync(appHtmlPath, "utf8");
    const vite = readFileSync(path.join(process.cwd(), "vite.config.ts"), "utf8");

    expect(landing).toContain('<PublicEstateHeader current="opnotes"');
    expect(landing).toContain('<EstateShell variant="landing">');
    expect(landing).toContain('href="./app/"');
    expect(landing).toContain('className="estate-primary-action estate-icon-action" href="https://github.com/Snowslash/op-note-gen" aria-label="Source on GitHub" title="Source on GitHub"><GitHubMark');
    expect(landing).not.toContain("<Code");
    expect(landing).toContain("Do not enter patient-identifiable information");
    expect(landing).toContain("Review generated text carefully");
    expect(landing).toContain("Twelve supported procedures");
    expect(landing).toContain("Seven general-surgery procedures plus five trauma-and-orthopaedics workflows");
    expect(landing).not.toContain("Seven common procedures");
    expect(landing).toContain('alt="Operation Note Generator showing the procedure picker');
    expect(landing).not.toContain("build-note");
    expect(landing).not.toContain("<figcaption>");
    expect(landing).not.toContain("This is the current generator with empty synthetic fields");
    expect(landingCss).toContain("border-block-end: 1px solid var(--estate-shoal)");
    expect(landingCss).toContain(".hero::after");
    expect(landingCss).toContain("background: var(--estate-coral)");
    expect(landingEntry).toContain("initialiseEstateTheme()");
    expect(rootHtml).toContain('src="/src/landing/main.tsx"');
    expect(appHtml).toContain('src="/src/main.tsx"');
    expect(vite).toContain("input:");
    expect(vite).toContain('app: fileURLToPath(new URL("./app/index.html", import.meta.url))');
  });

  it("consumes the exact versioned successor contract", () => {
    expect(globals).toContain('@import "@sangeev/estate-ui/contract.css"');
    expect(app).toContain('from "@sangeev/estate-ui"');
    expect(app).toContain('variant="standard-app"');
    expect(app).toContain('<EstatePageTitle variant="app">Operation Note Generator</EstatePageTitle>');
    expect(app).toContain('<EstateBoundary');
  });

  it("keeps headings and landing-link hover states contrast-safe", () => {
    const landingCss = readFileSync(path.join(process.cwd(), "src/landing/styles.css"), "utf8");

    expect(globals).toMatch(/h1,\s*h2,\s*h3\s*\{\s*color:\s*var\(--foreground\);/);
    expect(landingCss).not.toContain(".back-link:hover { color: var(--accent); }");
    expect(landingCss).not.toContain(".status-band > a:hover { color: var(--accent); }");
    expect(landingCss).not.toContain("footer a:hover { color: var(--accent); }");
    expect(landingCss).toContain(".back-link:hover { text-decoration-line: underline; }");
    expect(landingCss).toContain(".status-band > a:hover { text-decoration-line: underline; }");
    expect(landingCss).toContain("footer a:hover { text-decoration-line: underline; }");
  });

  it("keeps square buttons and a single safety boundary", () => {
    expect(buttons).toContain("rounded-sm");
    expect(app).not.toContain("Draft safety");
    expect(app.match(/Privacy and safety information/g)).toHaveLength(1);
  });

  it("inherits one shared focus outline without component ring layers", () => {
    expect(globals).not.toContain(":focus-visible");
    expect(focusSources).not.toMatch(/focus-visible:(?:ring|border-ring)/);
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
