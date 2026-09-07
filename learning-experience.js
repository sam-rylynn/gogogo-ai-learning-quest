(function (root) {
  "use strict";

  const routes = [
    { id: "all", label: "全部课程", levels: null },
    { id: "beginner", label: "零基础", levels: [0, 10] },
    { id: "work", label: "办公与内容", levels: [10, 6, 11, 12, 13] },
    { id: "build", label: "开发进阶", levels: [1, 2, 3, 4, 7, 8, 9, 5] },
    { id: "certificate", label: "考证准备", levels: [0, 6, 7, 9, 10, 13] }
  ];

  function courseLink(level, lesson) {
    const number = Number(level);
    if (!Number.isInteger(number) || number < 1 || number > 14) return "index.html";
    return "index.html?learn=" + number + (Number.isInteger(lesson) && lesson >= 0 ? "&card=" + (lesson + 1) : "");
  }

  function parseLaunch(search, lessonCounts) {
    const params = new URLSearchParams(search);
    const value = params.get("learn");
    if (!value || !/^\d+$/.test(value)) return null;
    const level = Number(value) - 1;
    if (level < 0 || level >= lessonCounts.length) return null;
    const card = params.get("card");
    const lesson = card && /^\d+$/.test(card) ? Number(card) - 1 : null;
    return { level: level, lesson: lesson !== null && lesson >= 0 && lesson < lessonCounts[level] ? lesson : null };
  }

  function xpProgress(total, ranks) {
    const xp = Math.max(0, Number(total) || 0);
    let current = ranks[0];
    let next = null;
    for (const rank of ranks) {
      if (xp >= rank[0]) current = rank;
      else { next = rank; break; }
    }
    return {
      label: next ? xp + "/" + next[0] : xp + " XP",
      title: "站内称号 · " + current[1],
      next: next ? "下一称号 " + next[1] + " · 还差 " + (next[0] - xp) + " XP" : "已到达当前路线最高称号",
      percent: next ? Math.min(100, Math.round((xp - current[0]) / (next[0] - current[0]) * 100)) : 100
    };
  }

  // Authored teaching examples, not generated work or learner records.
  const samples = {
    todo: {
      title: "零散笔记 → 一张待办表",
      input: "小李周三交海报；报名表需修改，负责人未定。",
      output: '<table><caption>整理后的待办</caption><thead><tr><th>事项</th><th>负责人</th><th>截止时间</th></tr></thead><tbody><tr><td>交海报</td><td>小李</td><td>周三</td></tr><tr><td>修改报名表</td><td>未定</td><td>未提供</td></tr></tbody></table>',
      note: "第二行没有补造负责人和日期。把事情分开，缺什么就保留什么。",
      lesson: [0, 7], workflow: "meeting-actions"
    },
    slides: {
      title: "一段想法 → 三页建议型 PPT",
      input: "读书会报名信息总是散落在群里。我想试用一张共享报名表，只收昵称和参加日期，先试一周。",
      output: '<div class="lx-slides"><section><small>01 / 问题</small><h4>信息散，容易漏人</h4><p>昵称与日期分散在多条聊天里，每次都要重新整理。</p></section><section><small>02 / 建议</small><h4>一张表，收齐两项信息</h4><p>只填昵称和参加日期；表格不设为公开可见。</p></section><section><small>03 / 下一步</small><h4>试一周，再作决定</h4><p>组织者记录遗漏与整理时间，再决定是否继续使用。</p></section></div>',
      note: "每页只回答一个问题：为什么改、怎么改、下一步做什么。不把尚未测量的提效写成事实。",
      lesson: [10, 3], workflow: "presentation"
    },
    visual: {
      title: "同一只白杯，换一个观察角度",
      input: "白色杯子放在木桌中央，背景简洁。比较时只把“正面”改为“俯视”，其他条件保持一致。",
      output: '<div class="lx-visual-pair"><figure><svg viewBox="0 0 240 150" role="img" aria-label="示意图 A：正面看到白杯侧面与杯把"><rect width="240" height="150" fill="#18313b"/><path d="M0 114H240V150H0Z" fill="#725234"/><path d="M143 51H172V97H143" fill="none" stroke="#e8e4d4" stroke-width="12"/><path d="M69 44H146V116H69Z" fill="#e8e4d4"/><path d="M69 44H146V57H69Z" fill="#b9c7c5"/></svg><figcaption>A · 正面：杯身高度更清楚</figcaption></figure><figure><svg viewBox="0 0 240 150" role="img" aria-label="示意图 B：俯视看到白杯杯口与杯把"><rect width="240" height="150" fill="#725234"/><path d="M0 30H240M0 100H240" stroke="#8f6844" stroke-width="3"/><path d="M150 61H180V91H150" fill="none" stroke="#e8e4d4" stroke-width="12"/><circle cx="112" cy="75" r="47" fill="#e8e4d4"/><circle cx="112" cy="75" r="34" fill="#354b50"/></svg><figcaption>B · 俯视：杯口与桌面更清楚</figcaption></figure></div>',
      note: "这是构图教学示意图，不是某个模型的生成结果。真实生成还受模型、种子与其他设置影响，固定条件也不保证像素一致。",
      lesson: [11, 0], workflow: "visual-package"
    },
    weekly: {
      title: "原始记录 → 一段有依据的周报",
      input: "周二发了活动通知；截至周五收到 12 人报名；场地还没确认，小林周一继续联系。",
      output: '<dl class="lx-report"><dt>本周结果</dt><dd>已发活动通知，截至周五收到 12 人报名。</dd><dt>依据</dt><dd>原始记录；正式使用前还需核对通知发送记录与报名表。</dd><dt>未完成</dt><dd>场地尚未确认。</dd><dt>下一步</dt><dd>小林周一继续联系场地，确认后更新通知。</dd></dl>',
      note: "“继续联系”没有写成“场地已落实”；12 人报名也不等于 12 人已经到场。",
      lesson: [10, 2], workflow: "weekly-report"
    }
  };

  function renderSample(id) {
    const sample = samples[id];
    if (!sample) return "";
    return '<details class="lx-sample"><summary>看成果示例 · ' + sample.title + '</summary><div class="lx-sample-body"><p class="lx-sample-label">教学示例 · 非真实用户资料</p><h3>给 AI 的材料</h3><blockquote>' + sample.input + '</blockquote><h3>结果长这样</h3>' + sample.output + '<p class="lx-sample-note">' + sample.note + '</p></div></details>';
  }

  function sampleForLesson(level, lesson) {
    return Object.keys(samples).find(function (id) { return samples[id].lesson[0] === level && samples[id].lesson[1] === lesson; });
  }

  root.GOGO_LEARNING_EXPERIENCE = { routes: routes, courseLink: courseLink, parseLaunch: parseLaunch, xpProgress: xpProgress, samples: samples, renderSample: renderSample, sampleForLesson: sampleForLesson };
})(typeof window !== "undefined" ? window : globalThis);
