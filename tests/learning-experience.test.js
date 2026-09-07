"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "unified-learning-upgrade.js"), "utf8");
const helperContext = vm.createContext({ URLSearchParams });
vm.runInContext(fs.readFileSync(path.join(root, "learning-experience.js"), "utf8"), helperContext);
const experience = helperContext.GOGO_LEARNING_EXPERIENCE;
const counts = [8,12,14,14,4,4,8,8,8,8,8,8,8,8];
const plain = value => JSON.parse(JSON.stringify(value));

test("course deep links round-trip all valid card boundaries and reject malformed targets", () => {
  counts.forEach((count, index) => {
    for (const lesson of [0, count - 1]) {
      const link = experience.courseLink(index + 1, lesson);
      assert.deepEqual(plain(experience.parseLaunch(link.slice(link.indexOf("?")), counts)), { level:index, lesson });
    }
  });
  for (const query of ["", "?learn=0", "?learn=15", "?learn=-1", "?learn=1.5", "?learn=NaN", "?learn=<script>"]) {
    assert.equal(experience.parseLaunch(query, counts), null);
  }
  for (const card of ["0", "99", "-1", "bad"]) {
    assert.deepEqual(plain(experience.parseLaunch("?learn=11&card=" + card, counts)), { level:10, lesson:null });
  }
  assert.equal(experience.courseLink(99), "index.html");
});

test("learning routes and teaching samples point to existing cards and workflows", () => {
  const workflowIds = new Set(require("../ai-station-data.js").workflows.map(item => item.id));
  for (const route of experience.routes) {
    if (!route.levels) continue;
    assert.equal(new Set(route.levels).size, route.levels.length);
    route.levels.forEach(index => assert.ok(index >= 0 && index < counts.length));
  }
  for (const [id, sample] of Object.entries(experience.samples)) {
    const [level, lesson] = sample.lesson;
    assert.ok(lesson >= 0 && lesson < counts[level]);
    assert.ok(workflowIds.has(sample.workflow), sample.workflow);
    assert.equal(experience.sampleForLesson(level, lesson), id);
    assert.match(experience.renderSample(id), /教学示例 · 非真实用户资料/);
  }
  assert.equal(experience.renderSample("unknown"), "");
});

test("XP display follows existing thresholds and handles promotion and the final rank", () => {
  const ranks = [[0,"见习生"],[250,"学徒"],[600,"实践者"]];
  assert.deepEqual(plain(experience.xpProgress(12, ranks)), {
    label:"12/250", title:"站内称号 · 见习生", next:"下一称号 学徒 · 还差 238 XP", percent:5
  });
  assert.equal(experience.xpProgress(250, ranks).percent, 0);
  assert.equal(experience.xpProgress(250, ranks).title, "站内称号 · 学徒");
  assert.equal(experience.xpProgress(700, ranks).label, "700 XP");
  assert.equal(experience.xpProgress(700, ranks).percent, 100);
});

// Execute the application's real persistence/complete functions against failure-capable boundaries.
function functionSource(name) {
  const start = source.indexOf("  function " + name + "(");
  assert.ok(start >= 0);
  const end = source.indexOf("\n  }\n", start);
  return source.slice(start, end + 5);
}

function completionHarness(failAt = 0) {
  const textarea = { value:"我会先明确学习目标、每天可用时间和希望完成的任务，再让 AI 给出计划并检查是否符合条件。", dataset:{reflectionKey:"0:0"}, closest:()=>null };
  const state = { activeLevel:0, reflections:{}, reflectionRewarded:{}, deepRead:{}, readFallback:{}, readRewarded:{} };
  let saves = 0;
  let xp = 0;
  const receipts = new Set();
  const messages = [];
  const context = vm.createContext({
    state, overlay:{querySelector:()=>textarea}, content:{querySelector:()=>({focus(){}})},
    course:{levels:[{}]}, completionLesson:null,
    saveState:()=>++saves !== failAt,
    lessonProgressKey:()=>"0:0", legacyLessonIndex:()=>null, getLegacyLevelState:()=>null,
    lessonIsRead:()=>Boolean(state.deepRead["0:0"]),
    reflectionIsComplete:()=>String(state.reflections["0:0"] || "").trim().length >= 20,
    updateReflectionUi(){}, refreshHomeSoon(){}, renderLibrary(){}, notify:message=>messages.push(message),
    window:{ addXP(amount, reason, receipt) { if (!receipts.has(receipt)) xp += amount; receipts.add(receipt); return true; } }
  });
  vm.runInContext(functionSource("saveCurrentReflection") + functionSource("markLessonRead"), context);
  return { context, state, textarea, messages, get xp(){ return xp; } };
}

test("combined completion persists reflection and awards the original 4 + 8 XP only once", () => {
  const h = completionHarness();
  h.context.markLessonRead(0);
  assert.equal(h.state.reflections["0:0"], h.textarea.value);
  assert.equal(h.state.deepRead["0:0"], true);
  assert.equal(h.xp, 12);
  h.context.markLessonRead(0);
  assert.equal(h.xp, 12);
});

test("failed reflection storage does not mark read or award XP; retry remains safe", () => {
  const h = completionHarness(1);
  h.context.markLessonRead(0);
  assert.equal(h.state.reflections["0:0"], undefined);
  assert.equal(h.state.deepRead["0:0"], undefined);
  assert.equal(h.xp, 0);
  assert.match(h.messages.at(-1), /未能保存/);
  h.context.markLessonRead(0);
  assert.equal(h.xp, 12);
});

test("too-short reflection is saved as a draft, not completed or rewarded", () => {
  const h = completionHarness();
  h.textarea.value = "先写清目标";
  h.context.markLessonRead(0);
  assert.equal(h.state.reflections["0:0"], "先写清目标");
  assert.equal(h.state.deepRead["0:0"], undefined);
  assert.equal(h.xp, 0);
});

test("failed read storage retains only the saved reflection reward, then retries without duplication", () => {
  const h = completionHarness(3);
  h.context.markLessonRead(0);
  assert.equal(h.state.deepRead["0:0"], undefined);
  assert.equal(h.xp, 4);
  h.context.markLessonRead(0);
  assert.equal(h.state.deepRead["0:0"], true);
  assert.equal(h.xp, 12);
});

test("home continuation respects the selected course, independent of the rank label", () => {
  const context = vm.createContext({state:{activeLevel:10}, course:{levels:Array(14)}, document:{getElementById:()=>({textContent:"第 1 关"})}});
  vm.runInContext(functionSource("homeLevelIndex"), context);
  assert.equal(context.homeLevelIndex(), 10);
});
