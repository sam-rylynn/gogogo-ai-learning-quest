"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

function read(fileName) {
  return fs.readFileSync(path.join(root, fileName), "utf8");
}

function loadCertificateData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("certificate-library-data.js"), context, { filename: "certificate-library-data.js" });
  return context.window.GOGO_CERTIFICATE_LIBRARY;
}

test("certificate data has stable ids, required fields and explicit evidence states", () => {
  const data = loadCertificateData();
  assert.ok(data.length >= 30, "the representative library should not regress below its reviewed baseline");
  assert.equal(Object.isFrozen(data), true);

  const allowedStatuses = new Set([
    "verified-current",
    "enroll-check",
    "upcoming",
    "direction-only",
    "legacy-unverified",
    "retired-replaced"
  ]);
  const ids = new Set();

  data.forEach((item) => {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.equal(ids.has(item.id), false, `duplicate id: ${item.id}`);
    ids.add(item.id);
    assert.ok(item.name);
    assert.ok(item.issuer);
    assert.ok(item.credentialType);
    assert.ok(item.audience);
    assert.ok(item.assessmentSummary);
    assert.ok(item.statusNote);
    assert.ok(item.gogoMapping);
    assert.ok(Array.isArray(item.tracks) && item.tracks.length > 0);
    assert.ok(Array.isArray(item.learningTopics) && item.learningTopics.length > 0);
    assert.ok(allowedStatuses.has(item.status), `unexpected status: ${item.status}`);
    assert.match(item.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Array.isArray(item.officialSources) && item.officialSources.length > 0);
    item.officialSources.forEach((source) => {
      assert.ok(source.label);
      assert.equal(new URL(source.url).protocol, "https:");
      assert.match(source.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

test("current, upcoming, retired and direction-only records are not collapsed into one status", () => {
  const data = loadCertificateData();
  const byId = new Map(data.map((item) => [item.id, item]));
  assert.equal(byId.get("microsoft-ai-business-professional").status, "verified-current");
  assert.equal(byId.get("google-cloud-professional-agentic-architect").status, "upcoming");
  assert.equal(byId.get("tensorflow-developer-certificate-closed").status, "retired-replaced");
  assert.equal(byId.get("mohrss-ai-trainer-occupation").status, "direction-only");
  assert.equal(byId.get("baidu-cloud-generative-ai-engineer").status, "enroll-check");
});

test("certificate page contains one semantic result table and fully labelled filters", () => {
  const html = read("certificates.html");
  assert.equal((html.match(/<table\b/g) || []).length, 1);
  assert.match(html, /<caption>AI 证书与培训认证导航筛选结果<\/caption>/);
  assert.match(html, /<tbody id="certificate-table-body"><\/tbody>/);
  assert.match(html, /id="result-count" aria-live="polite"/);
  assert.match(html, /id="copy-feedback" aria-live="polite"/);

  ["query", "status", "issuer", "track", "code", "sort"].forEach((name) => {
    assert.match(html, new RegExp(`<label for="filter-${name}">`));
    assert.match(html, new RegExp(`id="filter-${name}"`));
  });

  const dataScript = html.indexOf("certificate-library-data.js");
  const appScript = html.indexOf("certificate-library.js");
  assert.ok(dataScript > -1 && appScript > dataScript, "data must load before the renderer");
});

test("renderer uses safe DOM APIs, shareable URL filters and protected external links", () => {
  const source = read("certificate-library.js");
  assert.equal(source.includes(".innerHTML"), false);
  assert.match(source, /document\.createElement/);
  assert.match(source, /replaceChildren/);
  assert.match(source, /window\.history\.replaceState/);
  assert.match(source, /navigator\.clipboard/);
  assert.match(source, /rel: "noopener noreferrer"/);
  assert.match(source, /target: "_blank"/);
  assert.match(source, /className: "cert-name-link"/);
  assert.match(source, /href: primarySource\.url/);
  assert.match(source, /官方原页面 ↗/);
  assert.match(source, /if \(item\.status === "legacy-unverified"\) return "核验依据 ↗"/);
  assert.match(source, /const PARAM_NAMES = \["q", "status", "issuer", "track", "code", "sort"\]/);
});

test("responsive CSS keeps one DOM table, exposes focus and reduced-motion rules", () => {
  const css = read("certificate-library.css");
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /\.certificate-table \.cert-row td::before/);
  assert.match(css, /content: attr\(data-label\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /min-height: 44px/);
});

test("GOGO onboarding and parchment board expose the certificate library", () => {
  const source = read("pixel-guild-upgrade.js");
  const styles = read("unified-learning-upgrade.css");
  assert.match(source, /certificates: \(\) => \{ window\.location\.href = "certificates\.html"; \}/);
  assert.match(source, /data-action="certificates">先看 AI 证书导航<\/button>/);
  assert.match(source, /class="pg-board-link pg-board-link-certificates" type="button" data-action="certificates">考证清单<\/button>/);
  assert.match(styles, /#pixel-guild-app \.pg-board-link-certificates/);
  assert.match(styles, /background: #4a2d24/);
});

test("Cloudflare staging whitelist contains every certificate-library asset", () => {
  const source = read("deploy-cloudflare.sh");
  ["certificates.html", "certificate-library.css", "certificate-library-data.js", "certificate-library.js"].forEach((fileName) => {
    assert.match(source, new RegExp(`\\b${fileName.replaceAll(".", "\\.")}\\b`));
  });
});
