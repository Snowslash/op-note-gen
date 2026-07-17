const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function v2SourceFiles() {
  return ["index.html"].concat(
    fs.readdirSync(path.join(ROOT, "src"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.relative(ROOT, path.join(entry.parentPath, entry.name))),
  );
}

test("v2 scaffold establishes the agreed browser-only foundation", () => {
  const missing = [];
  const packageJson = JSON.parse(read("package.json"));
  const scripts = packageJson.scripts || {};

  ["dev", "build", "lint", "test", "check", "test:v1"].forEach((script) => {
    if (!scripts[script]) {
      missing.push(`package script: ${script}`);
    }
  });

  if (!String(scripts["test:v1"] || "").includes("tests/procedure-smoke.test.js")) {
    missing.push("explicit v1 procedure smoke test script");
  }
  if (!String(scripts["test:v1"] || "").includes("tests/v1-parity-fixtures.test.js")) {
    missing.push("explicit v1 parity fixture test script");
  }

  [
    "class-variance-authority",
    "lucide-react",
    "radix-ui",
  ].forEach((dependency) => {
    if (!packageJson.dependencies?.[dependency]) {
      missing.push(`owned shadcn dependency: ${dependency}`);
    }
  });

  [
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "src/main.tsx",
    "src/app/App.tsx",
    "src/styles/tokens.css",
    "src/styles/globals.css",
    "public/_headers",
    "src/components/ui/button.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/textarea.tsx",
    "src/components/ui/label.tsx",
    "src/components/ui/select.tsx",
    "src/components/ui/radio-group.tsx",
    "src/components/ui/checkbox.tsx",
    "src/components/ui/alert.tsx",
    "src/components/ui/collapsible.tsx",
  ].forEach((relativePath) => {
    if (!exists(relativePath)) {
      missing.push(`file: ${relativePath}`);
    }
  });

  if (exists("src/styles/tokens.css")) {
    const tokens = read("src/styles/tokens.css");
    ["--font-sans: var(--estate-font-body)", "--font-serif: var(--estate-font-heading)", "--radius-sm: var(--estate-radius)"].forEach((token) => {
      if (!tokens.includes(token)) {
        missing.push(`estate token bridge: ${token}`);
      }
    });
    if (!read("src/styles/globals.css").includes('@import "@sangeev/estate-ui/contract.css"')) {
      missing.push("versioned estate contract CSS import");
    }
  }

  if (exists("public/_headers") && read("public/_headers") !== read("legacy-v1/_headers")) {
    missing.push("public/_headers matching the retained v1 CSP headers");
  }

  if (exists("src/app/App.tsx")) {
    const app = read("src/app/App.tsx");
    [
      "Operation Note Generator",
      "Do not enter patient-identifiable information.",
      "This tool runs entirely in your browser. No entered data is transmitted or stored by this site.",
      "Review generated text carefully before use in any clinical record.",
    ].forEach((copy) => {
      if (!app.includes(copy)) {
        missing.push(`app shell copy: ${copy}`);
      }
    });
  }

  [
    ["src/components/ui/button.tsx", "radix-ui", ["buttonVariants", "asChild", "Slot.Root"]],
    ["src/components/ui/select.tsx", "radix-ui", ["SelectPrimitive.Root", "SelectPrimitive.Trigger", "SelectPrimitive.Value", "SelectPrimitive.Content", "SelectPrimitive.Viewport", "SelectPrimitive.Item"]],
    ["src/components/ui/radio-group.tsx", "radix-ui", ["RadioGroupPrimitive.Root", "RadioGroupPrimitive.Item"]],
    ["src/components/ui/checkbox.tsx", "radix-ui", ["CheckboxPrimitive.Root", "CheckboxPrimitive.Indicator"]],
    ["src/components/ui/collapsible.tsx", "radix-ui", ["CollapsiblePrimitive.Root", "CollapsiblePrimitive.CollapsibleTrigger", "CollapsiblePrimitive.CollapsibleContent"]],
  ].forEach(([relativePath, packageName, api]) => {
    if (!exists(relativePath)) {
      return;
    }

    const source = read(relativePath);
    if (!source.includes(packageName)) {
      missing.push(`Radix import: ${relativePath} -> ${packageName}`);
    }
    api.forEach((member) => {
      if (!source.includes(member)) {
        missing.push(`shadcn primitive API: ${relativePath} -> ${member}`);
      }
    });
  });

  const forbiddenSourcePatterns = [
    ["localStorage", /\blocalStorage\b/],
    ["sessionStorage", /\bsessionStorage\b/],
    ["indexedDB", /\bindexedDB\b/],
    ["service worker", /\bserviceWorker\b/],
    ["network fetch", /\bfetch\s*\(/],
    ["XMLHttpRequest", /\bXMLHttpRequest\b/],
    ["WebSocket", /\bWebSocket\b/],
    ["EventSource", /\bEventSource\b/],
    ["form submission action", /\b(?:formAction|action)\s*=/],
    ["non-GET form method", /\bmethod\s*=\s*["']?(?:post|put|patch|delete)\b/i],
  ];

  v2SourceFiles().forEach((relativePath) => {
    const source = read(relativePath);
    forbiddenSourcePatterns.forEach(([description, pattern]) => {
      if (pattern.test(source)) {
        missing.push(`browser-only privacy boundary: ${description} in ${relativePath}`);
      }
    });
  });

  const appSource = read("src/app/App.tsx");
  const mainSource = read("src/main.tsx");
  if (!appSource.includes('from "@sangeev/estate-ui"') || !mainSource.includes("initialiseEstateTheme")) {
    missing.push("theme preference must be owned by the versioned estate package");
  }

  assert.deepEqual(missing, [], `Missing v2 scaffold contract:\n- ${missing.join("\n- ")}`);
});
