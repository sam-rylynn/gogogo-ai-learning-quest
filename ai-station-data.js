(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  if (root) root.GOGO_AI_STATION_DATA = data;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const portals = [
    {
      id: "tools",
      order: "01",
      title: "应用工具库",
      summary: "按任务筛选、比较并打开适合你的 AI 工具。",
      meta: "24 个工具 · 10 类任务"
    },
    {
      id: "hot",
      order: "02",
      title: "AI 热榜",
      summary: "先看模型排行，再看事件热度和产品更新。",
      meta: "模型排行 · 近期动态"
    },
    {
      id: "flows",
      order: "03",
      title: "实战流程",
      summary: "选一个真实任务，按步骤做到可验收。",
      meta: "8 条完整流程"
    },
    {
      id: "glossary",
      order: "04",
      title: "常用词",
      summary: "用中文白话听懂模型、Agent、MCP、API 和 Git。",
      meta: "中文解释 · 例子 · 易混概念"
    }
  ];

  const workflows = [
    {
      id: "research-brief",
      category: "研究",
      title: "做一份可追溯的研究简报",
      summary: "从问题定义、资料检索到结论核验。",
      deliverable: "一页结论、至少 3 个来源、待确认项",
      inputs: ["要研究的问题与使用者", "时间范围与地区范围", "必须采用或排除的来源"],
      steps: [
        "写清研究问题、边界和最终交付格式",
        "用搜索工具找到一手资料，再用助手整理线索",
        "逐条打开原文，记录日期、出处和关键事实",
        "把事实、判断和未确认项分开写",
        "用验收清单检查来源、时效与遗漏"
      ],
      done: ["关键结论都有原文入口", "事实和个人判断明确分开", "不确定内容已标注而不是猜测"],
      pitfalls: ["只看 AI 摘要不打开原文", "把不同时间或不同口径的数据放在一起比较"],
      toolIds: ["perplexity", "metaso", "notebooklm", "kimi"],
      relatedTermIds: ["prompt", "rag", "hallucination", "evals"],
      verifiedAt: "2026-08-31",
      featured: true
    },
    {
      id: "weekly-report",
      category: "写作",
      title: "把零散记录整理成周报",
      summary: "从原始材料提取结果、证据、问题和下一步。",
      deliverable: "本周结果、证据、风险、下周动作",
      inputs: ["本周聊天、文档和任务记录", "周报读者", "固定栏目或字数要求"],
      steps: [
        "收齐本周材料，不让 AI 先补写缺失事实",
        "按结果、证据、问题、下一步分类",
        "让 AI 生成初稿并标出缺少依据的句子",
        "人工核对数字、链接、责任人和日期",
        "压缩成读者能快速做决定的版本"
      ],
      done: ["每项结果能找到对应证据", "问题有责任人或处理动作", "下周事项写明完成条件"],
      pitfalls: ["把计划写成已经完成", "周报只有过程，没有结果和判断"],
      toolIds: ["kimi", "claude", "chatgpt"],
      relatedTermIds: ["prompt", "sourceOfTruth", "acceptanceCriteria", "iteration"],
      verifiedAt: "2026-08-31",
      featured: true
    },
    {
      id: "presentation",
      category: "演示",
      title: "从资料做出演示文稿",
      summary: "先确定结论和讲述顺序，再生成页面。",
      deliverable: "大纲、完整页面、讲述备注",
      inputs: ["演示对象与时长", "必须讲清的结论", "可使用的文字、数据和图片"],
      steps: [
        "先写一句核心结论和听众要采取的动作",
        "把材料整理成开场、论据、方案和结尾",
        "为每一页规定一个信息目标",
        "选择演示工具生成初版并统一视觉",
        "完整讲一遍，删除重复页并补齐来源"
      ],
      done: ["每页只有一个主要信息", "数据和图片都有来源", "在规定时间内能顺畅讲完"],
      pitfalls: ["直接把长文一键转成几十页", "只检查页面好看，没有检查结论是否成立"],
      toolIds: ["gamma", "canva", "qianwen"],
      relatedTermIds: ["prompt", "multimodal", "acceptanceCriteria"],
      verifiedAt: "2026-08-31",
      featured: true
    },
    {
      id: "visual-package",
      category: "图片",
      title: "做一套可继续修改的图片",
      summary: "从用途和版式出发，完成方向稿与正式成品。",
      deliverable: "方向稿、正式图片、可修改源文件",
      inputs: ["使用平台与尺寸", "主文案和品牌元素", "参考图与禁止方向"],
      steps: [
        "确定图片用途、比例和必须出现的信息",
        "用参考图统一构图、色彩和质感方向",
        "先生成或设计 2—3 个方向稿",
        "选定方向后修正文案、手部、Logo 和细节",
        "导出成品并保留可继续修改的源文件"
      ],
      done: ["手机尺寸下文字可读", "人物与品牌元素没有明显错误", "成品尺寸和格式符合发布平台"],
      pitfalls: ["没有参考方向就反复抽卡", "只保存导出图，没有保留源文件"],
      toolIds: ["canva", "jimeng", "midjourney"],
      relatedTermIds: ["multimodal", "iteration", "baseline"],
      verifiedAt: "2026-08-31",
      featured: true
    },
    {
      id: "short-video",
      category: "视频",
      title: "从想法完成一条短视频",
      summary: "把口播、画面、声音和验收放进同一条流程。",
      deliverable: "脚本、分镜、素材、字幕和成片",
      inputs: ["核心观点与受众", "真人口播或音频", "已有素材和参考视频"],
      steps: [
        "先锁定观点、口播和时长，不用效果补结构",
        "把每段口播映射到真实画面或必要说明",
        "准备素材、字幕、音乐和需要生成的画面",
        "完成初剪后检查节奏、可读性和事实证据",
        "在手机上完整观看，再导出正式版本"
      ],
      done: ["声音清楚且字幕可读", "每个事实性表达有画面或来源支撑", "开头、主体和结尾完整"],
      pitfalls: ["口播未确定就先堆素材", "用花哨转场掩盖信息结构问题"],
      toolIds: ["jimeng", "kling", "runway", "capcut"],
      relatedTermIds: ["multimodal", "workflow", "acceptanceCriteria"],
      verifiedAt: "2026-08-31",
      featured: false
    },
    {
      id: "web-prototype",
      category: "开发",
      title: "搭建一个能运行的网页或小工具",
      summary: "从需求、代码到本地测试和可访问版本。",
      deliverable: "可运行页面、源码、测试结果和版本记录",
      inputs: ["目标用户和核心任务", "参考页面或设计图", "现有代码与部署环境"],
      steps: [
        "写清用户要完成的唯一核心任务",
        "检查现有代码、数据和视觉规则",
        "让编程 Agent 分步骤实现并保留差异",
        "运行自动化测试和桌面、手机浏览器检查",
        "用 Git 保存版本，通过验收后再部署"
      ],
      done: ["核心路径可以从头走到尾", "桌面和手机没有遮挡或横向溢出", "版本、测试和部署状态可以追溯"],
      pitfalls: ["没看现有代码就整页重写", "HTTP 200 就当成所有功能已经通过"],
      toolIds: ["cursor", "trae", "github-copilot", "claude"],
      relatedTermIds: ["agent", "git", "repository", "commit", "deploy"],
      verifiedAt: "2026-08-31",
      featured: false
    },
    {
      id: "automation-flow",
      category: "自动化",
      title: "自动完成一个重复任务",
      summary: "明确触发、处理、输出和失败恢复。",
      deliverable: "可运行工作流、失败提醒、人工接管方式",
      inputs: ["重复任务的当前步骤", "可调用的系统和权限", "失败时谁来处理"],
      steps: [
        "记录人工流程和每一步的输入输出",
        "先自动化稳定、重复、可验证的部分",
        "配置触发条件、连接凭据和字段映射",
        "为超时、重复执行和权限失败设计恢复",
        "用真实小样本运行并检查日志"
      ],
      done: ["相同输入不会重复造成损失", "失败时有明确提醒与人工入口", "敏感凭据没有出现在公开页面"],
      pitfalls: ["一开始就自动化整条复杂流程", "只测试成功路径，没有测试失败和重复执行"],
      toolIds: ["coze", "n8n", "chatgpt"],
      relatedTermIds: ["workflow", "agent", "toolCalling", "api", "apiKey"],
      verifiedAt: "2026-08-31",
      featured: false
    },
    {
      id: "meeting-actions",
      category: "会议",
      title: "把会议变成可执行事项",
      summary: "从录音和记录中提取决定、负责人和截止时间。",
      deliverable: "摘要、决定、行动项、负责人、截止时间",
      inputs: ["会议录音或文字记录", "参会人名称", "项目背景与已有决定"],
      steps: [
        "取得录音和参会人的使用授权",
        "转写并标记无法听清的片段",
        "提取决定、分歧、待确认和行动项",
        "人工确认负责人、日期和关键数字",
        "把最终行动项放回团队使用的系统"
      ],
      done: ["决定与讨论意见明确区分", "每个行动项有负责人和截止时间", "隐私内容按权限保存"],
      pitfalls: ["把模型总结直接当会议决定", "没有回到原录音核对关键数字和姓名"],
      toolIds: ["tingwu", "notebooklm", "kimi"],
      relatedTermIds: ["memory", "sourceOfTruth", "workflow", "hitl"],
      verifiedAt: "2026-08-31",
      featured: false
    }
  ];

  const methodCards = [
    { id: "terms-first", order: "00", title: "先把常用词听懂", summary: "不背术语；先知道模型、产品、Agent、Skill、MCP、API 和 Git 各自负责什么。", termId: "model" },
    { id: "define-deliverable", order: "01", title: "先写清最后要交付什么", summary: "写清给谁使用、包含什么、怎样才算完成。", termId: "acceptanceCriteria" },
    { id: "four-parts", order: "02", title: "一件事要配齐四样", summary: "材料、工具、执行步骤和验收标准缺一不可。", termId: "workflow" },
    { id: "switch-tools", order: "03", title: "知道什么时候该换工具", summary: "当前工具做不到、成本失控或缺少关键能力时再换。", termId: "baseline" },
    { id: "iterate", order: "04", title: "做一版，检查，再修改", summary: "先完成可检查的版本，再按问题修正并复测。", termId: "iteration" },
    { id: "save-version", order: "05", title: "保存项目，也能找回旧版本", summary: "用 Git 保存修改记录，再用 GitHub 或 Gitee 托管项目。", termId: "git" }
  ];

  const extraTerms = {
    model: {
      group: "入门概念",
      term: "模型",
      translation: "Model / 训练好的能力底座",
      aliases: ["模型", "Model"],
      summary: "模型是训练好的能力底座；ChatGPT、豆包是产品，GPT、DeepSeek 等具体型号才是模型。",
      logic: "产品把模型、界面、工具、数据和规则组合起来，所以同一个模型放进不同产品，使用体验也会不同。",
      example: "选择写作工具时既要看它使用的模型，也要看文件、搜索、协作和地区入口。"
    },
    multimodal: {
      group: "入门概念",
      term: "多模态",
      translation: "Multimodal",
      aliases: ["多模态", "Multimodal"],
      summary: "同一个 AI 能理解或生成文字、图片、声音、视频等多种信息。",
      logic: "不同模态会先转换成模型能处理的表示，再在同一个任务中共同使用。",
      example: "把产品截图、用户录音和文字要求一起交给 AI 做体验审查。"
    },
    contextWindow: {
      group: "入门概念",
      term: "上下文窗口",
      translation: "Context Window",
      aliases: ["上下文窗口", "Context Window"],
      summary: "一次任务里模型能够共同看见的信息容量，不等于永久记忆。",
      logic: "对话、文件、工具结果和模型输出都会占用窗口；超过容量时需要删减、摘要或检索。",
      example: "一个超长项目不能只靠把所有文件一次粘进去，通常要先索引再按需取回。"
    },
    systemPrompt: {
      group: "Agent 与连接",
      term: "系统提示词",
      translation: "System Prompt",
      aliases: ["系统提示词", "System Prompt"],
      summary: "产品在后台预先给模型的角色、边界和长期规则。",
      logic: "它的优先级通常高于普通用户输入，但仍不能替代真实权限控制和程序校验。",
      example: "客服助手可以被要求始终引用政策来源，但退款权限仍必须由业务系统控制。"
    },
    skill: {
      group: "Agent 与连接",
      term: "Skill",
      translation: "技能包 / 可复用任务能力",
      aliases: ["Skill", "技能包"],
      summary: "把任务说明、步骤、模板和工具使用方式封装成可重复调用的能力。",
      logic: "Skill 告诉 Agent 怎样稳定完成一类任务，但能否执行仍取决于可用工具和权限。",
      example: "一个日报 Skill 可以规定检索来源、摘要格式、核验要求和失败处理。"
    },
    mcp: {
      group: "Agent 与连接",
      term: "MCP",
      translation: "模型上下文协议；Model Context Protocol",
      aliases: ["MCP", "模型上下文协议"],
      summary: "让 Agent 用统一方式发现并连接外部工具、数据和资源的协议。",
      logic: "MCP 规定连接方式和能力描述，不等于某一个具体工具，也不会自动赋予权限。",
      example: "Agent 可以通过 MCP 读取团队知识库，但仍要使用被授权的账号和数据范围。"
    },
    workflow: {
      group: "Agent 与连接",
      term: "工作流",
      translation: "Workflow",
      aliases: ["工作流", "Workflow"],
      summary: "把任务固定成输入、步骤、输出、验收和异常处理的一条执行路径。",
      logic: "工作流适合步骤清楚、需要稳定复现的任务；不一定需要 Agent 自主规划。",
      example: "周报工作流可以固定为收集材料、分类、生成初稿、核验和发布。"
    },
    apiKey: {
      group: "Agent 与连接",
      term: "API Key",
      translation: "接口访问密钥",
      aliases: ["API Key", "接口密钥"],
      summary: "调用服务时证明身份和权限的秘密字符串，不能放进公开网页或公开仓库。",
      logic: "服务端用它识别调用者、限制权限和计算用量；泄露后应立即撤销并更换。",
      example: "网页前端不应直接写入付费模型的 API Key，应通过受控服务端调用。"
    },
    repository: {
      group: "构建与版本",
      term: "Repo / 仓库",
      translation: "Repository",
      aliases: ["Repo", "Repository", "仓库"],
      summary: "一个项目的文件、版本历史和协作信息的完整容器。",
      logic: "Git 在仓库里记录变化；GitHub、Gitee 等平台负责远程托管和协作。",
      example: "网页源码、测试和部署脚本应该放在同一个项目仓库中一起追踪。"
    },
    githubGitee: {
      group: "构建与版本",
      term: "GitHub / Gitee",
      translation: "在线 Git 仓库托管平台",
      aliases: ["GitHub", "Gitee"],
      summary: "保存和协作 Git 仓库的在线平台，不等于 Git 本身。",
      logic: "本地 Git 负责版本记录，托管平台提供远程备份、协作、自动化和发布能力。",
      example: "断网时仍可在本地使用 Git 提交，联网后再推送到 GitHub 或 Gitee。"
    },
    commit: {
      group: "构建与版本",
      term: "Commit / 提交",
      translation: "一个带说明的版本快照",
      aliases: ["Commit", "提交"],
      summary: "把一组已经确认的修改保存成可以追踪和比较的版本点。",
      logic: "一次提交应围绕一个清楚目的，并写明改了什么、为什么改。",
      example: "完成 AI应用站首页并通过测试后，单独形成一个提交。"
    },
    branch: {
      group: "构建与版本",
      term: "Branch / 分支",
      translation: "独立修改线",
      aliases: ["Branch", "分支"],
      summary: "从共同历史分出的独立修改线，确认后再合并回主线。",
      logic: "分支让实验和正式版本互不干扰，但仍需要处理冲突和明确合并边界。",
      example: "大改页面时在独立分支测试，确认后再合并到 main。"
    },
    deploy: {
      group: "构建与版本",
      term: "部署",
      translation: "Deploy",
      aliases: ["部署", "Deploy"],
      summary: "把本地或仓库中的确定版本发布到用户可以访问的环境。",
      logic: "提交、推送、构建和线上验证是不同状态；只有线上目标通过检查才算部署完成。",
      example: "本地页面能打开不代表 GitHub Pages、Cloudflare 和国内通道已经更新。"
    },
    baseline: {
      group: "可靠性",
      term: "基线",
      translation: "Baseline",
      aliases: ["基线", "Baseline"],
      summary: "用于比较改进效果的起点版本、起点数据或起点成绩。",
      logic: "没有基线就无法判断新工具或新方法是真的更好，还是只是看起来更新。",
      example: "换模型前先用同一组任务记录当前正确率、速度和成本。"
    },
    acceptanceCriteria: {
      group: "可靠性",
      term: "验收标准",
      translation: "Acceptance Criteria",
      aliases: ["验收标准", "Acceptance Criteria"],
      summary: "在开始前写清哪些可观察条件满足，任务才算完成。",
      logic: "验收标准把“感觉不错”变成可以检查的结果、边界和失败条件。",
      example: "研究简报必须有三条原文来源、明确日期，并把未确认内容单独列出。"
    },
    iteration: {
      group: "可靠性",
      term: "迭代",
      translation: "Iteration",
      aliases: ["迭代", "Iteration"],
      summary: "先做出可检查的一版，再根据真实问题修改并复测。",
      logic: "每一轮都应有明确变化和检查结果，而不是无限生成更多版本。",
      example: "网页先完成核心路径，手机测试发现导航拥挤后再修正并重测。"
    },
    rollback: {
      group: "可靠性",
      term: "回滚",
      translation: "Rollback",
      aliases: ["回滚", "Rollback"],
      summary: "新版本出现问题时，恢复到上一个已经确认可用的版本。",
      logic: "可靠回滚依赖清楚的版本记录、数据兼容和事先准备的恢复路径。",
      example: "部署后核心页面打不开，应切回上一发布版本，而不是在线盲改。"
    },
    sourceOfTruth: {
      group: "可靠性",
      term: "单一事实源",
      translation: "Source of Truth",
      aliases: ["单一事实源", "Source of Truth", "事实来源"],
      summary: "团队约定某类信息唯一算数的最新系统、数据或文件。",
      logic: "API、RAG 和 Memory 是读取或保存方式；真正权威的是负责这类事实的来源。",
      example: "商品当前价格以商品系统为准，旧知识库文章不能覆盖实时价格。"
    },
    openSource: {
      group: "构建与版本",
      term: "开源",
      translation: "Open Source",
      aliases: ["开源", "Open Source"],
      summary: "源码按许可证公开，允许的复制、修改和商用范围由许可证决定。",
      logic: "公开可见不等于无条件免费，也不代表数据、商标和第三方内容一起获得授权。",
      example: "使用开源代码前仍要检查许可证、署名和再分发条件。"
    }
  };

  const baseTermGroups = {
    evals: "可靠性",
    prompt: "入门概念",
    llm: "入门概念",
    rag: "Agent 与连接",
    toolCalling: "Agent 与连接",
    memory: "Agent 与连接",
    ruleEngine: "可靠性",
    hitl: "可靠性",
    api: "Agent 与连接",
    json: "构建与版本",
    http: "构建与版本",
    git: "构建与版本",
    machineLearning: "入门概念",
    neuralNetwork: "入门概念",
    transformer: "入门概念",
    token: "入门概念",
    embedding: "Agent 与连接",
    vectorDatabase: "Agent 与连接",
    hallucination: "可靠性",
    fineTuning: "入门概念",
    agent: "Agent 与连接"
  };

  return {
    portals: portals,
    workflows: workflows,
    methodCards: methodCards,
    extraTerms: extraTerms,
    baseTermGroups: baseTermGroups,
    verifiedAt: "2026-08-31"
  };
});
