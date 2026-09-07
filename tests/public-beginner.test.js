"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

function loadCurriculum() {
  const html = read("index.html");
  const context = {};
  context.window = context;
  vm.createContext(context);
  const start = html.indexOf("var GAME_DATA =");
  const end = html.indexOf("/* ================= state", start);
  vm.runInContext(html.slice(start, end), context);
  for (const script of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
    if (!/\bdata-curriculum[\w-]*(?:\s|>)/.test(script[0])) continue;
    const file = script[1].split("?")[0];
    if (file === "curriculum-public-reading.js") {
      context.beforePublic = context.GAME_DATA.levels.map((level, index) =>
        (context.GOGOGO_DEEP_CURRICULUM.levels[index] || level.lessons).map(lesson => ({
          id:lesson.id, legacyIndex:lesson.legacyIndex, body:lesson.body
        }))
      );
    }
    vm.runInContext(read(file), context);
  }
  // Use the application's real bank assembly, including appended and replacement data.
  const app = read("unified-learning-upgrade.js");
  vm.runInContext(app.slice(0, app.indexOf("  var defaults =")) +
    "window.testBank = QUESTION_BANK; window.testMap = QUESTION_LESSONS; })();", context);
  return context;
}

test("public questions replace the engineering bank and link back to the card that teaches them", () => {
  const context = loadCurriculum();
  const questions = context.testBank[0];
  const lessons = context.GOGOGO_DEEP_CURRICULUM.levels[0];
  const ids = new Set();
  const counts = Array(lessons.length).fill(0);
  assert.equal(questions.length, 32);
  for (const question of questions) {
    assert.match(question.id, /^l1-public-\d+$/);
    assert.ok(!ids.has(question.id), "question IDs must be unique");
    ids.add(question.id);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
    assert.equal(new Set(question.options).size, question.options.length, "duplicate options make grading ambiguous");
    const cardNumber = context.testMap[0][question.id];
    assert.equal(cardNumber, question.lesson + 1, "renderQuestion uses one-based card numbers");
    assert.ok(lessons[cardNumber - 1].beginnerBody);
    counts[cardNumber - 1]++;
  }
  assert.deepEqual(counts, Array(8).fill(4));
  assert.ok(context.testBank[1].some((item) => item.id === "l2-public-01"), "later public training must be available");
});

test("all 120 cards retain their original storage identity and professional reading", () => {
  const context = loadCurriculum();
  const expectedCounts = [8,12,14,14,4,4,8,8,8,8,8,8,8,8];
  let count = 0;
  context.GAME_DATA.levels.forEach((level, index) => {
    const lessons = context.GOGOGO_DEEP_CURRICULUM.levels[index] || level.lessons;
    assert.equal(lessons.length, expectedCounts[index]);
    lessons.forEach((lesson, lessonIndex) => {
      const original = context.beforePublic[index][lessonIndex];
      assert.equal(lesson.id, original.id, "do not assign new IDs to historically index-keyed cards");
      assert.equal(lesson.legacyIndex, original.legacyIndex);
      assert.equal(lesson.body, original.body, "the full reading must remain recoverable");
      assert.ok(lesson.beginnerCore && lesson.beginnerBody && lesson.reflectionPrompt,`missing public reading at ${index+1}:${lessonIndex+1}`);
      assert.equal(lesson.reflectionChecks.length,3);
      if (index > 0) {
        assert.equal(lesson.title, lesson.t, "snapshot and course title must agree");
        assert.equal(lesson.publicReadingVersion,"20260905-public2");
        assert.match(lesson.beginnerBody,/自己试一下/);
      }
      count++;
    });
  });
  assert.equal(count,120);
});

test("every active training bank uses public questions and points to the correct lesson", () => {
  const context = loadCurriculum();
  let total = 0;
  context.GAME_DATA.levels.forEach((level, index) => {
    const lessons = context.GOGOGO_DEEP_CURRICULUM.levels[index] || level.lessons;
    const bank = context.testBank[index];
    const perLesson = index === 0 ? 4 : 2;
    assert.equal(bank.length,lessons.length * perLesson);
    assert.ok(bank.length >= (index >= 6 ? 12 : 8));
    const seen = new Set();
    const prompts = new Set();
    const coverage = Array(lessons.length).fill(0);
    for (const question of bank) {
      assert.ok(question.id.startsWith(`l${index+1}-public-`));
      assert.ok(!seen.has(question.id));
      seen.add(question.id);
      assert.ok(!prompts.has(question.q),`duplicate question wording in level ${index+1}`);
      prompts.add(question.q);
      const number = context.testMap[index][question.id];
      assert.equal(number,question.lesson+1);
      assert.ok(lessons[number-1]);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
      assert.equal(new Set(question.options).size,question.options.length);
      coverage[number-1]++;
      total++;
    }
    assert.deepEqual(coverage,Array(lessons.length).fill(perLesson));
  });
  assert.equal(total,256);
});

test("specialist introductions are optional practice, not a personal hardware or portfolio plan", () => {
  const context = loadCurriculum();
  context.GAME_DATA.levels.slice(6).forEach(level => {
    assert.match(level.weeks,/选学/);
    assert.ok(level.publicPractice);
    assert.doesNotMatch(level.goal+level.publicPractice,/你的十年|macOS|2 个核心项目/);
  });
  assert.match(read("unified-learning-upgrade.js"),/if \(level\.publicPractice\)/);
});

test("lesson navigation scrolls with the text instead of covering it", () => {
  const css = read("unified-learning-upgrade.css");
  assert.match(css,/\.ul-back\s*\{\s*position: static;/);
  assert.match(css,/\.ul-lesson-head\s*\{\s*position: static !important;/);
});

test("all public reading assets are loaded in order and included in the deployment whitelist", () => {
  const html = read("index.html");
  assert.equal(html,read("AI从业者闯关之路.html"));
  const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g),match=>match[1].split("?")[0]);
  const runtime = scripts.indexOf("curriculum-public-reading.js");
  assert.ok(runtime > scripts.indexOf("curriculum-reflection-prompts.js"));
  for (const file of ["curriculum-public-reading.js","curriculum-public-foundations.js","curriculum-public-practice.js","curriculum-public-specialist.js"]) {
    assert.ok(scripts.indexOf(file) >= runtime && scripts.indexOf(file) < scripts.indexOf("unified-learning-upgrade.js"));
    assert.ok(fs.existsSync(path.join(root,file)));
    assert.ok(read("deploy-cloudflare.sh").includes(file),`${file} missing from deployment package`);
  }
});

test("lesson IDs stay stable so existing notes and reflections still attach to the same concepts", () => {
  const { GOGOGO_DEEP_CURRICULUM: curriculum } = loadCurriculum();
  const lessons = curriculum.levels[0];
  assert.deepEqual(Array.from(lessons, (item) => item.id), [
    "l1-task-spec", "l1-system-roles", "l1-evals-basics", "l1-hard-soft-metrics",
    "l1-source-of-truth", "l1-metrics-thresholds", "l1-eval-set", "l1-capstone"
  ]);
  for (const lesson of lessons) {
    assert.ok(lesson.body.length > lesson.beginnerBody.length, "the full professional reading must be retained");
    assert.ok(lesson.reflectionPrompt && lesson.reflectionChecks.length === 3);
    assert.doesNotMatch(lesson.beginnerBody + lesson.reflectionPrompt, /会员余额|Source of Truth|HITL|幂等键|你的十年|你笔记里的/);
  }
});

test("legacy exercises use supported renderers and valid categories, and still have the same save slots", () => {
  const { GAME_DATA: course } = loadCurriculum();
  const exercises = course.levels[0].exercises;
  const supported = new Set(Array.from(read("index.html").matchAll(/ex\.type==="([a-z]+)"/g), (match) => match[1]));
  assert.deepEqual(Array.from(exercises, (item) => item.id), ["e1", "e2", "e3", "e4"]);
  for (const exercise of exercises) {
    assert.ok(supported.has(exercise.type), `${exercise.id} has no exercise renderer`);
    if (exercise.type === "classify") {
      for (const item of exercise.items) assert.ok(item.c >= 0 && item.c < exercise.cats.length && item.e);
    }
    if (exercise.type === "order") {
      assert.ok(exercise.steps.length >= 3);
      assert.equal(new Set(exercise.steps).size, exercise.steps.length);
    }
  }
});
