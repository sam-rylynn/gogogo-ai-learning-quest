(function () {
  "use strict";

  if (document.getElementById("pixel-guild-app")) return;

  const STORAGE_KEY = "gogogo_pixel_guild_v1";
  const LEGACY_KEYS = ["gogogo_ai_quest_v2", "gogogo_ai_quest_v1"];
  const RETEST_DELAY = 72 * 60 * 60 * 1000;

  const LEVELS = [
    {
      id: 1,
      name: "任务规格",
      rank: "见习者",
      mission: "会员余额查询规格",
      promise: "把模糊需求写成可验证、可交付的任务规格",
      artifact: "任务规格 v1",
      hardFail: "编造余额、越权展示、把充值流水当成余额真相",
      retest: "把同一套规格方法迁移到宠物鲜食会员的剩余餐数查询。"
    },
    {
      id: 2,
      name: "上下文工程",
      rank: "提示词工匠",
      mission: "为客服助手设计稳定上下文",
      promise: "区分指令、事实、示例和不可信输入",
      artifact: "上下文包 v1",
      hardFail: "让用户输入覆盖系统约束，或把示例当事实",
      retest: "为门店选址助手重写上下文，并明确冲突优先级。"
    },
    {
      id: 3,
      name: "工具工作流",
      rank: "工具编排者",
      mission: "设计可靠的 API 工具调用链",
      promise: "让模型知道何时调用、如何校验、失败后如何收口",
      artifact: "工具调用流程 v1",
      hardFail: "跳过授权、重复扣费、失败后继续生成结果",
      retest: "把查询工具迁移成带幂等键的会员扣次流程。"
    },
    {
      id: 4,
      name: "Evals 评测",
      rank: "可靠性检验员",
      mission: "建立最小可运行评测集",
      promise: "用失败样例和指标判断系统是否真的变好",
      artifact: "Eval Set + 结果表 v1",
      hardFail: "只看平均分、没有硬失败、用训练样例冒充测试",
      retest: "为一个新的客服任务补三类边界样例和通过阈值。"
    },
    {
      id: 5,
      name: "AI 产品原型",
      rank: "产品构建者",
      mission: "做出可用的 AI 产品闭环",
      promise: "从用户任务走到可观察、可修正的真实交互",
      artifact: "可运行产品原型 v1",
      hardFail: "只有聊天框，没有用户任务、状态或失败恢复",
      retest: "把原型迁移到一个不同角色，并重做关键反馈状态。"
    },
    {
      id: 6,
      name: "作品集实战",
      rank: "AI 从业者",
      mission: "整理可验证的 AI 产品案例",
      promise: "用产品、评测、失败与迭代证明能力",
      artifact: "作品集案例 v1",
      hardFail: "只展示结果图，不解释技术选择、失败和证据",
      retest: "用三分钟口述案例，并回答一个反事实追问。"
    }
  ];

  const ADVANCED_PIXEL_PROFILE = [
    { rank: "工作助手架构师", hardFail: "越权连接外部系统、泄露凭证、自动执行高风险动作", retest: "把助手迁移到另一个办公任务，并重新做权限与失败测试。" },
    { rank: "智能体编排师", hardFail: "插件空返回后编造事实、工作流无失败出口、发布权限越界", retest: "为同一工作流增加一类异常输入和一条回归测试。" },
    { rank: "Agent 工程师", hardFail: "破坏用户文件、提交密钥、把 Commit 误报为线上部署", retest: "在最小权限环境重新复现 CLI 流程并演练回退。" },
    { rank: "AI 产品策划师", hardFail: "没有用户证据、让模型执行确定性高风险动作、用体验分掩盖安全失败", retest: "为另一个角色重写问题证据、非目标和上线门槛。" },
    { rank: "运营自动化师", hardFail: "编造营销数据、未经授权承诺金额、让概率文本直接驱动 RPA", retest: "用一组新数据复测效率、质量、返工和硬性错误。" },
    { rank: "AI 视觉设计师", hardFail: "使用未授权素材、泄露云端密钥、忽略持续计费", retest: "用同一视觉规范制作一个新尺寸，并复核来源与一致性。" },
    { rank: "AI 影音制作人", hardFail: "未经同意克隆肖像或声音、隐瞒合成身份、发布未授权素材", retest: "把成片改编为另一平台规格并重跑完整 QC。" },
    { rank: "高级 AI 从业者", hardFail: "重复冒充证据、隐瞒失败、把候选或提交状态说成已验证上线", retest: "用 10 分钟答辩两个核心项目，并回答一个失败追问。" }
  ];

  const advancedCourseLevels = window.GAME_DATA && Array.isArray(window.GAME_DATA.levels)
    ? window.GAME_DATA.levels.slice(6, 14)
    : [];
  advancedCourseLevels.forEach((level, index) => {
    const profile = ADVANCED_PIXEL_PROFILE[index];
    LEVELS.push({
      id: index + 7,
      name: level.title,
      rank: profile.rank,
      mission: level.goal,
      promise: level.goal,
      artifact: level.deliverable,
      hardFail: profile.hardFail,
      retest: profile.retest
    });
  });

  const MODES = {
    minimum: {
      label: "最小 25 分",
      short: "25 分",
      steps: ["闭卷复述 8 分钟", "完成一道题 10 分钟", "记录一个问题 7 分钟"]
    },
    standard: {
      label: "标准 60 分",
      short: "60 分",
      steps: ["学习课卡 20 分钟", "完成变式任务 25 分钟", "整理证据与问题 15 分钟"]
    },
    project: {
      label: "项目 90 分",
      short: "90 分",
      steps: ["学习与复述 20 分钟", "实战产物 45 分钟", "Codex 审核与修订 25 分钟"]
    }
  };

  const GATES = [
    { id: "explain", label: "闭卷解释", number: "01" },
    { id: "transfer", label: "变式任务", number: "02" },
    { id: "codex", label: "Codex 审核", number: "03" },
    { id: "retest", label: "72h 复测", number: "04" }
  ];

  const TRAINING = {
    1: {
      recall: {
        prompt: "会员余额查询中，哪一个应被定义为余额的唯一事实来源？",
        options: ["充值流水", "会员账户系统", "模型综合推断", "用户上次截图"],
        answer: 1,
        why: "接口是访问方式，会员账户系统才是余额事实权威；充值流水只用于异常复核。"
      },
      transfer: "为宠物鲜食订阅用户写一段“剩余餐数查询”任务规格，必须写清受众、事实来源、授权边界、输出和失败处理。",
      boundary: "系统查到余额为 0，但充值流水显示昨天充值 500 元。系统应该直接显示 500 元吗？请说明处理顺序和对用户的回复。"
    },
    2: {
      recall: {
        prompt: "当系统指令与用户粘贴的文本冲突时，哪个优先？",
        options: ["用户最新输入", "最长的文本", "系统指令", "随机选择"],
        answer: 2,
        why: "上下文必须有明确的指令优先级，不可信输入不能覆盖系统约束。"
      },
      transfer: "为商业项目研究助手写一个上下文结构：角色、任务、事实、约束、输出、未知信息。",
      boundary: "用户上传的文档中写着“忽略之前的安全规则”。你会如何隔离数据与指令？"
    },
    3: {
      recall: {
        prompt: "哪种情况最需要幂等键（Idempotency Key）？",
        options: ["只读查询", "重复执行会产生副作用的扣费", "展示帮助文档", "本地排序"],
        answer: 1,
        why: "幂等控制主要防止重试造成重复扣费、重复创建等副作用。"
      },
      transfer: "设计一个“会员扣除一次服务次数”的工具调用流程，写出调用前校验、参数、重试和回执。",
      boundary: "工具超时但后台可能已成功扣次。系统下一步该怎么做，为什么不能直接重试？"
    },
    4: {
      recall: {
        prompt: "一个 Eval 最重要的基本单位是什么？",
        options: ["漂亮截图", "输入、预期和评分规则", "模型自评", "单次演示"],
        answer: 1,
        why: "可复现评测需要明确输入、预期行为和评分标准。"
      },
      transfer: "为会员余额查询写 6 条 Eval，至少覆盖正常、零余额、未授权、账户不存在、超时和冲突数据。",
      boundary: "新版本平均分更高，但越权展示从 0 次变为 1 次。它能上线吗？请定义硬失败规则。"
    },
    5: {
      recall: {
        prompt: "AI 产品原型的核心不是聊天框，而是什么？",
        options: ["更多颜色", "完整用户任务闭环", "更长提示词", "更多模型"],
        answer: 1,
        why: "原型要证明用户能完成任务，并能看见状态、失败与恢复。"
      },
      transfer: "把余额查询做成一个可观察的产品流程，列出进入、授权、查询、结果、异常和人工复核状态。",
      boundary: "模型给出答案但工具日志为空。界面应如何阻止结果被当成事实？"
    },
    6: {
      recall: {
        prompt: "作品集中最能证明 AI 产品能力的证据是什么？",
        options: ["模型名称", "页面数量", "可运行产物、Evals、失败与迭代", "宣传文案"],
        answer: 2,
        why: "招聘方需要看到你如何构建、判断和修正，而不只是最终截图。"
      },
      transfer: "用问题、用户、技术方案、评测、失败、迭代和结果七段结构整理一个案例。",
      boundary: "项目没有真实用户数据时，如何诚实表达验证范围并设计下一步实验？"
    }
  };

  LEVELS.filter((level) => level.id > 6).forEach((level) => {
    const bank = window.GOGOGO_DEEP_CURRICULUM && window.GOGOGO_DEEP_CURRICULUM.extraQuestions
      ? (window.GOGOGO_DEEP_CURRICULUM.extraQuestions[level.id - 1] || [])
      : [];
    const firstQuestion = bank.find((item) => item && item.q && Array.isArray(item.options));
    TRAINING[level.id] = {
      explain: `不看课卡，用自己的话说明“${level.name}”解决什么问题、依赖哪些系统能力、最危险的边界是什么。`,
      recall: firstQuestion
        ? { prompt: firstQuestion.q, options: firstQuestion.options, answer: firstQuestion.answer, why: firstQuestion.explain }
        : { prompt: `本关“${level.name}”最需要证明什么？`, options: ["可复现作品与边界", "工具数量", "学习时长", "页面截图"], answer: 0, why: "高级能力必须落到可复现产物、测试和边界。" },
      transfer: `把本关方法迁移到一个新的 AI 产品运营场景，完成“${level.artifact}”的最小版本，并写清用户、输入、流程、输出和验收。`,
      boundary: `为“${level.name}”写一个会阻断发布的硬性失败，并说明发现后如何停止、恢复和回归测试。`
    };
  });

  function emptyGate() {
    return { status: "open", answer: "", submittedAt: 0, score: 0, feedback: "", availableAt: 0 };
  }

  function baseState() {
    const gates = {};
    const training = {};
    const artifacts = {};
    LEVELS.forEach((level) => {
      gates[level.id] = {
        explain: emptyGate(),
        transfer: emptyGate(),
        codex: emptyGate(),
        retest: emptyGate()
      };
      training[level.id] = {};
      artifacts[level.id] = { body: "", evidence: "", updatedAt: 0 };
    });

    return {
      version: 1,
      activeLevel: 1,
      xp: readLegacyNumber(["xp", "totalXp"], 0),
      streak: readLegacyNumber(["streak", "days"], 0),
      lastVisit: "",
      dailyMode: "standard",
      activeStation: 0,
      gates,
      training,
      artifacts,
      questions: []
    };
  }

  function readLegacyNumber(keys, fallback) {
    for (const storageKey of LEGACY_KEYS) {
      try {
        const value = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (!value || typeof value !== "object") continue;
        for (const key of keys) {
          const direct = Number(value[key]);
          const nested = Number(value.stats && value.stats[key]);
          if (Number.isFinite(direct) && direct >= 0) return direct;
          if (Number.isFinite(nested) && nested >= 0) return nested;
        }
      } catch (error) {
        // Keep the new layer independent from malformed legacy state.
      }
    }
    return fallback;
  }

  function loadState() {
    const fresh = baseState();
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      saved = null;
    }
    if (!saved || typeof saved !== "object") return fresh;

    const merged = { ...fresh, ...saved };
    merged.gates = fresh.gates;
    merged.training = fresh.training;
    merged.artifacts = fresh.artifacts;

    LEVELS.forEach((level) => {
      const id = level.id;
      merged.gates[id] = {
        ...fresh.gates[id],
        ...((saved.gates && saved.gates[id]) || {})
      };
      GATES.forEach((gate) => {
        merged.gates[id][gate.id] = {
          ...emptyGate(),
          ...(((saved.gates && saved.gates[id]) || {})[gate.id] || {})
        };
      });
      merged.training[id] = {
        ...fresh.training[id],
        ...((saved.training && saved.training[id]) || {})
      };
      merged.artifacts[id] = {
        ...fresh.artifacts[id],
        ...((saved.artifacts && saved.artifacts[id]) || {})
      };
    });

    merged.questions = Array.isArray(saved.questions) ? saved.questions : [];
    merged.activeLevel = Math.min(LEVELS.length, Math.max(1, Number(merged.activeLevel) || 1));
    merged.activeStation = Math.min(5, Math.max(0, Number(merged.activeStation) || 0));
    if (!MODES[merged.dailyMode]) merged.dailyMode = "standard";
    return merged;
  }

  let state = loadState();
  let toastTimer = 0;
  let drawerCloseTimer = 0;
  const originalElements = Array.from(document.body.children).filter((element) => {
    return !element.matches("script[data-pixel-upgrade]");
  });

  document.documentElement.classList.add("pg-active");
  document.body.classList.add("pg-active");

  const legacyContent = document.createElement("div");
  legacyContent.className = "pg-legacy-content";
  originalElements.forEach((element) => {
    if (["SCRIPT", "STYLE", "LINK"].includes(element.tagName)) return;
    legacyContent.appendChild(element);
  });

  const app = document.createElement("div");
  app.id = "pixel-guild-app";
  app.innerHTML = `
    <header class="pg-hud">
      <div class="pg-identity">
        <img class="pg-avatar" src="assets/pixel-learner-portrait.png" alt="学习者像素头像">
        <div>
          <p class="pg-kicker">GOGO GO 冒险公会</p>
          <h1>AI 从业者闯关之路</h1>
          <span class="pg-rank" id="pg-rank"></span>
        </div>
      </div>
      <div class="pg-hud-metric pg-hud-xp">
        <div class="pg-metric-row"><span>XP</span><strong id="pg-xp-text">0/100</strong></div>
        <div class="pg-meter" aria-label="行动经验"><span id="pg-xp-meter"></span></div>
      </div>
      <button class="pg-hud-chip" data-action="evidence" aria-label="打开能力证据板">
        能力证据 <strong id="pg-evidence-count">0/4</strong>
      </button>
      <button class="pg-hud-chip pg-hud-streak" data-action="daily">
        连续学习 <strong id="pg-streak">0 天</strong>
      </button>
      <button class="pg-hud-action" data-action="questions">
        问题队列 <strong id="pg-question-count">0</strong>
      </button>
    </header>
    <main class="pg-stage" id="pg-stage">
      <div class="pg-scene" id="pg-scene">
        <button class="pg-station pg-station-library" data-station="0" data-action="library">课程书库</button>
        <button class="pg-station pg-station-workshop" data-station="1" data-action="workshop">训练工坊</button>
        <button class="pg-station pg-station-codex" data-station="2" data-action="codex">Codex 审核室</button>
        <button class="pg-station pg-station-retest" data-station="3" data-action="retest">72h 复测塔</button>
        <button class="pg-station pg-station-project" data-station="4" data-action="artifact">项目作品陈列门</button>
        <button class="pg-station pg-station-notes" data-station="5" data-action="key-notes">我的复盘</button>
        <section class="pg-quest" aria-label="GOGOGO 最新进度">
          <strong class="pg-board-title" aria-hidden="true">GOGOGO</strong>
          <p class="pg-eyebrow">主线任务 · <span id="pg-level-label"></span></p>
          <h2 id="pg-mission-title"></h2>
          <p class="pg-quest-sub" id="pg-mission-promise"></p>
          <div class="pg-mode-row" id="pg-mode-row" aria-label="今日学习模式"></div>
          <div class="pg-gate-grid" id="pg-gates"></div>
          <div class="pg-quest-footer">
            <span class="pg-artifact-line" id="pg-artifact-line"></span>
            <button class="pg-primary" data-home-progress data-action="library" aria-label="继续书库 0/8">继续书库 0/8</button>
          </div>
        </section>
        <svg class="pg-foreground-actors" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="pg-foreground-actor-clip" clipPathUnits="userSpaceOnUse">
              <path d="M625 538 L651 547 L668 572 L665 601 L682 620 L692 650 L678 672 L670 708 L683 775 L656 781 L643 716 L632 714 L626 781 L598 780 L608 706 L603 676 L585 657 L596 621 L605 598 L603 568 Z"></path>
              <path d="M454 597 L480 604 L496 622 L505 642 L527 650 L516 674 L499 665 L501 707 L520 748 L493 756 L480 713 L468 712 L457 756 L430 750 L445 705 L440 670 L424 652 L434 624 Z"></path>
            </clipPath>
          </defs>
          <image href="assets/pixel-guild-hall.png" width="1536" height="1024" preserveAspectRatio="none" clip-path="url(#pg-foreground-actor-clip)"></image>
        </svg>
        <div class="pg-mentor" id="pg-mentor">经验值只记录行动；四道证据门才证明能力。</div>
        <div class="pg-controls" aria-hidden="true">
          <span class="pg-key">A</span><span class="pg-key">D</span><span>移动</span>
          <span class="pg-key">E</span><span>互动</span>
        </div>
        <nav class="pg-location-strip" id="pg-location-strip" aria-label="公会地点">
          <button data-station="0" data-action="library">书库</button>
          <button data-station="1" data-action="workshop">工坊</button>
          <button data-station="2" data-action="codex">审核室</button>
          <button data-station="3" data-action="retest">复测塔</button>
          <button data-station="4" data-action="artifact">作品门</button>
          <button data-station="5" data-action="key-notes">复盘</button>
        </nav>
      </div>
    </main>
    <aside class="pg-drawer" id="pg-drawer" hidden aria-hidden="true">
      <div class="pg-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="pg-drawer-title">
        <header class="pg-drawer-header">
          <h2 id="pg-drawer-title">任务面板</h2>
          <button class="pg-close" data-action="close-drawer" aria-label="关闭面板">X</button>
        </header>
        <div class="pg-drawer-body" id="pg-drawer-body"></div>
      </div>
    </aside>
    <div class="pg-toast" id="pg-toast" role="status" aria-live="polite"></div>
    <div class="pg-wipe" id="pg-wipe" aria-hidden="true"></div>
  `;

  const legacyOverlay = document.createElement("section");
  legacyOverlay.className = "pg-legacy-overlay";
  legacyOverlay.id = "pg-legacy-overlay";
  legacyOverlay.hidden = true;
  legacyOverlay.innerHTML = `
    <header class="pg-legacy-header">
      <div>
        <h2>课程书库 · 原课程内容</h2>
        <span class="pg-legacy-note">学习内容仍由原页面保存；公会层只负责导航、证据与下一步。</span>
      </div>
      <button class="pg-close" data-action="close-legacy" aria-label="返回公会">X</button>
    </header>
  `;
  legacyOverlay.appendChild(legacyContent);

  document.body.appendChild(app);
  document.body.appendChild(legacyOverlay);

  const drawer = document.getElementById("pg-drawer");
  const drawerBody = document.getElementById("pg-drawer-body");
  const drawerTitle = document.getElementById("pg-drawer-title");
  const scene = document.getElementById("pg-scene");
  const stage = document.getElementById("pg-stage");

  updateStreak();
  saveState();
  renderWorld();

  app.addEventListener("click", handleClick);
  drawer.addEventListener("click", handleClick);
  drawer.addEventListener("submit", handleSubmit);
  legacyOverlay.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  function todayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function updateStreak() {
    const now = new Date();
    const today = todayKey(now);
    if (!state.lastVisit) {
      state.streak = Math.max(1, state.streak || 0);
      state.lastVisit = today;
      return;
    }
    if (state.lastVisit === today) return;
    const previous = new Date(`${state.lastVisit}T00:00:00`);
    const current = new Date(`${today}T00:00:00`);
    const days = Math.round((current - previous) / 86400000);
    state.streak = days === 1 ? state.streak + 1 : 1;
    state.lastVisit = today;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentLevel() {
    return LEVELS[state.activeLevel - 1];
  }

  function completedGateCount(levelId) {
    return GATES.filter((gate) => state.gates[levelId][gate.id].status === "recorded").length;
  }

  function unlockedLevel() {
    let unlocked = 1;
    LEVELS.forEach((level) => {
      if (completedGateCount(level.id) === 4) unlocked = Math.min(LEVELS.length, level.id + 1);
    });
    return unlocked;
  }

  function renderWorld() {
    const level = currentLevel();
    const gateCount = completedGateCount(level.id);
    document.getElementById("pg-rank").textContent = `Lv. ${level.id} ${level.rank}`;
    document.getElementById("pg-level-label").textContent = `第 ${level.id} 关 · ${level.name}`;
    document.getElementById("pg-mission-title").textContent = level.mission;
    document.getElementById("pg-mission-promise").textContent = level.promise;
    document.getElementById("pg-artifact-line").textContent = `本关产物：${level.artifact} · 未解决问题：${state.questions.length}`;
    const evidenceCount = document.getElementById("pg-evidence-count");
    if (evidenceCount) evidenceCount.textContent = `${gateCount}/4`;
    document.getElementById("pg-streak").textContent = `${state.streak} 天`;
    document.getElementById("pg-question-count").textContent = String(state.questions.length);

    const xpInLevel = Math.max(0, state.xp % 100);
    document.getElementById("pg-xp-text").textContent = `${xpInLevel}/100`;
    document.getElementById("pg-xp-meter").style.width = `${xpInLevel}%`;

    document.getElementById("pg-mode-row").innerHTML = Object.entries(MODES).map(([id, mode]) => {
      const selected = state.dailyMode === id ? " is-selected" : "";
      return `<button class="pg-mode-button${selected}" data-mode="${id}">${mode.short}</button>`;
    }).join("");

    document.getElementById("pg-gates").innerHTML = GATES.map((gate) => {
      const done = state.gates[level.id][gate.id].status === "recorded";
      return `<div class="pg-gate${done ? " is-done" : ""}">${done ? "完成" : gate.number}<br>${gate.label}</div>`;
    }).join("");

    document.querySelectorAll("[data-station]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.station) === state.activeStation);
    });
    const cameraPositions = ["55px", "25px", "0px", "-30px", "-55px", "-55px"];
    scene.style.setProperty("--camera-x", cameraPositions[state.activeStation]);
  }

  function handleClick(event) {
    const button = event.target.closest("button");
    if (!button) {
      if (event.target === drawer) closeDrawer();
      return;
    }

    if (button.dataset.mode) {
      state.dailyMode = button.dataset.mode;
      saveState();
      renderWorld();
      showToast(`今日切换为${MODES[state.dailyMode].label}模式`);
      return;
    }

    if (button.dataset.station !== undefined) {
      state.activeStation = Number(button.dataset.station);
      saveState();
      renderWorld();
    }

    const action = button.dataset.action;
    if (!action) return;

    const actions = {
      library: openLegacy,
      workshop: () => openDrawer("训练工坊", renderWorkshop()),
      codex: () => openDrawer("Codex 审核室", renderCodex()),
      retest: () => openDrawer("72h 复测塔", renderEvidence("retest")),
      artifact: () => openDrawer("项目作品陈列门", renderArtifact()),
      "key-notes": () => {
        const learning = window.GOGOGO_UNIFIED_LEARNING;
        if (learning && typeof learning.openKeyNotes === "function") learning.openKeyNotes();
        else openLegacy();
      },
      evidence: () => openDrawer("四道能力证据门", renderEvidence()),
      questions: () => openDrawer("问题队列", renderQuestions()),
      daily: () => openDrawer("今日路线与关卡", renderDaily()),
      notes: () => openDrawer("学习记录分工", renderNotes()),
      levels: () => openDrawer("选择关卡", renderDaily()),
      "close-drawer": closeDrawer,
      "close-legacy": closeLegacy,
      "copy-codex": copyCodexPacket,
      "copy-questions": copyQuestionPacket,
      "copy-notion": copyNotionTemplate,
      "copy-artifact": copyArtifactPacket,
      "delete-question": () => deleteQuestion(button.dataset.id),
      "choose-level": () => chooseLevel(Number(button.dataset.level))
    };

    if (actions[action]) actions[action]();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.dataset.form;
    const data = new FormData(form);

    if (type === "explain") saveGateText("explain", String(data.get("answer") || ""), 80);
    if (type === "transfer") saveGateText("transfer", String(data.get("answer") || ""), 100);
    if (type === "codex") saveCodexReview(data);
    if (type === "retest") saveRetest(String(data.get("answer") || ""));
    if (type === "recall") saveRecall(data);
    if (type === "training-transfer") saveTrainingText("transfer", String(data.get("answer") || ""), 100);
    if (type === "training-boundary") saveTrainingText("boundary", String(data.get("answer") || ""), 80);
    if (type === "question") addQuestion(String(data.get("question") || ""));
    if (type === "artifact") saveArtifact(data);
  }

  function handleKeydown(event) {
    const tag = document.activeElement && document.activeElement.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (event.key === "Escape") {
      if (!drawer.hidden) closeDrawer();
      else if (!legacyOverlay.hidden) closeLegacy();
      return;
    }
    if (!drawer.hidden || !legacyOverlay.hidden) return;

    const key = event.key.toLowerCase();
    if (key === "a" || event.key === "ArrowLeft") moveStation(-1);
    if (key === "d" || event.key === "ArrowRight") moveStation(1);
    if (key === "e" || event.key === "Enter") activateStation();
  }

  function moveStation(direction) {
    state.activeStation = (state.activeStation + direction + 6) % 6;
    saveState();
    renderWorld();
  }

  function activateStation() {
    const actions = ["library", "workshop", "codex", "retest", "artifact", "key-notes"];
    const button = app.querySelector(`[data-action="${actions[state.activeStation]}"]`);
    if (button) button.click();
  }

  function openDrawer(title, html) {
    window.clearTimeout(drawerCloseTimer);
    drawer.classList.remove("is-closing");
    drawerTitle.textContent = title;
    drawerBody.innerHTML = html;
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    const closeButton = drawer.querySelector(".pg-close");
    if (closeButton) closeButton.focus();
  }

  function refreshDrawer(title, html) {
    drawerTitle.textContent = title;
    drawerBody.innerHTML = html;
  }

  function closeDrawer() {
    window.clearTimeout(drawerCloseTimer);
    drawer.classList.remove("is-open");
    drawer.classList.add("is-closing");
    drawerCloseTimer = window.setTimeout(() => {
      drawer.hidden = true;
      drawer.setAttribute("aria-hidden", "true");
      drawer.classList.remove("is-closing");
    }, 330);
  }

  function openLegacy() {
    playWipe();
    window.setTimeout(() => {
      legacyOverlay.hidden = false;
      const likelyTarget = Array.from(legacyContent.querySelectorAll("h1,h2,h3,h4,[id]")).find((node) => {
        return (node.textContent || "").includes(`第${state.activeLevel}关`);
      });
      if (likelyTarget) likelyTarget.scrollIntoView({ block: "start" });
    }, 220);
  }

  function closeLegacy() {
    playWipe();
    window.setTimeout(() => {
      legacyOverlay.hidden = true;
    }, 220);
  }

  function playWipe() {
    const wipe = document.getElementById("pg-wipe");
    wipe.classList.remove("is-active");
    void wipe.offsetWidth;
    wipe.classList.add("is-active");
  }

  function shake(message) {
    stage.classList.remove("pg-shake");
    void stage.offsetWidth;
    stage.classList.add("pg-shake");
    showToast(message);
  }

  function showToast(message) {
    const toast = document.getElementById("pg-toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function renderEvidence(focusGate) {
    const level = currentLevel();
    const gates = state.gates[level.id];
    const retestReady = gates.retest.availableAt > 0 && Date.now() >= gates.retest.availableAt;
    const route = GATES.map((gate) => {
      const done = gates[gate.id].status === "recorded";
      return `<div class="pg-route-step${done ? " is-complete" : ""}">${gate.number}<br>${gate.label}</div>`;
    }).join("");

    return `
      <p class="pg-panel-intro">本关不再用“看过课卡”代替掌握。四份证据全部留下，才解锁下一关；平台只检查证据是否存在，正确性由 Codex 审核。</p>
      <div class="pg-progress-route">${route}</div>
      ${gateExplainCard(gates.explain, focusGate === "explain")}
      ${gateTransferCard(gates.transfer, focusGate === "transfer")}
      ${gateCodexCard(gates.codex, focusGate === "codex")}
      ${gateRetestCard(gates.retest, retestReady, focusGate === "retest")}
      <div class="pg-callout is-danger"><strong>本关硬失败：</strong>${escapeHtml(level.hardFail)}</div>
    `;
  }

  function gateExplainCard(gate, focused) {
    const done = gate.status === "recorded";
    const prompt = (TRAINING[state.activeLevel] && TRAINING[state.activeLevel].explain) || "不看课卡，用自己的话解释本关核心概念、适用场景和失败边界。";
    return `
      <section class="pg-panel-card${done ? " is-complete" : ""}"${focused ? " data-focused=\"true\"" : ""}>
        <div class="pg-card-heading"><h3>01 闭卷解释</h3><span class="pg-status${done ? " is-complete" : ""}">${done ? "已记录" : "待完成"}</span></div>
        <p>${escapeHtml(prompt)}</p>
        <form data-form="explain">
          <label class="pg-form-label" for="pg-explain-answer">你的闭卷解释（至少 80 字）</label>
          <textarea class="pg-textarea" id="pg-explain-answer" name="answer" required minlength="80">${escapeHtml(gate.answer)}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">记录解释证据</button></div>
        </form>
      </section>`;
  }

  function gateTransferCard(gate, focused) {
    const done = gate.status === "recorded";
    const prompt = TRAINING[state.activeLevel].transfer;
    return `
      <section class="pg-panel-card${done ? " is-complete" : ""}"${focused ? " data-focused=\"true\"" : ""}>
        <div class="pg-card-heading"><h3>02 变式任务</h3><span class="pg-status${done ? " is-complete" : ""}">${done ? "已记录" : "待完成"}</span></div>
        <p>${escapeHtml(prompt)}</p>
        <form data-form="transfer">
          <label class="pg-form-label" for="pg-transfer-answer">你的迁移答案（至少 100 字）</label>
          <textarea class="pg-textarea" id="pg-transfer-answer" name="answer" required minlength="100">${escapeHtml(gate.answer)}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">记录变式证据</button></div>
        </form>
      </section>`;
  }

  function gateCodexCard(gate, focused) {
    const done = gate.status === "recorded";
    return `
      <section class="pg-panel-card${done ? " is-complete" : ""}"${focused ? " data-focused=\"true\"" : ""}>
        <div class="pg-card-heading"><h3>03 Codex 审核</h3><span class="pg-status${done ? " is-complete" : ""}">${done ? `通过 ${gate.score} 分` : "等待审核"}</span></div>
        <p>先复制审核包到当前 Codex 对话。Codex 负责判断内容质量，HTML 只保存评分和反馈，不假装能自动审核。</p>
        <div class="pg-form-actions"><button class="pg-secondary" type="button" data-action="copy-codex">复制审核包给 Codex</button></div>
        <form data-form="codex">
          <label class="pg-form-label" for="pg-codex-score">Codex 评分（0-100，70 分通过）</label>
          <input class="pg-input" id="pg-codex-score" name="score" type="number" min="0" max="100" value="${gate.score || ""}" required>
          <label class="pg-form-label" for="pg-codex-feedback">粘贴 Codex 的关键反馈</label>
          <textarea class="pg-textarea" id="pg-codex-feedback" name="feedback" required minlength="20">${escapeHtml(gate.feedback)}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">保存审核结果</button></div>
        </form>
      </section>`;
  }

  function gateRetestCard(gate, ready, focused) {
    const done = gate.status === "recorded";
    const level = currentLevel();
    let availability = "先通过 Codex 审核，系统才开始 72 小时倒计时。";
    if (gate.availableAt && !ready) availability = `开放时间：${formatDate(gate.availableAt)}`;
    if (ready) availability = "复测已开放。请不要查看原答案。";
    if (done) availability = `已于 ${formatDate(gate.submittedAt)} 留下复测证据。`;
    return `
      <section class="pg-panel-card${done ? " is-complete" : ""}${!ready && !done ? " is-locked" : ""}"${focused ? " data-focused=\"true\"" : ""}>
        <div class="pg-card-heading"><h3>04 72h 复测</h3><span class="pg-status${done ? " is-complete" : ""}">${done ? "已记录" : ready ? "已开放" : "未开放"}</span></div>
        <p>${escapeHtml(level.retest)}</p>
        <div class="pg-callout">${escapeHtml(availability)}</div>
        <form data-form="retest">
          <label class="pg-form-label" for="pg-retest-answer">闭卷复测答案（至少 100 字）</label>
          <textarea class="pg-textarea" id="pg-retest-answer" name="answer" minlength="100" ${ready || done ? "" : "disabled"}>${escapeHtml(gate.answer)}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit" ${ready || done ? "" : "disabled"}>记录复测证据</button></div>
        </form>
      </section>`;
  }

  function saveGateText(gateId, answer, minimum) {
    const clean = answer.trim();
    if (clean.length < minimum) {
      shake(`证据不足：至少需要 ${minimum} 个字符。`);
      return;
    }
    const gate = state.gates[state.activeLevel][gateId];
    const first = gate.status !== "recorded";
    gate.answer = clean;
    gate.status = "recorded";
    gate.submittedAt = Date.now();
    if (first) state.xp += 10;
    saveState();
    renderWorld();
    refreshDrawer("四道能力证据门", renderEvidence(gateId));
    showToast("证据已记录；仍需 Codex 判断内容是否正确。 ");
  }

  function saveCodexReview(data) {
    const score = Number(data.get("score"));
    const feedback = String(data.get("feedback") || "").trim();
    if (!Number.isFinite(score) || score < 0 || score > 100 || feedback.length < 20) {
      shake("请填写 0-100 分评分，并粘贴至少 20 字的 Codex 反馈。");
      return;
    }
    if (score < 70) {
      const gate = state.gates[state.activeLevel].codex;
      gate.score = score;
      gate.feedback = feedback;
      gate.status = "open";
      saveState();
      shake("审核未通过。先按反馈修订，再重新提交。 ");
      refreshDrawer("四道能力证据门", renderEvidence("codex"));
      return;
    }
    const gate = state.gates[state.activeLevel].codex;
    const first = gate.status !== "recorded";
    gate.score = score;
    gate.feedback = feedback;
    gate.status = "recorded";
    gate.submittedAt = Date.now();
    const retest = state.gates[state.activeLevel].retest;
    if (!retest.availableAt) retest.availableAt = Date.now() + RETEST_DELAY;
    if (first) state.xp += 20;
    saveState();
    renderWorld();
    refreshDrawer("四道能力证据门", renderEvidence("codex"));
    showToast("Codex 审核通过；72 小时后开放变式复测。 ");
  }

  function saveRetest(answer) {
    const clean = answer.trim();
    const gate = state.gates[state.activeLevel].retest;
    if (!gate.availableAt || Date.now() < gate.availableAt) {
      shake("复测尚未开放。延迟回忆不能提前完成。 ");
      return;
    }
    if (clean.length < 100) {
      shake("复测答案至少 100 字。 ");
      return;
    }
    const first = gate.status !== "recorded";
    gate.answer = clean;
    gate.status = "recorded";
    gate.submittedAt = Date.now();
    if (first) state.xp += 25;
    saveState();
    renderWorld();
    refreshDrawer("72h 复测塔", renderEvidence("retest"));
    if (completedGateCount(state.activeLevel) === 4) showToast("四道证据门完成，下一关已解锁。 ");
    else showToast("复测证据已记录。 ");
  }

  function renderWorkshop() {
    const content = TRAINING[state.activeLevel];
    const completed = state.training[state.activeLevel];
    return `
      <p class="pg-panel-intro">题库按认知层级训练，而不是只堆同类选择题：先识别，再迁移，最后处理边界。完成只代表留下练习记录，正确性仍要进入 Codex 审核。</p>
      <section class="pg-panel-card${completed.recall ? " is-complete" : ""}">
        <div class="pg-card-heading"><h3>层级 1 · 概念识别</h3><span class="pg-status${completed.recall ? " is-complete" : ""}">${completed.recall ? "已完成" : "待完成"}</span></div>
        <p>${escapeHtml(content.recall.prompt)}</p>
        <form data-form="recall">
          <div class="pg-option-list">
            ${content.recall.options.map((option, index) => `<label class="pg-option"><input type="radio" name="answer" value="${index}" required> <span>${escapeHtml(option)}</span></label>`).join("")}
          </div>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">提交判断</button></div>
        </form>
      </section>
      <section class="pg-panel-card${completed.transfer ? " is-complete" : ""}">
        <div class="pg-card-heading"><h3>层级 2 · 场景迁移</h3><span class="pg-status${completed.transfer ? " is-complete" : ""}">${completed.transfer ? "已记录" : "待完成"}</span></div>
        <p>${escapeHtml(content.transfer)}</p>
        <form data-form="training-transfer">
          <textarea class="pg-textarea" name="answer" required minlength="100">${escapeHtml((completed.transfer && completed.transfer.answer) || "")}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">保存迁移答案</button></div>
        </form>
      </section>
      <section class="pg-panel-card${completed.boundary ? " is-complete" : ""}">
        <div class="pg-card-heading"><h3>层级 3 · 边界诊断</h3><span class="pg-status${completed.boundary ? " is-complete" : ""}">${completed.boundary ? "已记录" : "待完成"}</span></div>
        <p>${escapeHtml(content.boundary)}</p>
        <form data-form="training-boundary">
          <textarea class="pg-textarea" name="answer" required minlength="80">${escapeHtml((completed.boundary && completed.boundary.answer) || "")}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">保存边界判断</button></div>
        </form>
      </section>`;
  }

  function saveRecall(data) {
    const selected = Number(data.get("answer"));
    const question = TRAINING[state.activeLevel].recall;
    if (selected !== question.answer) {
      shake("判断错误。回到事实来源、权限或失败边界重新推理。 ");
      return;
    }
    const first = !state.training[state.activeLevel].recall;
    state.training[state.activeLevel].recall = { selected, completedAt: Date.now() };
    if (first) state.xp += 4;
    saveState();
    renderWorld();
    refreshDrawer("训练工坊", renderWorkshop());
    showToast(question.why);
  }

  function saveTrainingText(kind, answer, minimum) {
    const clean = answer.trim();
    if (clean.length < minimum) {
      shake(`答案至少需要 ${minimum} 个字符。`);
      return;
    }
    const first = !state.training[state.activeLevel][kind];
    state.training[state.activeLevel][kind] = { answer: clean, completedAt: Date.now() };
    if (kind === "transfer") {
      const gate = state.gates[state.activeLevel].transfer;
      gate.answer = clean;
      gate.status = "recorded";
      gate.submittedAt = Date.now();
    }
    if (first) state.xp += 6;
    saveState();
    renderWorld();
    refreshDrawer("训练工坊", renderWorkshop());
    showToast("训练记录已保存；请带着答案进入 Codex 审核。 ");
  }

  function renderCodex() {
    const level = currentLevel();
    const gate = state.gates[level.id].codex;
    return `
      <p class="pg-panel-intro">Codex 是教练和审核者，不是网页里的假按钮。这里把学习上下文压缩成一个可复制审核包，再将真实反馈带回证据门。</p>
      <section class="pg-panel-card">
        <div class="pg-card-heading"><h3>当前审核任务</h3><span class="pg-status${gate.status === "recorded" ? " is-complete" : ""}">${gate.status === "recorded" ? `${gate.score} 分` : "待提交"}</span></div>
        <p><strong>${escapeHtml(level.mission)}</strong></p>
        <p>审核包包含闭卷解释、变式答案、项目产物和未解决问题，不再只复制 XP。</p>
        <div class="pg-form-actions">
          <button class="pg-primary" data-action="copy-codex">复制审核包给 Codex</button>
          <button class="pg-secondary" data-action="evidence">填写审核结果</button>
        </div>
      </section>
      <section class="pg-panel-card">
        <div class="pg-card-heading"><h3>职责边界</h3></div>
        <p>HTML：保存进度、证据、复测时间与下一步。</p>
        <p>Notion：保存术语、基础知识和长期可检索笔记。</p>
        <p>Codex：讲解、追问、评分、指出错误并审核修订。</p>
        <div class="pg-form-actions"><button class="pg-secondary" data-action="notes">查看记录标准</button></div>
      </section>`;
  }

  function buildCodexPacket() {
    const level = currentLevel();
    const gates = state.gates[level.id];
    const artifact = state.artifacts[level.id];
    const mode = MODES[state.dailyMode];
    const questions = state.questions.length ? state.questions.map((item, index) => `${index + 1}. ${item.text}`).join("\n") : "暂无";
    return `请作为严格但鼓励的 Codex AI 教练，审核我在《AI 从业者闯关之路》的当前学习证据。\n\n【关卡】第 ${level.id} 关：${level.name}\n【主线任务】${level.mission}\n【今日模式】${mode.label}\n【行动 XP】${state.xp}（只代表行动，不代表掌握）\n【能力证据】${completedGateCount(level.id)}/4\n\n【闭卷解释】\n${gates.explain.answer || "未提交"}\n\n【变式任务】\n题目：${TRAINING[level.id].transfer}\n答案：${gates.transfer.answer || "未提交"}\n\n【项目产物】\n${artifact.body || "未提交"}\n\n【证据与限制】\n${artifact.evidence || "未提交"}\n\n【未解决问题】\n${questions}\n\n【本关硬失败】\n${level.hardFail}\n\n请给出：1. 每项评分与理由；2. 最需要改进的两点；3. 一个更好的示范；4. 是否达到本关可迁移的入门水准。若信息不足，请明确指出，不要代替我补写。`;
  }

  function copyCodexPacket() {
    copyText(buildCodexPacket(), "审核包已复制，粘贴到当前 Codex 对话即可。 ");
  }

  function renderQuestions() {
    const items = state.questions.length ? state.questions.map((question) => `
      <div class="pg-question-item">
        <p>${escapeHtml(question.text)}</p>
        <button class="pg-danger" data-action="delete-question" data-id="${question.id}">移除</button>
      </div>`).join("") : `<div class="pg-callout">当前没有待解决问题。学习中一旦出现“不懂、冲突、无法判断”，立刻记录，不要靠猜。</div>`;
    return `
      <p class="pg-panel-intro">问题队列只存未解决的问题。带着具体上下文交给 Codex，解决后再移除。</p>
      <section class="pg-panel-card">
        <form data-form="question">
          <label class="pg-form-label" for="pg-new-question">新增问题</label>
          <textarea class="pg-textarea" id="pg-new-question" name="question" required minlength="8" placeholder="我不理解的是……；我已经确认……；卡住的判断是……"></textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">加入队列</button><button class="pg-secondary" type="button" data-action="copy-questions">复制给 Codex</button></div>
        </form>
      </section>
      <section class="pg-panel-card"><div class="pg-card-heading"><h3>待解决 ${state.questions.length} 项</h3></div>${items}</section>`;
  }

  function addQuestion(text) {
    const clean = text.trim();
    if (clean.length < 8) {
      shake("请把问题写具体一些。 ");
      return;
    }
    state.questions.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text: clean, createdAt: Date.now() });
    saveState();
    renderWorld();
    refreshDrawer("问题队列", renderQuestions());
    showToast("问题已加入队列。 ");
  }

  function deleteQuestion(id) {
    state.questions = state.questions.filter((question) => question.id !== id);
    saveState();
    renderWorld();
    refreshDrawer("问题队列", renderQuestions());
  }

  function copyQuestionPacket() {
    const text = state.questions.length
      ? `请逐个帮助我澄清这些学习问题。每次只解释一个概念，先补前置知识，再让我用自己的话回答：\n\n${state.questions.map((item, index) => `${index + 1}. ${item.text}`).join("\n")}`
      : "当前没有待解决问题。";
    copyText(text, "问题队列已复制。 ");
  }

  function renderArtifact() {
    const level = currentLevel();
    const artifact = state.artifacts[level.id];
    const ready = completedGateCount(level.id) === 4;
    return `
      <p class="pg-panel-intro">每一关必须留下一个可以被别人检查的真实产物。四道证据门完成后，作品才获得“本关完成”状态。</p>
      <section class="pg-panel-card${ready ? " is-complete" : ""}">
        <div class="pg-card-heading"><h3>${escapeHtml(level.artifact)}</h3><span class="pg-status${ready ? " is-complete" : ""}">${ready ? "已解锁" : `${completedGateCount(level.id)}/4 证据`}</span></div>
        <form data-form="artifact">
          <label class="pg-form-label" for="pg-artifact-body">产物正文或关键摘要</label>
          <textarea class="pg-textarea" id="pg-artifact-body" name="body" required minlength="120">${escapeHtml(artifact.body)}</textarea>
          <label class="pg-form-label" for="pg-artifact-evidence">证据、限制和仍未验证的部分</label>
          <textarea class="pg-textarea" id="pg-artifact-evidence" name="evidence" required minlength="40">${escapeHtml(artifact.evidence)}</textarea>
          <div class="pg-form-actions"><button class="pg-primary" type="submit">保存产物</button><button class="pg-secondary" type="button" data-action="copy-artifact">复制产物审核包</button></div>
        </form>
      </section>
      <div class="pg-callout is-danger"><strong>硬失败：</strong>${escapeHtml(level.hardFail)}</div>`;
  }

  function saveArtifact(data) {
    const body = String(data.get("body") || "").trim();
    const evidence = String(data.get("evidence") || "").trim();
    if (body.length < 120 || evidence.length < 40) {
      shake("产物正文至少 120 字，证据与限制至少 40 字。 ");
      return;
    }
    const artifact = state.artifacts[state.activeLevel];
    const first = !artifact.updatedAt;
    artifact.body = body;
    artifact.evidence = evidence;
    artifact.updatedAt = Date.now();
    if (first) state.xp += 12;
    saveState();
    renderWorld();
    refreshDrawer("项目作品陈列门", renderArtifact());
    showToast("项目产物已保存；是否通关仍由四道证据门决定。 ");
  }

  function copyArtifactPacket() {
    const level = currentLevel();
    const artifact = state.artifacts[level.id];
    const text = `请审核我的第 ${level.id} 关项目产物《${level.artifact}》。\n\n【产物】\n${artifact.body || "未提交"}\n\n【证据、限制与未验证部分】\n${artifact.evidence || "未提交"}\n\n【硬失败标准】\n${level.hardFail}\n\n请重点检查：是否可执行、是否可验证、是否诚实处理未知信息，以及是否能迁移到新场景。`;
    copyText(text, "项目产物审核包已复制。 ");
  }

  function renderDaily() {
    const unlock = unlockedLevel();
    return `
      <p class="pg-panel-intro">先根据当天精力选择时间预算，再给自己一个不可删减的学习闭环。90 分钟不是默认义务。</p>
      <div class="pg-mode-grid">
        ${Object.entries(MODES).map(([id, mode]) => `
          <button class="pg-mode-card${state.dailyMode === id ? " is-selected" : ""}" data-mode="${id}">
            <strong>${escapeHtml(mode.label)}</strong>
            <span>${mode.steps.map((step) => escapeHtml(step)).join("<br>")}</span>
          </button>`).join("")}
      </div>
      <section class="pg-panel-card">
        <div class="pg-card-heading"><h3>选择已解锁关卡</h3><span class="pg-status">最高第 ${unlock} 关</span></div>
        <div class="pg-level-grid">
          ${LEVELS.map((level) => `
            <button class="pg-level-card${state.activeLevel === level.id ? " is-selected" : ""}" data-action="choose-level" data-level="${level.id}" ${level.id > unlock ? "disabled" : ""}>
              <strong>第 ${level.id} 关 · ${escapeHtml(level.name)}</strong>
              <span>${escapeHtml(level.artifact)}</span>
            </button>`).join("")}
        </div>
      </section>
      ${renderNotes()}`;
  }

  function chooseLevel(levelId) {
    if (levelId > unlockedLevel()) {
      shake("先完成上一关四道证据门。 ");
      return;
    }
    state.activeLevel = levelId;
    saveState();
    renderWorld();
    closeDrawer();
    showToast(`已进入第 ${levelId} 关。`);
  }

  function renderNotes() {
    return `
      <section class="pg-panel-card">
        <div class="pg-card-heading"><h3>记录系统只有三种职责</h3></div>
        <div class="pg-responsibility-grid">
          <div class="pg-role"><strong>HTML · 行动层</strong><span>保存进度、答案证据、复测日期、项目产物和下一步。</span></div>
          <div class="pg-role"><strong>Notion · 知识层</strong><span>保存中英文术语、基础概念、例子、误区和长期笔记。</span></div>
          <div class="pg-role"><strong>Codex · 反馈层</strong><span>负责讲解、追问、评分、纠错、审核和弱点跟踪。</span></div>
        </div>
        <div class="pg-form-actions"><button class="pg-secondary" data-action="copy-notion">复制 Notion 笔记模板</button></div>
      </section>`;
  }

  function copyNotionTemplate() {
    const level = currentLevel();
    const template = `# 第 ${level.id} 关：${level.name}\n\n## 1. 本节一句话\n- 我能用自己的话解释：\n\n## 2. 术语表 Terms\n| 中文 | English | 缩写 | 我的解释 | 例子 | 易错点 |\n|---|---|---|---|---|---|\n|  |  |  |  |  |  |\n\n## 3. 基础知识\n- 它解决什么问题：\n- 输入是什么：\n- 输出是什么：\n- 关键约束：\n- 不适用边界：\n\n## 4. 能力证据\n- 闭卷解释：\n- 变式任务：\n- 项目产物：${level.artifact}\n- 72h 复测结果：\n\n## 5. Codex 反馈\n- 得分：\n- 最大错误：\n- 修改前：\n- 修改后：\n\n## 6. 未解决问题\n- [ ] \n\n## 7. 复习触发器\n- 72 小时：\n- 7 天：\n- 14 天：`;
    copyText(template, "Notion 笔记模板已复制。 ");
  }

  function formatDate(timestamp) {
    if (!timestamp) return "未安排";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function copyText(text, successMessage) {
    const fallback = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(successMessage);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage)).catch(fallback);
    } else {
      fallback();
    }
  }
})();

/* Linear learning flow v2: library -> workshop -> Codex -> retest -> artifact. */
(() => {
  const FLOW_KEY = "gogogo_learning_flow_v2";
  const FLOW_LABELS = ["学习", "训练", "审核", "复测", "归档"];
  const FLOW_ACTION_STAGE = {
    library: 0,
    workshop: 1,
    evidence: 1,
    codex: 2,
    retest: 3,
    artifact: 4,
  };

  let flowSyncQueued = false;
  let flowObserver = null;
  let flowStateCache = null;
  const sessionLibraryDone = new Set();

  const getLevelNumber = () => {
    const label = document.querySelector("#pg-level-label")?.textContent || "第 1 关";
    const match = label.match(/第\s*(\d+)\s*关/);
    return Math.max(1, Number(match?.[1] || 1));
  };

  const loadFlowState = () => {
    if (flowStateCache) return flowStateCache;
    try {
      flowStateCache =
        JSON.parse(window.localStorage.getItem(FLOW_KEY) || "{}") || {};
    } catch (_error) {
      flowStateCache = {};
    }
    return flowStateCache;
  };

  const saveFlowState = (state) => {
    flowStateCache = state;
    try {
      window.localStorage.setItem(FLOW_KEY, JSON.stringify(state));
    } catch (_error) {
      // The course remains usable when storage is unavailable.
    }
  };

  const gateStates = () =>
    [...document.querySelectorAll("#pg-gates .pg-gate")].map((gate) =>
      gate.classList.contains("is-done")
    );

  const isLibraryDone = (level, gates = gateStates()) => {
    const state = loadFlowState();
    return (
      sessionLibraryDone.has(level) ||
      Boolean(state.libraryDoneByLevel?.[level]) ||
      gates.some(Boolean)
    );
  };

  const markLibraryDone = () => {
    const level = getLevelNumber();
    sessionLibraryDone.add(level);
    const state = loadFlowState();
    state.libraryDoneByLevel = state.libraryDoneByLevel || {};
    state.libraryDoneByLevel[level] = true;
    saveFlowState(state);
  };

  const deriveNext = () => {
    const level = getLevelNumber();
    const gates = gateStates();
    const libraryDone = isLibraryDone(level, gates);

    if (!libraryDone) {
      return {
        stage: 0,
        action: "library",
        title: "课程书库 · 学习本关课卡",
        hint: "先建立概念并完成能力卡，再进入闭卷训练。",
        button: "去书库学习",
        libraryDone,
        gates,
      };
    }

    if (!gates[0]) {
      return {
        stage: 1,
        action: "workshop",
        title: "训练工坊 · 完成闭卷解释",
        hint: "关闭课卡，用自己的话解释核心方法。",
        button: "开始闭卷训练",
        libraryDone,
        gates,
      };
    }

    if (!gates[1]) {
      return {
        stage: 1,
        action: "workshop",
        title: "训练工坊 · 完成变式任务",
        hint: "把同一方法迁移到新的真实业务场景。",
        button: "继续变式任务",
        libraryDone,
        gates,
      };
    }

    if (!gates[2]) {
      return {
        stage: 2,
        action: "codex",
        title: "Codex 审核室 · 提交两份证据",
        hint: "由 Codex 评分、指出问题并完成修订。",
        button: "提交 Codex 审核",
        libraryDone,
        gates,
      };
    }

    if (!gates[3]) {
      return {
        stage: 3,
        action: "retest",
        title: "72h 复测塔 · 验证长期掌握",
        hint: "等待开放后，不看笔记完成新的迁移题。",
        button: "查看 72h 复测",
        libraryDone,
        gates,
      };
    }

    return {
      stage: 4,
      action: "artifact",
      title: "作品门 · 归档本关能力证据",
      hint: "保存最终版本、评分和修订记录，再进入下一关。",
      button: "归档本关作品",
      libraryDone,
      gates,
    };
  };

  const ensureFlowPanel = () => {
    const panel = document.querySelector("#pg-mode-row");
    if (!panel) return null;

    if (!panel.querySelector(".pg-flow-now")) {
      panel.className = "pg-flow-panel";
      panel.setAttribute("aria-label", "本关学习流程");
      panel.innerHTML = `
        <div class="pg-flow-now">
          <span class="pg-flow-index" id="pg-flow-index">下一步 1/5</span>
          <strong class="pg-flow-title" id="pg-flow-title">课程书库 · 学习本关课卡</strong>
          <span class="pg-flow-hint" id="pg-flow-hint">先建立概念并完成能力卡，再进入闭卷训练。</span>
        </div>
        <div class="pg-flow-track" aria-label="学习、训练、审核、复测、归档">
          ${FLOW_LABELS.map(
            (label, index) =>
              `<span class="pg-flow-step" data-flow-step="${index}">${index + 1} ${label}</span>`
          ).join("")}
        </div>
      `;
    }

    return panel;
  };

  const ensureLibraryCheckpoint = () => {
    const header = document.querySelector(".pg-legacy-header");
    if (!header) return null;

    const title = header.querySelector("h2");
    const note = header.querySelector(".pg-legacy-note");
    if (title) title.textContent = "课程书库 · 本关学习";
    if (note) {
      note.textContent = "阅读本关课卡并完成能力卡；训练与验收回公会继续。";
    }

    const overlay = document.querySelector("#pg-legacy-overlay");
    let button = document.querySelector("#pg-library-fixed-return");
    if (!button) {
      button = document.createElement("button");
      button.id = "pg-library-fixed-return";
      button.type = "button";
      button.className = "pg-library-checkpoint pg-library-fixed-return";
      Object.assign(button.style, {
        position: "fixed",
        top: "12px",
        right: "18px",
        zIndex: "2147483647",
      });
      document.body.appendChild(button);
    }
    const returnToGuild = (event) => {
      event.preventDefault();
      event.stopPropagation();
      markLibraryDone();
      syncFlow();
      if (overlay) overlay.hidden = true;
      button.hidden = true;
    };
    button.onpointerdown = returnToGuild;
    button.onclick = returnToGuild;
    button.hidden = Boolean(overlay?.hidden);

    const next = deriveNext();
    const buttonLabel = next.libraryDone
      ? "返回公会 · 继续下一步"
      : "完成学习 → 进入训练";
    if (button.textContent !== buttonLabel) button.textContent = buttonLabel;
    button.setAttribute("aria-label", buttonLabel);
    return button;
  };

  const renderFlow = () => {
    const panel = ensureFlowPanel();
    if (!panel) return;

    const next = deriveNext();
    const index = panel.querySelector("#pg-flow-index");
    const title = panel.querySelector("#pg-flow-title");
    const hint = panel.querySelector("#pg-flow-hint");

    const indexLabel = `下一步 ${next.stage + 1}/5`;
    if (index && index.textContent !== indexLabel) index.textContent = indexLabel;
    if (title && title.textContent !== next.title) title.textContent = next.title;
    if (hint && hint.textContent !== next.hint) hint.textContent = next.hint;

    panel.querySelectorAll("[data-flow-step]").forEach((step) => {
      const stepIndex = Number(step.dataset.flowStep);
      step.classList.toggle("is-done", stepIndex < next.stage);
      step.classList.toggle("is-current", stepIndex === next.stage);
      step.classList.toggle("is-locked", stepIndex > next.stage);
    });

    const primary = document.querySelector("[data-home-progress]");
    if (primary && !window.GOGOGO_UNIFIED_LEARNING) {
      if (primary.textContent !== next.button) primary.textContent = next.button;
      primary.dataset.action = next.action;
      primary.dataset.flowNext = "true";
      primary.setAttribute("aria-label", next.button);
    }

    document.querySelector("#pg-gates")?.setAttribute("aria-label", "本关四份验收证据");

    document.querySelectorAll("[data-action]").forEach((control) => {
      if (control === primary) return;
      const controlStage = FLOW_ACTION_STAGE[control.dataset.action];
      if (controlStage === undefined) return;
      control.classList.toggle("is-flow-done", controlStage < next.stage);
      control.classList.toggle("is-flow-current", controlStage === next.stage);
      control.classList.toggle("is-flow-locked", controlStage > next.stage);
      if (controlStage === next.stage) {
        control.setAttribute("aria-current", "step");
      } else {
        control.removeAttribute("aria-current");
      }
    });

    ensureLibraryCheckpoint();
  };

  const scheduleFlowSync = () => {
    if (flowSyncQueued) return;
    flowSyncQueued = true;
    queueMicrotask(() => {
      flowSyncQueued = false;
      renderFlow();
    });
  };

  const openCurrentLesson = () => {
    const overlay = document.querySelector("#pg-legacy-overlay");
    if (!overlay || overlay.getAttribute("aria-hidden") === "true") return;
    window.setTimeout(() => {
      const returnButton = ensureLibraryCheckpoint();
      if (returnButton) returnButton.hidden = false;
    }, 260);

    const activeMask = overlay.querySelector("#mask.on");
    if (activeMask?.textContent.includes("本节能力卡")) {
      markLibraryDone();
      syncFlow();
      ensureLibraryCheckpoint();
      activeMask.scrollTop = 0;
      return;
    }

    if (activeMask?.textContent.includes("玩法说明 v2")) {
      const begin = [...activeMask.querySelectorAll("button")].find((button) =>
        button.textContent.includes("开始闯关")
      );
      begin?.click();
    }

    const levelNumber = getLevelNumber();
    const lessonGlobalIndex = Math.max(0, levelNumber - 1);
    const legacyLevelIndex = Math.floor(lessonGlobalIndex / 4);
    const legacyLessonIndex = lessonGlobalIndex % 4;
    const mapButton = overlay.querySelector('[data-pg="map"]');
    if (mapButton && !mapButton.classList.contains("on")) mapButton.click();

    queueMicrotask(() => {
      let mask = overlay.querySelector("#mask.on");
      if (!mask) {
        const levelCards = [...overlay.querySelectorAll(".lv-card")];
        const levelCard = levelCards[legacyLevelIndex];
        if (levelCard && !levelCard.textContent.includes("🔒")) levelCard.click();
        mask = overlay.querySelector("#mask.on");
      }

      queueMicrotask(() => {
        const currentMask = overlay.querySelector("#mask.on");
        if (
          currentMask &&
          currentMask.textContent.includes("通关目标") &&
          !currentMask.textContent.includes("本节能力卡")
        ) {
          currentMask
            .querySelector(`[data-les="${legacyLessonIndex}"]`)
            ?.click();
        }
        const content = overlay.querySelector(".pg-legacy-content");
        if (content) content.scrollTop = 0;
        const finalMask = overlay.querySelector("#mask.on");
        if (finalMask) finalMask.scrollTop = 0;
        markLibraryDone();
        syncFlow();
        ensureLibraryCheckpoint();
        requestAnimationFrame(ensureLibraryCheckpoint);
      });
    });
  };

  const syncFlow = () => {
    document.body.classList.add("pg-flow-v2");
    renderFlow();
  };

  const bootFlow = () => {
    if (!document.querySelector(".pg-quest")) return;
    syncFlow();

    document.addEventListener("click", (event) => {
      const actionControl = event.target.closest?.("[data-action]");
      if (actionControl?.dataset.action === "library") {
        queueMicrotask(openCurrentLesson);
      }

      const clickedText = event.target.closest?.("button")?.textContent || "";
      if (clickedText.includes("读完了，收入复习卡组")) {
        markLibraryDone();
        scheduleFlowSync();
      }
      if (
        clickedText.includes("记录解释证据") ||
        clickedText.includes("记录变式证据") ||
        clickedText.includes("保存审核结果") ||
        clickedText.includes("记录复测证据")
      ) {
        requestAnimationFrame(scheduleFlowSync);
      }
    });

    const gates = document.querySelector("#pg-gates");
    if (gates) {
      flowObserver = new MutationObserver(scheduleFlowSync);
      flowObserver.observe(gates, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(bootFlow), {
      once: true,
    });
  } else {
    requestAnimationFrame(bootFlow);
  }
})();
