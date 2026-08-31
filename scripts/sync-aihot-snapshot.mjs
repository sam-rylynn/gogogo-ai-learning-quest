import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputPath = path.join(rootDir, "aihot-snapshot.js");
const require = createRequire(import.meta.url);
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138.0 Safari/537.36";

const sources = {
  leaderboard: "https://aihot.virxact.com/leaderboard",
  methodology: "https://aihot.virxact.com/leaderboard/methodology",
  hotTopics: "https://aihot.virxact.com/api/v1/hot-topics",
  products: "https://aihot.virxact.com/api/v1/items?mode=selected&category=ai-products&window=7d&limit=8"
};

function previousSnapshot() {
  if (!fs.existsSync(outputPath)) return null;
  try {
    delete require.cache[require.resolve(outputPath)];
    return require(outputPath);
  } catch (_) {
    return null;
  }
}

async function get(url, responseType) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: responseType === "json" ? "application/json" : "text/html", "User-Agent": userAgent }
      });
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return responseType === "json" ? response.json() : response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw lastError;
}

function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function text(value) {
  return decodeHtml(String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function parseLeaderboard(html) {
  const tableStart = html.indexOf('<div class="lb-table-body"');
  if (tableStart < 0) throw new Error("AIHOT leaderboard table not found");
  const tableHtml = html.slice(tableStart);
  const rowPattern = /<a class="lb-row"[^>]*href="\/leaderboard\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const models = [];
  let match = rowPattern.exec(tableHtml);

  while (match && models.length < 5) {
    const block = match[2];
    const rank = block.match(/<span class="lb-rank[^"]*"[^>]*><b>(\d+)<\/b>/);
    const identity = block.match(/<span class="lb-model-copy"><strong>([^<]+)<\/strong><small>([^<]+)<\/small>/);
    const release = block.match(/<span class="lb-release-date"[^>]*><small>上线<\/small><strong>([^<]+)<\/strong>/);
    const coverage = block.match(/<span class="lb-completeness"[^>]*>[\s\S]*?<strong>([^<]+)<\/strong>/);
    const score = block.match(/<span class="lb-score"[^>]*>[\s\S]*?<strong aria-hidden="true">([^<]+)<\/strong>/);
    if (rank && identity && score) {
      models.push({
        rank: Number(rank[1]),
        slug: match[1],
        name: text(identity[1]),
        provider: text(identity[2]),
        releasedAt: release ? text(release[1]) : null,
        coverage: coverage ? text(coverage[1]) : null,
        score: Number(text(score[1])),
        url: `https://aihot.virxact.com/leaderboard/${match[1]}`
      });
    }
    match = rowPattern.exec(tableHtml);
  }

  if (models.length < 5) throw new Error(`AIHOT leaderboard returned ${models.length} usable rows`);
  const pageText = text(html);
  const updated = pageText.match(/更新于\s*([0-9]{1,2}月[0-9]{1,2}日\s+[0-9]{1,2}:[0-9]{2})/);
  return {
    updatedLabel: updated ? updated[1] : null,
    models: models
  };
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch (_) {
    return null;
  }
}

function normalizeHotTopics(payload) {
  const items = Array.isArray(payload && payload.items) ? payload.items : [];
  return items.slice(0, 6).map((item, index) => ({
    rank: Number(item.rank) || index + 1,
    title: String(item.title || "未命名事件"),
    source: String(item.source && item.source.name || "原始来源"),
    sourceCount: Number(item.sourceCount) || 0,
    signalCount: Number(item.signalCount) || 0,
    publishedAt: item.latestAt || null,
    url: safeUrl(item.links && (item.links.aihot || item.links.original))
  })).filter((item) => item.url);
}

function normalizeProducts(payload) {
  const items = Array.isArray(payload && payload.items) ? payload.items : [];
  return items.slice(0, 8).map((item) => ({
    id: String(item.id || ""),
    title: String(item.title || "未命名产品动态"),
    summary: String(item.summary || item.reason || "打开原文查看完整信息。"),
    source: String(item.source && item.source.name || "原始来源"),
    publishedAt: item.publishedAt || item.discoveredAt || null,
    url: safeUrl(item.links && (item.links.aihot || item.links.original))
  })).filter((item) => item.url);
}

async function main() {
  const previous = previousSnapshot();
  const failures = [];
  let leaderboard = previous && previous.leaderboard;
  let hotTopics = previous && previous.hotTopics;
  let products = previous && previous.products;

  try {
    leaderboard = parseLeaderboard(await get(sources.leaderboard, "text"));
  } catch (error) {
    failures.push(`leaderboard: ${error.message}`);
  }

  try {
    hotTopics = normalizeHotTopics(await get(sources.hotTopics, "json"));
    if (!hotTopics.length) throw new Error("no usable hot topics");
  } catch (error) {
    failures.push(`hotTopics: ${error.message}`);
  }

  try {
    products = normalizeProducts(await get(sources.products, "json"));
    if (!products.length) throw new Error("no usable product items");
  } catch (error) {
    failures.push(`products: ${error.message}`);
  }

  if (!leaderboard || !Array.isArray(leaderboard.models) || leaderboard.models.length < 5) {
    throw new Error(`No valid leaderboard snapshot. ${failures.join("; ")}`);
  }
  if (!Array.isArray(hotTopics)) hotTopics = [];
  if (!Array.isArray(products)) products = [];

  const snapshot = {
    generatedAt: new Date().toISOString(),
    provider: "AIHOT",
    nonCommercialUse: true,
    leaderboard: leaderboard,
    hotTopics: hotTopics,
    products: products,
    sources: {
      leaderboard: sources.leaderboard,
      methodology: sources.methodology,
      hotTopics: "https://aihot.virxact.com/hot"
    },
    staleSections: failures.map((item) => item.split(":", 1)[0])
  };

  const body = `(function (root, factory) {\n  const data = factory();\n  if (typeof module === "object" && module.exports) module.exports = data;\n  if (root) root.GOGO_AIHOT_SNAPSHOT = data;\n})(typeof window !== "undefined" ? window : globalThis, function () {\n  "use strict";\n  return ${JSON.stringify(snapshot, null, 2)};\n});\n`;
  const tempPath = `${outputPath}.tmp`;
  fs.writeFileSync(tempPath, body, "utf8");
  fs.renameSync(tempPath, outputPath);

  process.stdout.write(JSON.stringify({
    output: outputPath,
    models: snapshot.leaderboard.models.length,
    hotTopics: snapshot.hotTopics.length,
    products: snapshot.products.length,
    failures
  }, null, 2) + "\n");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
