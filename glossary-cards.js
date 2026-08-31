(() => {
  "use strict";

  const TERMS = {
    evals: {
      term: "Evals",
      translation: "AI 评估 / 评测体系；Evaluation(s) 的行业简称",
      aliases: ["Evals", "Eval"],
      summary:
        "用一组可重复的样本、标准和评分方法，判断 AI 的结果、过程与安全边界是否达到要求。三层评估是一种 Evals 框架，不是 Evals 的全部定义。",
      logic:
        "先把“做得好”和“绝不能失败”写成可检查条件，再让系统重复执行代表性任务，用人工规则、程序或模型评分，最后分析失败并回归测试。",
      flow: ["定义任务目标与风险", "准备测试样本和期望结果", "运行模型或完整系统", "按评分规则记录结果", "分析失败并修复", "重新运行回归测试"],
      where: ["模型或 Prompt 选型", "RAG、Agent、工具调用改版", "产品上线验收", "线上质量监控"],
      example:
        "会员余额查询不仅检查金额是否正确，还要检查是否调用了真实余额 API、是否完成权限校验、查不到时是否按规则转人工。"
    },
    prompt: {
      term: "Prompt",
      translation: "提示词 / 给 AI 的任务输入",
      aliases: ["Prompt", "Prompts", "提示词"],
      summary:
        "向模型说明目标、背景、约束、输入和期望输出的任务信息。高质量 Prompt 更接近任务规格，而不是一句神奇口令。",
      logic:
        "通过减少歧义和补齐上下文，让模型知道要做什么、不能做什么，以及怎样才算完成。",
      flow: ["明确目标与用户", "提供必要事实和上下文", "写出约束与禁止项", "规定输出格式", "定义验收标准", "用样例测试并修订"],
      where: ["对话助手", "内容生成", "信息抽取与分类", "Agent 指令", "Evals 测试输入"],
      example:
        "把“帮我查余额”改成包含用户身份、唯一数据源、输出字段、超时处理和验收标准的任务规格。"
    },
    llm: {
      term: "LLM",
      translation: "大语言模型；Large Language Model",
      aliases: ["LLM", "LLMs", "大语言模型"],
      summary:
        "从大量文本中学习语言规律，并根据当前上下文逐步生成 Token 的模型。它擅长理解与生成，但不是事实数据库，也不能天然保证正确。",
      logic:
        "把输入转换为 Token，在上下文中计算下一个 Token 的概率，再连续生成输出；外部知识、工具和规则需要由系统另外提供。",
      flow: ["接收指令与上下文", "文本切分为 Token", "模型进行推理计算", "逐步生成结果", "经过规则或工具校验", "向用户呈现"],
      where: ["聊天助手", "摘要与写作", "分类与抽取", "代码生成", "AI 系统的语言与推理层"],
      example:
        "LLM 可以理解用户要查会员余额，但真实金额必须来自账户 API，不能由模型猜测。"
    },
    rag: {
      term: "RAG",
      translation: "检索增强生成；Retrieval-Augmented Generation",
      aliases: ["RAG", "检索增强生成"],
      summary:
        "在模型回答前先从外部知识源检索相关内容，再把检索结果作为上下文交给模型生成答案。",
      logic:
        "把模型参数之外的知识按需取回，降低仅靠记忆生成造成的过时与幻觉，但检索质量和来源权限仍需单独控制。",
      flow: ["接收用户问题", "把问题转换为检索请求", "搜索并召回候选资料", "筛选或重排资料", "组装上下文", "模型回答并尽量给出来源"],
      where: ["企业知识库", "政策与制度问答", "客服 FAQ", "需要引用来源的研究助手"],
      example:
        "会员规则可以通过 RAG 检索，但实时余额不能来自 RAG，必须调用账户系统。"
    },
    toolCalling: {
      term: "Tool Calling",
      translation: "工具调用 / 函数调用",
      aliases: ["Tool Calling", "Function Calling", "工具调用", "函数调用"],
      summary:
        "模型根据任务选择一个预先定义的工具并生成结构化参数，真正的查询或操作由外部程序执行。",
      logic:
        "模型负责判断“该用哪个工具、需要哪些参数”，系统负责权限校验、实际执行和结果返回，二者不能混为一体。",
      flow: ["系统声明可用工具与参数", "模型识别调用意图", "生成结构化调用参数", "系统验证权限与参数", "执行真实工具", "把结果返回模型或界面"],
      where: ["账户查询", "订单与物流", "日历和邮件", "数据库读写", "Agent 工作流"],
      example:
        "查询余额时，LLM 生成会员 ID 等参数，账户服务执行查询，模型只负责解释返回结果。"
    },
    memory: {
      term: "Memory",
      translation: "AI 记忆 / 长期偏好存储",
      aliases: ["Memory", "AI 记忆", "长期记忆"],
      summary:
        "把跨轮次仍有价值的用户偏好、历史决策或任务状态保存下来，并在未来任务中按需取回。",
      logic:
        "只保存经过选择的信息，而不是无限记录所有对话；读取时还要考虑权限、时效和是否与当前任务相关。",
      flow: ["识别值得保存的信息", "取得授权并结构化记录", "设置范围和有效期", "新任务时检索相关记忆", "注入上下文", "允许更正或删除"],
      where: ["个性化助手", "长期学习教练", "项目决策记录", "多轮 Agent 任务"],
      example:
        "课程保存你的关卡进度和能力卡，但不应把临时错误答案永久当作正确偏好。"
    },
    ruleEngine: {
      term: "Rule Engine",
      translation: "规则引擎",
      aliases: ["Rule Engine", "规则引擎"],
      summary:
        "用确定性条件执行允许、禁止、分流和阈值判断的系统组件，不依赖模型自由发挥。",
      logic:
        "把必须稳定遵守的业务和安全规则写成可执行条件，让相同输入得到可预测的处理。",
      flow: ["定义条件与优先级", "接收结构化事实", "逐条匹配规则", "执行允许、拒绝或分流动作", "记录命中原因", "定期更新规则"],
      where: ["权限控制", "风控与合规", "价格和资格判断", "安全拦截", "HITL 分流"],
      example:
        "未通过身份校验时，规则引擎直接禁止返回余额，不让 LLM 自行判断是否可以透露。"
    },
    hitl: {
      term: "HITL",
      translation: "人在回路中；Human in the Loop",
      aliases: ["HITL", "Human in the Loop", "人在回路中", "人工复核"],
      summary:
        "在高风险、低置信度或异常任务中，把关键判断交给人类确认，而不是让 AI 独立完成。",
      logic:
        "系统先识别需要人工介入的触发条件，再把上下文和建议交给人处理，并把最终决定记录下来。",
      flow: ["检测风险或异常", "停止自动执行", "生成完整复核材料", "进入人工队列", "人工判断或补充信息", "记录决定并反馈系统"],
      where: ["医疗与金融", "内容安全", "退款和申诉", "权限异常", "高价值操作"],
      example:
        "余额接口超时或账户归属不一致时，不生成金额，而是提供原因并转人工复核。"
    },
    api: {
      term: "API",
      translation: "应用程序接口；Application Programming Interface",
      aliases: ["API", "APIs", "应用程序接口"],
      summary:
        "软件之间按照约定格式交换数据或触发操作的接口，可以理解为系统对外提供的正式服务窗口。",
      logic:
        "调用方按接口契约发送请求，服务方验证身份和参数，执行逻辑后返回结构化结果与状态。",
      flow: ["读取接口契约", "准备身份凭证和参数", "发送请求", "服务端校验与执行", "返回状态和数据", "处理成功、失败与重试"],
      where: ["前后端通信", "第三方服务接入", "Tool Calling", "支付、会员和订单系统"],
      example:
        "会员账户系统是余额的事实来源，余额 API 是访问它的通道；成功时返回金额、币种和更新时间，失败时返回明确错误码。"
    },
    json: {
      term: "JSON",
      translation: "JavaScript 对象表示法；JavaScript Object Notation",
      aliases: ["JSON"],
      summary:
        "一种常用的结构化文本格式，用键值、数组、数字、布尔值和空值表示数据。",
      logic:
        "人和程序都能较容易读取，但必须遵守严格语法；字段名称和类型通常由接口契约规定。",
      flow: ["定义字段结构", "把数据序列化为 JSON", "通过文件或网络传输", "接收方解析", "校验字段和类型", "执行业务逻辑"],
      where: ["API 请求与响应", "配置文件", "Tool Calling 参数", "数据交换"],
      example:
        "余额接口可以返回 {\"balance\":680,\"currency\":\"CNY\",\"updatedAt\":\"...\"}。"
    },
    http: {
      term: "HTTP",
      translation: "超文本传输协议；Hypertext Transfer Protocol",
      aliases: ["HTTP", "HTTPS"],
      summary:
        "客户端与服务器在网络上发送请求和响应的通用协议，HTTPS 是加入加密保护的 HTTP。",
      logic:
        "请求包含方法、地址、头和数据，响应包含状态码、头和结果；双方通过状态码判断成功或失败。",
      flow: ["客户端组成请求", "通过网络发送", "服务器路由和处理", "返回状态码与数据", "客户端解析", "按错误类型重试或提示"],
      where: ["网页加载", "API 调用", "文件下载", "服务之间通信"],
      example:
        "GET 请求查询余额；200 表示成功，401 表示未授权，404 表示会员不存在，500 表示服务异常。"
    },
    git: {
      term: "Git",
      translation: "分布式版本控制系统",
      aliases: ["Git", "版本控制"],
      summary:
        "记录文件每次变化、支持比较版本和多人协作的工具。GitHub 是托管 Git 仓库的平台之一。",
      logic:
        "修改先进入工作区，选择后进入暂存区，再通过提交形成可追踪版本，最后可以推送到远程仓库。",
      flow: ["修改文件", "检查差异", "暂存所需变更", "创建提交", "推送或合并", "通过历史定位问题"],
      where: ["软件开发", "课程网页发布", "配置和文档管理", "团队协作与代码审查"],
      example:
        "每次课程功能升级形成一个 commit，GitHub Pages 再从 main 分支构建公开页面。"
    },
    machineLearning: {
      term: "Machine Learning",
      translation: "机器学习；ML",
      aliases: ["Machine Learning", "机器学习", "ML"],
      summary:
        "让程序从数据中学习规律，并对新输入进行预测或决策，而不是把所有判断规则逐条手写。",
      logic:
        "选择任务和数据，用算法学习参数，再用未见数据验证泛化能力，最后部署并持续监控。",
      flow: ["定义问题", "收集与清洗数据", "划分训练和测试集", "训练模型", "评估与调参", "部署和监控"],
      where: ["推荐与排序", "风险预测", "图像和语音识别", "异常检测", "生成式 AI"],
      example:
        "用历史客服数据训练分类模型，预测新问题应该进入哪个服务队列。"
    },
    neuralNetwork: {
      term: "Neural Network",
      translation: "神经网络",
      aliases: ["Neural Network", "Neural Networks", "神经网络"],
      summary:
        "由多层可学习计算单元组成的模型，通过调整大量参数学习输入与输出之间的复杂关系。",
      logic:
        "数据向前通过各层得到预测，再根据预测误差反向计算参数应如何调整，重复训练直到性能稳定。",
      flow: ["输入数据", "逐层前向计算", "得到预测", "计算损失", "反向传播梯度", "更新参数并重复"],
      where: ["图像、语音和文本", "推荐系统", "大语言模型", "复杂模式识别"],
      example:
        "LLM 的底层是大规模神经网络，但产品仍需要数据、工具、规则和 Evals 才能可靠工作。"
    },
    transformer: {
      term: "Transformer",
      translation: "Transformer 架构 / 变换器架构",
      aliases: ["Transformer", "Transformers"],
      summary:
        "以注意力机制为核心处理序列信息的神经网络架构，是现代大语言模型的主要基础。",
      logic:
        "让每个 Token 根据当前上下文关注其他相关 Token，并通过多层计算形成更丰富的表示。",
      flow: ["文本转为 Token", "加入位置等信息", "注意力计算相关性", "多层变换表示", "预测下一个 Token", "重复生成"],
      where: ["LLM", "机器翻译", "文本分类", "多模态模型", "代码模型"],
      example:
        "在“会员余额查询”中，Transformer 帮助模型理解“余额”与当前会员账户的语义关系。"
    },
    token: {
      term: "Token",
      translation: "模型处理文本的基本片段",
      aliases: ["Token", "Tokens"],
      summary:
        "模型不会直接按完整句子阅读文本，而是把文字切成 Token；一个 Token 可能是字、词的一部分或符号。",
      logic:
        "分词器把文本映射为编号，模型处理这些编号并预测下一个编号，最后再还原为文字。",
      flow: ["输入文本", "分词切分", "转换为 Token ID", "模型计算", "生成新 Token ID", "解码为文本"],
      where: ["上下文长度", "API 计费", "输出长度控制", "Prompt 设计"],
      example:
        "资料越长，占用的 Token 越多；超过上下文窗口时需要截断、摘要或检索。"
    },
    embedding: {
      term: "Embedding",
      translation: "向量表示 / 嵌入",
      aliases: ["Embedding", "Embeddings", "向量表示"],
      summary:
        "把文字、图片等内容转换成一组数字，使语义相近的内容在向量空间中更接近。",
      logic:
        "模型为输入生成固定长度向量，再用相似度计算寻找与查询最相关的内容。",
      flow: ["切分资料", "生成 Embedding", "保存向量和原文", "为问题生成向量", "计算相似度", "返回相关片段"],
      where: ["RAG 检索", "语义搜索", "聚类与推荐", "重复内容检测"],
      example:
        "“退款规则”和“如何退钱”用词不同，但 Embedding 可能判断它们语义相近。"
    },
    vectorDatabase: {
      term: "Vector Database",
      translation: "向量数据库",
      aliases: ["Vector Database", "Vector DB", "向量数据库"],
      summary:
        "专门保存和检索 Embedding 的数据库，能按向量相似度快速寻找相关内容。",
      logic:
        "把向量、原文和权限等元数据一起保存，查询时结合相似度和过滤条件召回候选资料。",
      flow: ["生成并写入向量", "保存原文与元数据", "接收查询向量", "执行相似度搜索", "按权限过滤", "返回候选内容"],
      where: ["RAG", "语义搜索", "推荐系统", "多媒体检索"],
      example:
        "企业知识库可用向量数据库找出相关制度，但仍要验证资料版本和访问权限。"
    },
    hallucination: {
      term: "Hallucination",
      translation: "AI 幻觉",
      aliases: ["Hallucination", "Hallucinations", "AI 幻觉", "幻觉"],
      summary:
        "模型生成了听起来合理、实际上没有事实依据或与来源冲突的内容。",
      logic:
        "语言模型优化的是生成可能性，不是真实性；缺少信息时仍可能继续补全，因此必须通过数据源、工具和 Evals 控制。",
      flow: ["识别高风险事实", "要求使用可信来源或工具", "检查回答与来源一致性", "无法确认时明确说明", "记录失败样本", "加入回归测试"],
      where: ["事实问答", "法律医疗金融", "引用与数据生成", "长文本总结"],
      example:
        "账户接口没有返回数据时，模型自行生成一个余额，就是严重幻觉和硬性失败。"
    },
    fineTuning: {
      term: "Fine-tuning",
      translation: "微调",
      aliases: ["Fine-tuning", "Fine Tuning", "微调"],
      summary:
        "使用特定数据继续训练已有模型，让它更稳定地学习某种行为、格式或领域模式。",
      logic:
        "把高质量示例转化为训练信号，调整模型部分或全部参数；它不适合替代实时知识库和确定性业务数据。",
      flow: ["明确需要改变的行为", "准备并清洗训练数据", "划分训练和评估集", "执行微调", "运行 Evals 对比", "部署并持续监控"],
      where: ["固定格式输出", "领域语言风格", "特定分类任务", "模型行为定制"],
      example:
        "可以微调客服回复风格，但不能靠微调保存每天变化的会员余额。"
    },
    agent: {
      term: "AI Agent",
      translation: "AI 智能体 / 代理",
      aliases: ["AI Agent", "Agent", "Agents", "智能体"],
      summary:
        "能够围绕目标规划步骤、调用工具、读取结果并继续行动的 AI 系统，而不只是生成一次回答。",
      logic:
        "模型负责选择下一步，工具提供真实能力，状态保存过程，规则和 HITL 限制风险，Evals 检查整个任务是否可靠完成。",
      flow: ["接收目标", "分析状态并规划", "选择工具执行", "读取并判断结果", "必要时调整计划", "完成、停止或转人工"],
      where: ["研究与资料整理", "客服流程", "代码任务", "运营自动化", "多步骤业务处理"],
      example:
        "余额查询通常只需一次工具调用；若还要核验身份、查询记录并创建工单，才更接近 Agent 工作流。"
    }
  };

  // Share the maintained course glossary with the AI application station.
  // The station only reads this object; course-side scanning and cards remain unchanged.
  window.GOGO_GLOSSARY_TERMS = TERMS;

  const aliasToKey = {};
  Object.keys(TERMS).forEach((key) => {
    TERMS[key].aliases.forEach((alias) => {
      aliasToKey[alias.toLowerCase()] = key;
    });
  });

  const aliases = Object.keys(aliasToKey).sort((a, b) => b.length - a.length);
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = aliases
    .map((alias) => {
      const escaped = escapeRegExp(alias);
      return /[a-z0-9]/i.test(alias) ? `\\b${escaped}\\b` : escaped;
    })
    .join("|");
  const termPattern = new RegExp(pattern, "gi");
  const scanRoots = ".pg-legacy-content, .pg-drawer-body";
  const skipSelector =
    "script,style,textarea,input,select,option,code,pre,a,button,.gc-term,.gc-card,[contenteditable='true']";
  let card = null;
  let lastTrigger = null;
  let scanQueued = false;

  function ensureCard() {
    if (card) return card;
    card = document.createElement("div");
    card.className = "gc-overlay";
    card.hidden = true;
    card.innerHTML = `
      <section class="gc-card" role="dialog" aria-modal="true" aria-labelledby="gc-title">
        <button type="button" class="gc-close" aria-label="关闭术语词卡">×</button>
        <p class="gc-kicker">TERM CARD · 术语词卡</p>
        <h2 id="gc-title"></h2>
        <p class="gc-translation" id="gc-translation"></p>
        <p class="gc-summary" id="gc-summary"></p>
        <section class="gc-section">
          <h3>工作逻辑</h3>
          <p id="gc-logic"></p>
        </section>
        <section class="gc-section">
          <h3>标准工作流程</h3>
          <ol class="gc-flow" id="gc-flow"></ol>
        </section>
        <section class="gc-section">
          <h3>通常出现在哪里</h3>
          <ul class="gc-where" id="gc-where"></ul>
        </section>
        <section class="gc-example">
          <h3>本课中的例子</h3>
          <p id="gc-example"></p>
        </section>
      </section>
    `;
    document.body.appendChild(card);
    card.querySelector(".gc-close").addEventListener("click", closeCard);
    card.addEventListener("click", (event) => {
      if (event.target === card) closeCard();
    });
    return card;
  }

  function fillList(element, items) {
    element.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.appendChild(li);
    });
  }

  function openCard(key, trigger) {
    const data = TERMS[key];
    if (!data) return;
    const overlay = ensureCard();
    lastTrigger = trigger || null;
    overlay.querySelector("#gc-title").textContent = data.term;
    overlay.querySelector("#gc-translation").textContent = data.translation;
    overlay.querySelector("#gc-summary").textContent = data.summary;
    overlay.querySelector("#gc-logic").textContent = data.logic;
    overlay.querySelector("#gc-example").textContent = data.example;
    fillList(overlay.querySelector("#gc-flow"), data.flow);
    fillList(overlay.querySelector("#gc-where"), data.where);
    overlay.hidden = false;
    document.body.classList.add("gc-is-open");
    overlay.querySelector(".gc-close").focus();
  }

  function closeCard() {
    if (!card) return;
    card.hidden = true;
    document.body.classList.remove("gc-is-open");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  function wrapTextNode(node) {
    const text = node.nodeValue;
    termPattern.lastIndex = 0;
    let match = termPattern.exec(text);
    if (!match) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    while (match) {
      if (match.index > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }
      const original = match[0];
      const key = aliasToKey[original.toLowerCase()];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gc-term";
      button.dataset.gcTerm = key;
      button.textContent = original;
      button.setAttribute("aria-label", `查看术语 ${original} 的解释`);
      button.setAttribute("aria-haspopup", "dialog");
      fragment.appendChild(button);
      cursor = match.index + original.length;
      match = termPattern.exec(text);
    }
    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.replaceWith(fragment);
  }

  function scan(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest(skipSelector)) return NodeFilter.FILTER_REJECT;
        termPattern.lastIndex = 0;
        return termPattern.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }
    nodes.forEach(wrapTextNode);
  }

  function scanAll() {
    document.querySelectorAll(scanRoots).forEach(scan);
  }

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      scanAll();
    });
  }

  function boot() {
    ensureCard();
    scanAll();
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest?.(".gc-term");
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      openCard(trigger.dataset.gcTerm, trigger);
    });
    document.addEventListener("keydown", (event) => {
      if (!card || card.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeCard();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(card.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((node) => node.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!card.contains(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        (event.shiftKey ? last : first).focus();
      }
    });
    new MutationObserver(queueScan).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
