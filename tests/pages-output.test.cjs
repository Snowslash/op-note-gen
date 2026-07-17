const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const FONT_LICENSES = ["OFL-Atkinson-Hyperlegible-Next.txt", "OFL-Literata.txt"];

function filesUnder(directory) {
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function assertNoRemoteRuntimeReference(content, relativePath) {
  assert.doesNotMatch(content, /(?:src|href)\s*=\s*["']https?:\/\//i, `Expected no remote asset reference in ${relativePath}.`);
  assert.doesNotMatch(content, /@import\s+(?:url\()?\s*["']?https?:\/\//i, `Expected no remote stylesheet in ${relativePath}.`);
  assert.doesNotMatch(content, /url\(\s*["']?https?:\/\//i, `Expected no remote CSS asset in ${relativePath}.`);
  assert.doesNotMatch(content, /(?:fetch|import)\(\s*["']https?:\/\//i, `Expected no remote runtime request in ${relativePath}.`);
}

test("GitHub Pages bundle is self-contained and retains the clinical privacy headers", () => {
  const pagesDirectory = path.join(ROOT, "docs");
  const htmlPath = path.join(pagesDirectory, "index.html");
  const appHtmlPath = path.join(pagesDirectory, "app", "index.html");
  const headersPath = path.join(pagesDirectory, "_headers");

  assert.ok(fs.existsSync(htmlPath), "Expected npm run build:pages to produce docs/index.html.");
  assert.ok(fs.existsSync(appHtmlPath), "Expected npm run build:pages to preserve the generator at docs/app/index.html.");
  assert.ok(fs.existsSync(headersPath), "Expected npm run build:pages to copy public/_headers to docs/_headers.");
  assert.equal(fs.readFileSync(headersPath, "utf8"), fs.readFileSync(path.join(ROOT, "public/_headers"), "utf8"));

  const html = fs.readFileSync(htmlPath, "utf8");
  const appHtml = fs.readFileSync(appHtmlPath, "utf8");
  assert.match(html, /<script\b[^>]*\bsrc=["']\.\/assets\//i, "Expected a relative self-hosted Vite runtime asset that works under a repository subpath.");
  assert.doesNotMatch(html, /<style\b/i, "Expected no inline runtime styles.");
  assert.doesNotMatch(html, /<script\b[^>]*>\s*[^<\s]/i, "Expected no inline runtime scripts.");
  assert.match(appHtml, /<script\b[^>]*\bsrc=["']\.\.\/assets\//i, "Expected a relative self-hosted nested app runtime asset.");
  assert.doesNotMatch(appHtml, /<style\b/i, "Expected no inline runtime styles in the nested app HTML.");

  const pageFiles = filesUnder(pagesDirectory);
  assert.ok(pageFiles.some((filePath) => /Literata-Variable-.*\.ttf$/.test(filePath)), "Expected the estate heading font in the Pages bundle.");
  assert.ok(pageFiles.some((filePath) => /AtkinsonHyperlegibleNext-Variable-.*\.ttf$/.test(filePath)), "Expected the estate body font in the Pages bundle.");
  for (const license of FONT_LICENSES) {
    const deployed = path.join(pagesDirectory, "licenses", license);
    const canonical = path.join(ROOT, "node_modules", "@sangeev", "estate-ui", "LICENSES", license);
    assert.ok(fs.existsSync(deployed), `Expected ${license} beside the deployed font binaries.`);
    assert.equal(fs.readFileSync(deployed, "utf8"), fs.readFileSync(canonical, "utf8"));
  }
  const runtime = pageFiles.filter((filePath) => filePath.endsWith(".js")).map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
  assert.match(runtime, /2\.0\.0-alpha\.2/, "Expected the current estate contract version in the Pages runtime.");

  pageFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    assertNoRemoteRuntimeReference(content, path.relative(ROOT, filePath));
  });
});

test("Cloudflare Worker preserves nested app routing on the production domain", () => {
  const wranglerPath = path.join(ROOT, "wrangler.jsonc");
  assert.ok(fs.existsSync(wranglerPath), "Expected an explicit Worker Static Assets deployment contract.");

  const wrangler = JSON.parse(fs.readFileSync(wranglerPath, "utf8"));
  assert.equal(wrangler.name, "op-note-gen");
  assert.equal(wrangler.compatibility_date, "2026-07-17");
  assert.deepEqual(wrangler.observability, { enabled: false });
  assert.deepEqual(wrangler.assets, {
    directory: "./docs",
    not_found_handling: "single-page-application",
  });
  assert.deepEqual(wrangler.routes, [
    {
      pattern: "opnotes.sangeev.me",
      custom_domain: true,
    },
  ]);
});
