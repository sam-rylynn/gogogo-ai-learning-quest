(function () {
  "use strict";

  var course = window.GAME_DATA;
  var curriculum = window.GOGOGO_DEEP_CURRICULUM;
  if (!course || !curriculum) return;

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function prose(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function applyLevel(levelIndex, config) {
    var level = course.levels[levelIndex];
    if (!level) throw new Error("Unknown public curriculum level: " + levelIndex);
    var lessons = curriculum.levels[levelIndex] || level.lessons;
    var specs = config.lessons;
    if (!Array.isArray(specs) || specs.length !== lessons.length) {
      throw new Error("Public lesson count does not match level " + (levelIndex + 1));
    }

    // Validate the whole level before modifying it. Lesson order and storage keys are contracts.
    specs.forEach(function (spec, index) {
      var lesson = lessons[index];
      if (lesson.id ? spec.id !== lesson.id : spec.index !== index) {
        throw new Error("Public lesson identity mismatch at " + levelIndex + ":" + index);
      }
      ["title", "core", "plain", "example", "practice", "check"].forEach(function (field) {
        if (typeof spec[field] !== "string" || !spec[field].trim()) throw new Error("Missing " + field + " at " + levelIndex + ":" + index);
      });
      if (!Array.isArray(spec.checks) || spec.checks.length !== 3 || spec.checks.some(function (item) { return typeof item !== "string" || !item; })) {
        throw new Error("Invalid reflection checks at " + levelIndex + ":" + index);
      }
      if (!Array.isArray(spec.terms) || spec.terms.length > 2 || spec.terms.some(function (term) {
        return !Array.isArray(term) || term.length !== 2 || term.some(function (value) { return typeof value !== "string" || !value; });
      })) throw new Error("Invalid public terms at " + levelIndex + ":" + index);
      if (!Array.isArray(spec.questions) || spec.questions.length !== 2) throw new Error("Two questions required per public card");
      spec.questions.forEach(function (question) {
        var options = question[1];
        if (question.length !== 4 || typeof question[0] !== "string" || !question[0] || typeof question[3] !== "string" || !question[3] ||
          !Array.isArray(options) || options.length < 3 || options.length > 4 ||
          options.some(function (option) { return typeof option !== "string" || !option; }) ||
          new Set(options).size !== options.length || !Number.isInteger(question[2]) || question[2] < 0 || question[2] >= options.length) {
          throw new Error("Invalid public question at " + levelIndex + ":" + index);
        }
      });
    });

    var questions = [];
    var links = {};
    specs.forEach(function (spec, index) {
      var lesson = lessons[index];
      lesson.t = spec.title;
      lesson.title = spec.title;
      lesson.card = [spec.title, spec.core];
      lesson.beginnerCore = spec.core;
      lesson.beginnerBody = '<p>' + prose(spec.plain) + '</p>' +
        '<div class="ul-analogy-card"><b>看一个例子</b><p>' + prose(spec.example) + '</p></div>' +
        '<div class="ul-checkpoint"><b>自己试一下</b><p>' + prose(spec.practice) + '</p></div>' +
        (spec.terms.length ? '<h2>认识本课的词</h2><div class="ul-concept-grid">' + spec.terms.map(function (term) {
          return '<div><strong>' + esc(term[0]) + '</strong><span>' + prose(term[1]) + '</span></div>';
        }).join("") + '</div>' : "");
      lesson.reflectionPrompt = spec.check;
      lesson.reflectionChecks = spec.checks.slice();
      lesson.readingLabel = "跟着例子试一次";
      lesson.detailLabel = "进阶选读：这件事背后的专业知识";
      lesson.detailHint = "可稍后再看；本关练习只考上面的内容";
      lesson.publicReadingVersion = "20260905-public2";
      // Keep body, legacyIndex, id and all user records untouched.
      spec.questions.forEach(function (question, questionIndex) {
        var id = "l" + (levelIndex + 1) + "-public-" + String(index * 2 + questionIndex + 1).padStart(2, "0");
        questions.push({id: id, lesson: index, type: "choice", q: question[0], options: question[1].slice(), answer: question[2], explain: question[3], tag: spec.title});
        links[id] = index + 1;
      });
    });
    curriculum.levels[levelIndex] = lessons;
    curriculum.questionBankOverrides = curriculum.questionBankOverrides || {};
    curriculum.questionBankOverrides[levelIndex] = questions;
    curriculum.questionLessons[levelIndex] = links;
    curriculum.questionGuides[levelIndex] = {};
    level.quiz = questions.map(function (question) { return {q: question.q, o: question.options, a: question.answer, e: question.explain}; });
    curriculum.audit[levelIndex] = Object.assign({}, curriculum.audit[levelIndex], {
      publicReadingVersion: "20260905-public2", lessonCount: lessons.length, publicQuestionCount: questions.length
    });
    curriculum.version = "20260905-public2";
  }

  window.GOGO_PUBLIC_READING = {applyLevel: applyLevel};

  // Chapter topics stay stable for existing progress and certificate links.
  var introductions = {
    1: ["代码基础 · 选学", "想看懂 AI 写的代码，可以从变量、表格数据和接口开始。只想练办公应用，也可以先看第 7、11 关。"],
    2: ["模型基础 · 选学", "用小数据和生活例子理解模型怎样学习、怎样判断好坏。可以先手算，不需要训练模型。"],
    3: ["大模型原理 · 选学", "逐步理解大模型怎样处理文字。想先学工具使用，可以稍后再回来读这一关。"],
    4: ["应用开发 · 选学", "用资料问答和小任务认识检索、工具与数据格式。先画出流程，再决定是否实际搭建。"],
    5: ["产品实践 · 选学", "从身边的小问题开始，学会提问、比较方案和检查结果。没有项目也可以用课内模拟材料练习。"],
    6: ["工作助手 · 选学", "通过办公例子认识助手、技能、连接器和自动化。可以先做纸面练习，再在合适的工具中尝试。"],
    7: ["智能体搭建 · 选学", "按步骤认识智能体的资料、工具和工作流。先把例子里的输入与输出弄懂，再动手搭建。"],
    8: ["代码与部署 · 选学", "想让 AI 帮你开发应用时，再来理解终端、版本和部署。办公与内容学习无需先完成这一关。"],
    9: ["产品方法 · 选学", "用具体的小问题练习找需求、画流程、判断方案。练习材料已经给出，不要求商业项目经验。"],
    10: ["办公与运营 · 选学", "从通知、PPT、表格和客服例子开始，学会说明要求、整理材料和检查结果。"],
    11: ["图像创作 · 选学", "先学描述画面、比较结果与局部修改，再了解更复杂的图像工作流。练习可先在纸上完成。"],
    12: ["影音创作 · 选学", "从一段短片的脚本和镜头开始，理解声音、剪辑和检查方法。无需一次掌握所有软件。"],
    13: ["作品整理 · 选学", "从一个学习小项目整理做法、结果与不足。模拟练习可以明确标注，不需要假装有商业经历。"]
  };
  Object.keys(introductions).forEach(function (index) {
    course.levels[index].weeks = introductions[index][0];
    course.levels[index].goal = introductions[index][1];
  });
  var optionalPractice = [
    "用课内材料画出一个办公助手的处理步骤。",
    "用图书馆例子画出输入、查资料、回答和异常处理。",
    "为课内示例写一份修改、检查和恢复旧版本的清单。",
    "用读书会例子写清问题、页面流程和检查标准。",
    "选通知、PPT 或表格中的一个小任务，整理输入和检查清单。",
    "写一份画面描述，比较两个方案并说明要修改哪里。",
    "为一段短片写脚本和镜头表，标出声音与素材来源。",
    "把一个学习练习整理成案例，说明做法、结果和不足。"
  ];
  optionalPractice.forEach(function (description, index) {
    course.levels[index + 6].publicPractice = description;
  });
  if (course.advancedCertificateRoute) {
    course.advancedCertificateRoute.weeks = "按学习目标选择方向";
    course.advancedCertificateRoute.dailyLoad = "每次完成一张课卡和一个小练习，可自行安排时间";
  }
})();
