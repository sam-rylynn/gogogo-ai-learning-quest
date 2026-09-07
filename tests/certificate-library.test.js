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

function loadCurrentCourseLevels() {
  const html = read("index.html");
  const dataStart = html.indexOf("var GAME_DATA =");
  const dataEnd = html.indexOf("/* ================= state", dataStart);
  assert.ok(dataStart >= 0 && dataEnd > dataStart, "the active course data must be identifiable");
  const context = {};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(html.slice(dataStart, dataEnd), context, { filename: "index.html course data" });
  for (const script of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
    if (!/\bdata-curriculum[\w-]*(?:\s|>)/.test(script[0])) continue;
    const fileName = script[1].split("?")[0];
    vm.runInContext(read(fileName), context, { filename: fileName });
  }
  return context.GAME_DATA.levels;
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

test("certificate practice mappings match the active course order and topic titles", () => {
  const levels = loadCurrentCourseLevels();
  // These are stable learner-facing topics, not claims about an issuer's syllabus.
  const courseTopics = new Map([
    [1, ["AI 基础", /AI/]],
    [2, ["Python 与 API", /Python.*API/]],
    [3, ["机器学习基础", /机器学习/]],
    [4, ["神经网络与大模型原理", /神经网络/]],
    [5, ["RAG 与工具调用", /RAG.*工具调用/]],
    [6, ["产品方向实践", /产品.*方向/]],
    [7, ["WorkBuddy 工作助手", /WorkBuddy/]],
    [8, ["Coze 智能体", /Coze/]],
    [9, ["CLI 与私有部署", /CLI.*部署/]],
    [10, ["AI 产品方法", /AI.*产品方法/]],
    [11, ["运营与办公", /运营/]],
    [12, ["AI 视觉设计", /视觉设计/]],
    [13, ["AI 影音", /视频.*音频/]],
    [14, ["作品集", /作品集/]]
  ]);
  for (const [number, [, titlePattern]] of courseTopics) {
    assert.ok(levels[number - 1], `missing active level ${number}`);
    assert.match(levels[number - 1].title, titlePattern, `active level ${number} changed topic; review certificate mappings`);
  }

  const mappedLevels = new Map();
  for (const item of loadCertificateData()) {
    const mappings = Array.from(item.gogoMapping.matchAll(/第 (\d+) 关「([^」]+)」/g));
    const numbers = mappings.map(([, number]) => Number(number));
    mappedLevels.set(item.id, numbers);
    assert.equal(new Set(numbers).size, numbers.length, `${item.id}: repeated level`);
    for (const [, number, topic] of mappings) {
      const expected = courseTopics.get(Number(number));
      assert.ok(expected, `${item.id}: nonexistent level ${number}`);
      assert.equal(topic, expected[0], `${item.id}: topic and level number disagree`);
    }
    assert.equal(item.gogoMapping.replace(/第 \d+ 关「[^」]+」/g, "").includes("第"), false,
      `${item.id}: every numbered mapping must show its topic explicitly`);
  }

  assert.deepEqual(mappedLevels.get("cie-ai-office-2026"), [1, 7, 11]);
  assert.deepEqual(mappedLevels.get("cie-ai-painting-2026"), [12]);
  assert.deepEqual(mappedLevels.get("cie-ai-video-editor-2026"), [13]);
  assert.deepEqual(mappedLevels.get("tencent-workbuddy-opc-practitioner"), [7, 11]);
  assert.deepEqual(mappedLevels.get("microsoft-ai-transformation-leader"), [10, 11]);
  assert.ok(mappedLevels.get("cie-ai-product-manager-2026").includes(14), "portfolio practice belongs to level 14");
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
