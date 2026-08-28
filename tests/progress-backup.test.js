"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const backup = require("../progress-backup.js");

class FakeStorage {
  constructor(initial = {}, options = {}) {
    this.map = new Map(Object.entries(initial));
    this.setCalls = 0;
    this.failSetAt = options.failSetAt || 0;
    this.corruptNextRead = false;
    this.corruptAfterSet = Boolean(options.corruptAfterSet);
  }

  getItem(key) {
    if (this.corruptNextRead) {
      this.corruptNextRead = false;
      return "corrupted";
    }
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.setCalls += 1;
    if (this.failSetAt && this.setCalls === this.failSetAt) throw new Error("quota");
    this.map.set(key, String(value));
    if (this.corruptAfterSet) {
      this.corruptAfterSet = false;
      this.corruptNextRead = true;
    }
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

class CapacityStorage extends FakeStorage {
  constructor(initial, maxBytes) {
    super(initial);
    this.maxBytes = maxBytes;
  }

  setItem(key, value) {
    const next = new Map(this.map);
    next.set(key, String(value));
    const used = [...next.entries()].reduce((total, entry) => total + entry[0].length + entry[1].length, 0);
    if (used > this.maxBytes) throw new Error("quota");
    this.map = next;
  }
}

function allStores(prefix) {
  const values = {};
  backup.STORE_KEYS.forEach((key, index) => {
    values[key] = JSON.stringify({ marker: `${prefix}-${index}`, unknown: { keep: true, explicitNull: null } });
  });
  return values;
}

function fnv1a32(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function parsedBackup(storage, now = new Date("2026-08-28T00:00:00.000Z")) {
  const text = await backup.createBackupText(storage, {
    now,
    source: { origin: "https://learn.zhixng.cn", pathname: "/course" }
  });
  return backup.parseBackupText(text);
}

test("empty origin still exports a valid complete envelope", async () => {
  const text = await backup.createBackupText(new FakeStorage(), {
    now: new Date("2026-08-28T00:00:00.000Z"),
    source: { origin: "local-file", pathname: "/index.html" }
  });
  const documentValue = await backup.parseBackupText(text);
  assert.equal(documentValue.kind, backup.KIND);
  assert.equal(documentValue.backupVersion, 2);
  backup.STORE_KEYS.forEach((key) => assert.equal(documentValue.stores[key], null));
});

test("raw JSON round-trips byte-for-byte with Chinese, emoji and unknown fields", async () => {
  const original = allStores("原始🚀\n记录");
  const documentValue = await parsedBackup(new FakeStorage(original));
  const target = new FakeStorage(allStores("旧数据"));
  backup.restoreBackup(target, documentValue);
  backup.STORE_KEYS.forEach((key) => assert.equal(target.getItem(key), original[key]));
});

test("checksum mismatch is rejected before any restore", async () => {
  const text = await backup.createBackupText(new FakeStorage(allStores("safe")), {
    now: new Date("2026-08-28T00:00:00.000Z"),
    source: { origin: "https://example.com", pathname: "/" }
  });
  const changed = JSON.parse(text);
  changed.stores.gogogo_ai_quest_v2 = JSON.stringify({ marker: "tampered" });
  await assert.rejects(() => backup.parseBackupText(JSON.stringify(changed)), { code: "checksum_mismatch" });
});

test("FNV fallback backups remain verifiable in browsers that support SHA-256", async () => {
  const documentValue = JSON.parse(await backup.createBackupText(new FakeStorage(allStores("fallback")), {
    now: new Date("2026-08-28T00:00:00.000Z"),
    source: { origin: "file://", pathname: "/course.html" }
  }));
  const payload = {
    kind: documentValue.kind,
    backupVersion: documentValue.backupVersion,
    appVersion: documentValue.appVersion,
    exportedAt: documentValue.exportedAt,
    source: documentValue.source,
    stores: documentValue.stores
  };
  documentValue.checksum = `fnv1a32:${fnv1a32(JSON.stringify(payload))}`;
  const parsed = await backup.parseBackupText(JSON.stringify(documentValue));
  assert.equal(parsed.checksum, documentValue.checksum);
});

test("wrong kind, future version, missing and unexpected stores are rejected", async () => {
  const text = await backup.createBackupText(new FakeStorage(allStores("safe")), {
    now: new Date("2026-08-28T00:00:00.000Z"),
    source: { origin: "https://example.com", pathname: "/" }
  });
  const base = JSON.parse(text);

  const wrongKind = structuredClone(base);
  wrongKind.kind = "other";
  await assert.rejects(() => backup.parseBackupText(JSON.stringify(wrongKind)), { code: "wrong_backup_kind" });

  const future = structuredClone(base);
  future.backupVersion = 999;
  await assert.rejects(() => backup.parseBackupText(JSON.stringify(future)), { code: "unsupported_backup_version" });

  const missing = structuredClone(base);
  delete missing.stores.gogogo_learning_flow_v2;
  await assert.rejects(() => backup.parseBackupText(JSON.stringify(missing)), { code: "missing_store" });

  const unexpected = structuredClone(base);
  unexpected.stores.other_app_secret = "{}";
  await assert.rejects(() => backup.parseBackupText(JSON.stringify(unexpected)), { code: "unexpected_store" });
});

test("primitive stores and dangerous object keys are rejected", async () => {
  const primitiveStorage = new FakeStorage(allStores("safe"));
  primitiveStorage.map.set("gogogo_ai_quest_v2", "5");
  await assert.rejects(() => backup.createBackupText(primitiveStorage), { code: "invalid_store_shape" });

  const dangerousStorage = new FakeStorage(allStores("safe"));
  dangerousStorage.map.set("gogogo_ai_quest_v2", '{"nested":{"__proto__":{"polluted":true}}}');
  await assert.rejects(() => backup.createBackupText(dangerousStorage), { code: "dangerous_key" });
  assert.equal({}.polluted, undefined);
});

test("restore rolls every key back when any write fails", async () => {
  const documentValue = await parsedBackup(new FakeStorage(allStores("backup")));
  for (let failure = 1; failure <= backup.STORE_KEYS.length; failure += 1) {
    const previous = allStores(`previous-${failure}`);
    const target = new FakeStorage(previous, { failSetAt: failure });
    assert.throws(() => backup.restoreBackup(target, documentValue), { code: "restore_failed" });
    backup.STORE_KEYS.forEach((key) => assert.equal(target.getItem(key), previous[key]));
  }
});

test("readback mismatch triggers a full rollback", async () => {
  const documentValue = await parsedBackup(new FakeStorage(allStores("backup")));
  const previous = allStores("previous");
  const target = new FakeStorage(previous, { corruptAfterSet: true });
  assert.throws(() => backup.restoreBackup(target, documentValue), { code: "restore_failed" });
  backup.STORE_KEYS.forEach((key) => assert.equal(target.getItem(key), previous[key]));
});

test("rollback clears partially written values before restoring under a storage quota", async () => {
  const raw = (size, marker) => JSON.stringify({ marker, pad: "x".repeat(size) });
  const previous = {};
  const targetValues = {};
  backup.STORE_KEYS.forEach((key, index) => {
    previous[key] = raw(index === 0 ? 1000 : 50, `old-${index}`);
    targetValues[key] = raw(index === 0 ? 50 : 600, `new-${index}`);
  });
  const documentValue = await parsedBackup(new FakeStorage(targetValues));
  const quota = Object.entries(previous).reduce((total, entry) => total + entry[0].length + entry[1].length, 0) + 200;
  const target = new CapacityStorage(previous, quota);
  assert.throws(() => backup.restoreBackup(target, documentValue), { code: "restore_failed" });
  backup.STORE_KEYS.forEach((key) => assert.equal(target.getItem(key), previous[key]));
});

test("null entries remove absent stores during exact restore", async () => {
  const documentValue = await parsedBackup(new FakeStorage());
  const target = new FakeStorage(allStores("existing"));
  backup.restoreBackup(target, documentValue);
  backup.STORE_KEYS.forEach((key) => assert.equal(target.getItem(key), null));
});

test("legacy imported review cards are escaped before innerHTML rendering", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "AI从业者闯关之路.html"), "utf8");
  assert.match(html, /if\(key\.indexOf\("wq_"\)===0\) face=escNote\(face\)/);
  assert.equal(html.includes("+(showBack?c.b:c.f)+"), false);
});

test("imported guild scores and question ids are normalized before HTML rendering", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "pixel-guild-upgrade.js"), "utf8");
  assert.match(source, /const safeScore = Number\.isFinite\(rawScore\) \? Math\.max\(0, Math\.min\(100, rawScore\)\) : "";/);
  assert.match(source, /data-id="\$\{escapeHtml\(String\(question\.id \|\| ""\)\)\}"/);
  assert.equal(source.includes('data-id="${question.id}"'), false);
});

test("imported legacy streak and skill classes are normalized before HTML rendering", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "AI从业者闯关之路.html"), "utf8");
  assert.match(html, /S\.streak=Number\.isFinite\(safeStreak\)\?Math\.max\(0,Math\.floor\(safeStreak\)\):0/);
  assert.match(html, /S\.skills\[skillKey\]=\(skillValue===1\|\|skillValue===2\)\?skillValue:0/);
  assert.match(html, /var states=t\.skills\.map\(function\(_,i\)\{var value=Number\(S\.skills\[t\.id\+i\]\); return value===1\|\|value===2\?value:0;\}\)/);
  assert.equal(html.includes("'+S.streak+' 天</div>"), false);
});

test("imported review-card boxes are clamped before HTML rendering", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "AI从业者闯关之路.html"), "utf8");
  assert.match(html, /cardState\.box=Number\.isFinite\(cardBox\)\?Math\.max\(0,Math\.min\(4,Math\.floor\(cardBox\)\)\):0/);
  assert.match(html, /safeBox=Number\.isFinite\(safeBox\)\?Math\.max\(0,Math\.min\(4,Math\.floor\(safeBox\)\)\):0/);
  assert.equal(html.includes("(cd.box+1)"), false);
});

test("glossary modal owns Escape and Tab above other open overlays", () => {
  const pixel = fs.readFileSync(path.join(__dirname, "..", "pixel-guild-upgrade.js"), "utf8");
  const unified = fs.readFileSync(path.join(__dirname, "..", "unified-learning-upgrade.js"), "utf8");
  const glossary = fs.readFileSync(path.join(__dirname, "..", "glossary-cards.js"), "utf8");
  assert.match(pixel, /if \(glossaryOverlay && !glossaryOverlay\.hidden\) return;/);
  assert.match(unified, /if \(glossaryOverlay && !glossaryOverlay\.hidden\) return;/);
  assert.match(glossary, /event\.stopImmediatePropagation\(\)/);
  assert.match(glossary, /if \(event\.key !== "Tab"\) return;/);
});

test("public naming consistently uses GOGO AI 闯关地图", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const pixel = fs.readFileSync(path.join(__dirname, "..", "pixel-guild-upgrade.js"), "utf8");
  const unified = fs.readFileSync(path.join(__dirname, "..", "unified-learning-upgrade.js"), "utf8");
  const readme = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");
  assert.match(html, /<title>GOGO · AI 闯关地图<\/title>/);
  assert.match(html, /<meta property="og:title" content="GOGO · AI 闯关地图">/);
  assert.match(pixel, /<h1>AI 闯关地图<\/h1>/);
  assert.match(pixel, /# GOGO · AI 闯关地图｜完整学习快照/);
  assert.match(unified, /GOGO \/ AI QUEST/);
  assert.match(readme, /^# GOGO · AI 闯关地图/m);
  [html, pixel, unified, readme].forEach((source) => {
    assert.equal(source.includes("GOGO GO"), false);
    assert.equal(source.includes("AI 从业者闯关之路"), false);
  });
});
