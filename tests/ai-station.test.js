const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const station = require(path.join(root, "ai-station-data.js"));
const snapshot = require(path.join(root, "aihot-snapshot.js"));

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

test("AI application station exposes exactly four clear entrances", () => {
  assert.deepEqual(
    station.portals.map((item) => item.id),
    ["tools", "hot", "flows", "glossary"]
  );
  assert.deepEqual(
    station.portals.map((item) => item.title),
    ["应用工具库", "AI 热榜", "实战流程", "常用词"]
  );
});

test("workflow library is outcome-based and fully checkable", () => {
  assert.equal(station.workflows.length, 8);
  assert.equal(new Set(station.workflows.map((item) => item.id)).size, 8);
  for (const workflow of station.workflows) {
    assert.ok(workflow.title);
    assert.ok(workflow.deliverable);
    assert.ok(workflow.inputs.length >= 3, workflow.id);
    assert.ok(workflow.steps.length >= 5, workflow.id);
    assert.ok(workflow.done.length >= 3, workflow.id);
    assert.ok(workflow.pitfalls.length >= 2, workflow.id);
    assert.ok(workflow.toolIds.length >= 3, workflow.id);
    assert.match(workflow.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(station.methodCards.length, 6);
});

test("plain-Chinese glossary extends the maintained GOGO terms", () => {
  const required = [
    "model", "multimodal", "contextWindow", "skill", "mcp", "workflow",
    "apiKey", "repository", "githubGitee", "commit", "deploy",
    "baseline", "acceptanceCriteria", "iteration", "rollback", "sourceOfTruth"
  ];
  required.forEach((id) => assert.ok(station.extraTerms[id], id));
  for (const term of Object.values(station.extraTerms)) {
    assert.ok(term.group);
    assert.ok(term.term);
    assert.ok(term.translation);
    assert.ok(term.summary.length >= 20, term.term);
    assert.ok(term.example, term.term);
  }
  assert.match(read("glossary-cards.js"), /window\.GOGO_GLOSSARY_TERMS = TERMS/);
});

test("AIHOT snapshot is a bounded attributed Top 5 preview", () => {
  assert.equal(snapshot.provider, "AIHOT");
  assert.equal(snapshot.nonCommercialUse, true);
  assert.equal(snapshot.leaderboard.models.length, 5);
  assert.match(snapshot.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  for (const model of snapshot.leaderboard.models) {
    assert.ok(Number.isInteger(model.rank));
    assert.ok(model.name);
    assert.ok(Number.isFinite(model.score));
    assert.match(model.url, /^https:\/\/aihot\.virxact\.com\/leaderboard\//);
  }
  assert.match(snapshot.sources.leaderboard, /^https:\/\/aihot\.virxact\.com\/leaderboard$/);
  assert.match(snapshot.sources.methodology, /^https:\/\/aihot\.virxact\.com\/leaderboard\/methodology$/);
});

test("homepage puts four entrances before the real model ranking content", () => {
  const html = read("ai-tools.html");
  const portalIndex = html.indexOf('id="portal-grid"');
  const rankingIndex = html.indexOf('id="model-ranking-home"');
  assert.ok(portalIndex > 0);
  assert.ok(rankingIndex > portalIndex);
  assert.match(html, /<title>AI应用站 · GOGO<\/title>/);
  assert.match(html, /data-view-panel="tools"/);
  assert.match(html, /data-view-panel="hot"/);
  assert.match(html, /data-view-panel="flows"/);
  assert.match(html, /data-view-panel="glossary"/);
  assert.doesNotMatch(html, /广告|赞助|立即购买|联系销售/);
});

test("router preserves old tool links and AIHOT uses the stable v1 API", () => {
  const js = read("ai-station.js");
  assert.match(js, /legacyRoute/);
  assert.match(js, /url\.searchParams\.set\("category", legacyRoute\)/);
  assert.match(js, /api\/v1\/hot-topics/);
  assert.match(js, /api\/v1\/items\?mode=selected&category=ai-products/);
  assert.doesNotMatch(js, /api\/public\//);
  assert.match(js, /Keep the bundled snapshot/);
});

test("GOGO entry and Cloudflare package include the complete station", () => {
  const guild = read("pixel-guild-upgrade.js");
  const styles = read("unified-learning-upgrade.css");
  const deploy = read("deploy-cloudflare.sh");
  assert.match(guild, /<div class="pg-board-links" role="group" aria-label="扩展资源入口">/);
  assert.match(guild, /class="pg-board-link pg-board-link-tools" type="button" data-action="ai-tools">AI应用站<\/button>/);
  assert.doesNotMatch(guild, />AI应用工具大全<\/button>/);
  assert.match(styles, /#pixel-guild-app \.pg-board-link-tools/);
  assert.match(styles, /background: #173a43/);
  assert.match(styles, /clip-path: polygon\(/);
  assert.match(styles, /pointer-events: auto/);
  [
    "ai-tools.html", "ai-tools.css", "ai-tools-data.js", "ai-tools.js",
    "ai-station-data.js", "ai-station.js", "aihot-snapshot.js"
  ].forEach((asset) => assert.ok(deploy.includes(asset), asset));
});
