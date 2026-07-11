const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");

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
  const headersPath = path.join(pagesDirectory, "_headers");

  assert.ok(fs.existsSync(htmlPath), "Expected npm run build:pages to produce docs/index.html.");
  assert.ok(fs.existsSync(headersPath), "Expected npm run build:pages to copy public/_headers to docs/_headers.");
  assert.equal(fs.readFileSync(headersPath, "utf8"), fs.readFileSync(path.join(ROOT, "public/_headers"), "utf8"));

  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /<script\b[^>]*\bsrc=["']\.\/assets\//i, "Expected a relative self-hosted Vite runtime asset that works under a repository subpath.");
  assert.doesNotMatch(html, /<style\b/i, "Expected no inline runtime styles.");
  assert.doesNotMatch(html, /<script\b[^>]*>\s*[^<\s]/i, "Expected no inline runtime scripts.");

  filesUnder(pagesDirectory).forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    assertNoRemoteRuntimeReference(content, path.relative(ROOT, filePath));
  });
});
