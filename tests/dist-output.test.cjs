const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

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
  assert.doesNotMatch(content, /new URL\(\s*["']https?:\/\//i, `Expected no remote URL constructor in ${relativePath}.`);
}

test("production output retains browser-only headers and self-hosted assets", () => {
  const distDirectory = path.join(ROOT, "dist");
  const htmlPath = path.join(distDirectory, "index.html");
  const headersPath = path.join(distDirectory, "_headers");

  assert.ok(fs.existsSync(htmlPath), "Expected npm run build to produce dist/index.html.");
  assert.ok(fs.existsSync(headersPath), "Expected npm run build to copy public/_headers to dist/_headers.");
  assert.equal(read("dist/_headers"), read("legacy-v1/_headers"));

  const html = fs.readFileSync(htmlPath, "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0, "Expected production HTML to reference the Vite runtime asset.");
  scripts.forEach((match) => {
    assert.match(match[1], /\bsrc=["']\/assets\//i, "Expected runtime scripts to be external self-hosted assets.");
    assert.match(match[2], /^\s*$/, "Expected no inline runtime script content in production HTML.");
  });
  assert.doesNotMatch(html, /<style\b/i, "Expected no inline runtime styles in production HTML.");

  filesUnder(distDirectory).forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    assertNoRemoteRuntimeReference(content, path.relative(ROOT, filePath));
  });
});
