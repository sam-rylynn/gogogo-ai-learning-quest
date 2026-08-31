const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const data = require(path.join(root, "ai-tools-data.js"));

test("AI tool catalog has 24 unique, fully classified official entries", () => {
  assert.equal(data.tools.length, 24);
  assert.equal(new Set(data.tools.map((tool) => tool.id)).size, data.tools.length);
  assert.match(data.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);

  const categoryIds = new Set(data.categories.map((category) => category.id));
  const capabilityKeys = data.comparisonRows.map((row) => row.key).sort();

  for (const tool of data.tools) {
    assert.match(tool.url, /^https:\/\//, tool.id);
    assert.ok(tool.type, tool.id);
    assert.ok(categoryIds.has(tool.primaryCategory), tool.id);
    assert.ok(tool.categories.includes(tool.primaryCategory), tool.id);
    assert.ok(tool.categories.every((category) => categoryIds.has(category)), tool.id);
    assert.ok(tool.platforms.length > 0, tool.id);
    assert.deepEqual(Object.keys(tool.capabilities).sort(), capabilityKeys, tool.id);
  }
});

test("catalog covers domestic entry points and each specialist task", () => {
  const domestic = data.tools.filter((tool) => tool.region === "domestic");
  assert.ok(domestic.length >= 10);

  for (const category of data.categories.filter((item) => !["all", "chat"].includes(item.id))) {
    assert.ok(
      data.tools.some((tool) => tool.primaryCategory === category.id),
      "missing primary tool for " + category.id
    );
  }
});

test("tool explorer keeps direct exploration and excludes the removed teaching flow", () => {
  const html = fs.readFileSync(path.join(root, "ai-tools.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "ai-tools.js"), "utf8");
  const combined = html + js;

  assert.match(html, /id="tool-search"/);
  assert.match(html, /id="category-filters"/);
  assert.match(html, /id="compare-dialog"/);
  assert.match(js, /primaryCategory/);
  assert.doesNotMatch(combined, /刚开始，先记住这六步|复制执行策略|不是工具越多越好/);
});
