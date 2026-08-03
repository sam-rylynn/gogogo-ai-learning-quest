(function () {
  "use strict";

  var curriculum = window.GOGOGO_DEEP_CURRICULUM;
  if (!curriculum || !curriculum.levels) return;

  function findLesson(id) {
    var result = null;
    Object.keys(curriculum.levels).some(function (levelIndex) {
      var lessons = curriculum.levels[levelIndex];
      if (!Array.isArray(lessons)) return false;
      result = lessons.filter(function (item) { return item.id === id; })[0] || null;
      return Boolean(result);
    });
    return result;
  }

  function flow(items) {
    if (!items || !items.length) return "";
    return '<div class="ul-visual-flow">' + items.map(function (item, index) {
      var node = '<div class="ul-visual-node"><small>' + item[0] + '</small><strong>' + item[1] + '</strong><span>' + item[2] + '</span></div>';
      return node + (index < items.length - 1 ? '<i>&gt;</i>' : "");
    }).join("") + '</div>';
  }

  function concepts(items) {
    if (!items || !items.length) return "";
    return '<div class="ul-concept-grid">' + items.map(function (item) {
      return '<div><strong>' + item[0] + '</strong><span>' + item[1] + '</span></div>';
    }).join("") + '</div>';
  }

  function examples(items) {
    if (!items || !items.length) return "";
    return '<div class="ul-example-pair">' + items.map(function (item) {
      return '<div class="' + (item[0] || "") + '"><b>' + item[1] + '</b><p>' + item[2] + '</p><small>' + item[3] + '</small></div>';
    }).join("") + '</div>';
  }

  function addBeginner(config) {
    var lesson = findLesson(config.id);
    if (!lesson) return;
    lesson.beginnerCore = config.core;
    lesson.beginnerBody =
      '<div class="ul-beginner-hero"><span>先说人话</span><h2>' + config.title + '</h2><p>' + config.plain + '</p></div>' +
      (config.visualTitle ? '<h2>' + config.visualTitle + '</h2>' : "") +
      flow(config.flow) +
      (config.conceptTitle ? '<h2>' + config.conceptTitle + '</h2>' : "") +
      concepts(config.concepts) +
      (config.exampleTitle ? '<h2>' + config.exampleTitle + '</h2>' : "") +
      examples(config.examples) +
      (config.analogy ? '<div class="ul-analogy-card"><b>' + config.analogy[0] + '</b><p>' + config.analogy[1] + '</p></div>' : "") +
      '<div class="ul-beginner-check"><b>用自己的话说：</b>' + config.check + '</div>';
  }

  [
    {
      id: "l1-task-spec",
      core: "任务规格就是给 AI 的工作说明书：谁要做什么、数据从哪来、不能做什么、怎样算完成。",
      title: "不要只告诉 AI“去做”，还要告诉它“怎样才算做对”",
      plain: "像安排新同事工作。只说“帮我查余额”，他有很多地方只能猜；任务规格就是提前消除这些关键猜测。",
      visualTitle: "一条完整路线",
      flow: [["01", "谁在用", "已登录会员"], ["02", "要做什么", "查询当前余额"], ["03", "相信谁", "账户系统"], ["04", "不能做什么", "不能猜金额"], ["05", "怎样算完成", "金额与系统一致"]],
      conceptTitle: "四个词先这样记",
      concepts: [["目标", "用户最终想解决的问题"], ["数据来源", "答案应该从哪个系统取得"], ["约束", "绝对不能越过的边界"], ["验收标准", "用什么证据判断完成"]],
      exampleTitle: "坏要求和好要求",
      examples: [["is-wrong", "不够清楚", "“帮会员查余额。”", "缺少身份、来源、输出和失败处理。"], ["is-right", "更清楚", "“校验会员身份后，从账户系统读取余额；查不到时不得估算。”", "每个关键步骤都有明确边界。"]],
      check: "任务规格不是把句子写长，而是消除了哪些关键不确定性？"
    },
    {
      id: "l1-system-roles",
      core: "AI 产品像一个团队：LLM 听懂和表达，资料库提供知识，工具执行动作，规则和人工守住边界。",
      title: "不要让一个会说话的人同时当数据库、收银员和安全员",
      plain: "LLM 很会理解与表达，但它不天然知道实时余额，也不能凭自己完成退款。",
      visualTitle: "余额查询由谁完成",
      flow: [["用户", "提出需求", "“我的余额多少？”"], ["LLM", "听懂问题", "识别查询意图"], ["规则", "检查边界", "确认身份权限"], ["工具", "真正查询", "调用账户系统"], ["LLM", "解释结果", "把数据说清楚"]],
      conceptTitle: "两组关键区别",
      concepts: [["RAG", "从授权资料里找证据"], ["工具调用", "查询实时数据或执行动作"], ["规则", "执行明确的安全边界"], ["HITL", "人工处理高风险例外"]],
      analogy: ["餐厅类比", "LLM 像服务员，RAG 像菜单资料，工具像后厨和收银系统，规则像食品安全制度，HITL 像需要店长处理的例外。"],
      check: "模型知道退款政策，为什么不等于系统已经完成退款？"
    },
    {
      id: "l1-evals-basics",
      core: "Evals 就是给 AI 系统准备可重复的考试：有题目、标准答案、判卷方法和及格线。",
      title: "Evals = 出卷、考试、判卷、看是否及格",
      plain: "只看一次漂亮回答，像只看学生做对一道题。固定考试才能判断系统是否稳定。",
      visualTitle: "一条 Eval 的最小结构",
      flow: [["题目", "Input", "用户询问余额"], ["标准", "Expected", "应读取账户系统"], ["作答", "Actual", "系统真实结果"], ["判卷", "Grader", "检查是否符合标准"]],
      exampleTitle: "结果一样，可靠性不同",
      examples: [["is-wrong", "碰巧答对", "模型没查系统，却猜中 680。", "这次答对不代表下次可靠。"], ["is-right", "过程也正确", "先校验权限，再读取字段并显示 680。", "结果、过程和安全都有证据。"]],
      analogy: ["驾考类比", "到达终点是结果；有没有遵守红绿灯是过程；有没有危害他人是安全。闯红灯后更快到达也不能通过。"],
      check: "一条 Eval 和一套 Eval Set 有什么区别？"
    },
    {
      id: "l1-hard-soft-metrics",
      core: "先检查不能发生的红线错误，再比较清晰度、速度等体验；高平均分不能抵消严重事故。",
      title: "有些错误是扣分，有些错误是直接不及格",
      plain: "回答稍微啰嗦可以继续优化；泄露他人余额不能靠其他高分补回来。",
      visualTitle: "上线前要过两道门",
      flow: [["第一道门", "安全红线", "越权、金额错误必须为 0"], ["通过后", "体验表现", "清楚、快速、简洁"]],
      exampleTitle: "两种后果",
      examples: [["is-wrong", "直接不通过", "100 次中有 1 次把 A 的余额发给 B。", "这是越权泄露。"], ["", "可以继续优化", "答案正确、安全，但重复写了两句。", "这是体验问题。"]],
      check: "为什么平均 98 分仍可能不能上线？"
    },
    {
      id: "l1-source-of-truth",
      core: "Source of Truth 是最终负责事实的系统；API 只是读取通道，日志和流水也不一定代表当前状态。",
      title: "API 像查询窗口，账户系统才是真正的账本",
      plain: "你通过窗口询问余额，但窗口不拥有余额；真正记录每次加减的是账户系统。",
      visualTitle: "事实怎样来到页面",
      flow: [["事实", "账户系统", "维护当前余额"], ["通道", "余额 API", "读取指定字段"], ["展示", "页面", "显示已验证结果"]],
      conceptTitle: "四种状态不要混",
      concepts: [["余额为 0", "查到了，值确实是零"], ["账户不存在", "没有匹配会员"], ["没有权限", "不能读取该账户"], ["接口超时", "本次无法确认结果"]],
      analogy: ["库存案例", "仓库系统记录当前库存；搜索页可能是旧缓存；订单日志只能说明过去卖过，不能证明现在还有货。"],
      check: "为什么充值记录相加不能直接当成当前余额？"
    },
    {
      id: "l1-metrics-thresholds",
      core: "Metric 是测量项目，Threshold 是及格线；“准确率”是指标，“必须达到 100%”才是阈值。",
      title: "指标像温度计，阈值像发烧线",
      plain: "温度计告诉你测什么、测到多少；超过 38.5°C 需要处理，才是一条判断线。",
      visualTitle: "从测量到决策",
      flow: [["Metric", "金额一致率", "我们要观察什么"], ["Threshold", "必须 100%", "达到多少才通过"], ["Decision", "通过或阻断", "低于门槛不能发布"]],
      exampleTitle: "模糊要求怎样改清楚",
      examples: [["is-wrong", "模糊", "“余额功能要准确。”", "没有样本范围和及格线。"], ["is-right", "可检查", "“固定 100 条授权查询中，金额一致率为 100%。”", "测量范围和阈值都明确。"]],
      check: "没有阈值的指标为什么不能决定是否上线？"
    },
    {
      id: "l1-eval-set",
      core: "好的 Eval Set 要同时覆盖正常、边界、异常和对抗情况，不能全是简单正常题。",
      title: "考试不能全是练习册里的正常题",
      plain: "真实用户会遇到零余额、超时和缺字段，也可能有人故意要求系统绕过权限。",
      conceptTitle: "四格题库",
      concepts: [["Normal 正常", "授权会员，余额 680"], ["Boundary 边界", "余额刚好为 0"], ["Exception 异常", "超时或字段缺失"], ["Adversarial 对抗", "诱导系统绕过权限"]],
      visualTitle: "什么是回归测试",
      flow: [["旧版本", "关键题已通过", "保存为回归集"], ["修改", "加入新能力", "更新模型或提示"], ["重考", "再跑旧题", "确认旧能力没退步"]],
      check: "Regression Test 为什么不是“重新训练模型”？"
    },
    {
      id: "l1-capstone",
      core: "可靠 AI 功能要形成闭环：写规格、确定事实源、分配角色、设计失败状态，再用 Evals 证明可靠。",
      title: "从用户问一句话，到系统留下可检查证据",
      plain: "第一关不是背八个术语，而是学会按固定顺序检查一个 AI 功能。",
      visualTitle: "第一关完整路径",
      flow: [["01", "任务规格", "用户、目标、边界"], ["02", "事实来源", "确定权威系统"], ["03", "系统分工", "LLM、规则、工具"], ["04", "失败处理", "超时、无权限"], ["05", "Evals", "结果、过程、安全"]],
      conceptTitle: "面对任何功能先问",
      concepts: [["谁在使用", "身份和权限是什么"], ["事实在哪", "哪个系统负责"], ["失败怎么办", "怎样安全停止"], ["如何证明", "用哪些测试和门槛"]],
      check: "能否用这四组问题检查一个新的 AI 功能？"
    },
    {
      id: "l2-python-start",
      core: "Python 是给计算机写指令的语言；变量给数据起名字，print 把当前值显示出来。",
      title: "Python 就是用严格格式告诉电脑一步一步做什么",
      plain: "自然语言可以省略，代码不能随便省略符号。",
      visualTitle: "读懂两行代码",
      flow: [["变量名", "balance", "给数据贴的标签"], ["赋值", "= 680", "把 680 保存进去"], ["显示", "print(balance)", "查看当前值"]],
      conceptTitle: "最容易看错的符号",
      concepts: [["= 赋值", "把右边保存到左边"], ["== 比较", "询问两边是否相等"], ["字符串", "文字需要引号"], ["注释", "# 后面的内容不执行"]],
      analogy: ["收纳盒类比", "变量像贴了“余额”标签的盒子，680 是盒内内容；print 是打开看一眼，不会修改金额。"],
      check: "balance = 680 和 print(balance) 分别做什么？"
    },
    {
      id: "l2-python-types",
      core: "看起来都像“0”的内容可能是数字、文字、真假或空值；类型不同，可以做的事情也不同。",
      title: "电脑不仅看内容，还要看这是什么类型",
      plain: "数字 680 可以加减，文字“680”更像三个字符，不能直接当金额计算。",
      conceptTitle: "四种入门类型",
      concepts: [["680 数字", "可以数学计算"], ["\"680\" 字符串", "引号里的文字"], ["True 布尔值", "真假状态"], ["None 空值", "当前没有可用值"]],
      exampleTitle: "0 和 None 不能混",
      examples: [["is-right", "balance = 0", "查询成功，余额确实为零。", "这是有效业务值。"], ["is-wrong", "balance = None", "当前没有得到余额值。", "不能假装成零。"]],
      check: "0、\"0\"、False 和 None 为什么不是一回事？"
    },
    {
      id: "l2-python-containers",
      core: "dict 用字段名找值，list 按顺序保存多项内容；初学 API 数据时先掌握这两种。",
      title: "一份会员资料像表单，一组交易记录像清单",
      plain: "选择容器时先问：我要按字段名称找，还是按第几个找？",
      conceptTitle: "四种容器的生活类比",
      concepts: [["dict 字典", "有字段名的会员登记表"], ["list 列表", "按顺序排列的购物清单"], ["tuple 元组", "通常不改的坐标组合"], ["set 集合", "自动去重的标签盒"]],
      exampleTitle: "最常见的两种",
      examples: [["", "一个会员对象", "{name, vip, balance}", "按字段名读取，使用 dict。"], ["", "最近 5 条交易", "[充值, 消费, 退款]", "按顺序保存，使用 list。"]],
      check: "会员对象和交易清单分别更适合哪种容器？"
    },
    {
      id: "l2-json",
      core: "JSON 是程序交换数据的文本格式，像一张字段清楚、符号严格的电子快递单。",
      title: "Python 是写程序的语言，JSON 是装数据的格式",
      plain: "不同编程语言可以通过同一种 JSON 结构交换数据。",
      visualTitle: "一份 JSON 的形状",
      flow: [["{ }", "对象", "一组字段"], ["\"name\"", "字段名", "必须双引号"], ["680", "数字", "不加引号"], ["true", "布尔值", "JSON 使用小写"]],
      conceptTitle: "三个高频错误",
      concepts: [["单引号", "JSON 字符串应使用双引号"], ["尾逗号", "最后一项后不能多写逗号"], ["键没引号", "字段名也必须加双引号"], ["业务异常", "格式合法不等于金额合理"]],
      check: "为什么 JSON 能被读取，仍不能证明余额正确？"
    },
    {
      id: "l2-json-python",
      core: "解析是把收到的 JSON 文字变成 Python 可以按字段操作的 dict 或 list。",
      title: "收到的是文字，解析后才变成程序数据",
      plain: "Parse 解决格式能不能读；Validation 继续检查数据能不能安全使用。",
      visualTitle: "JSON 到 Python",
      flow: [["网络收到", "JSON 文字", "{\"balance\":680}"], ["解析", "json.loads", "按 JSON 规则拆开"], ["Python 得到", "dict", "可以读取 balance"]],
      conceptTitle: "解析成功后再检查",
      concepts: [["字段存在", "有没有 balance"], ["类型正确", "是不是数字"], ["范围合理", "有没有异常值"], ["权限通过", "当前用户能否查看"]],
      check: "Parse 和 Validation 分别解决什么问题？"
    },
    {
      id: "l2-api-basics",
      core: "API 是两个程序约定好的服务窗口：客户端提出请求，服务器处理后返回响应。",
      title: "API 像餐厅的点餐窗口",
      plain: "你不需要走进后厨操作，只要按菜单规定告诉窗口要什么。",
      visualTitle: "一次 API 往返",
      flow: [["Client", "客户端", "网页或 Python"], ["Request", "请求", "查询会员 123"], ["Server", "服务器", "校验并查询"], ["Response", "响应", "返回状态和数据"]],
      conceptTitle: "API 和 Endpoint",
      concepts: [["API", "整套对外服务约定"], ["Endpoint", "其中一个具体能力地址"], ["SDK", "帮助调用 API 的开发工具"], ["API Key", "程序访问服务的凭证"]],
      check: "API 为什么只是通道，而不是余额事实本身？"
    },
    {
      id: "l2-http",
      core: "HTTP 是客户端和服务器通信的运输规则；请求说明要做什么，响应说明处理结果。",
      title: "API 说提供什么服务，HTTP 说请求和回复怎样运输",
      plain: "可以把一次 HTTP 请求理解成一封格式固定的信。",
      conceptTitle: "请求的四个部分",
      concepts: [["Method 动作", "GET 读取、POST 创建"], ["URL 地址", "请求送到哪里"], ["Headers 备注", "身份和内容格式"], ["Body 正文", "需要提交的数据"]],
      exampleTitle: "先掌握两个方法",
      examples: [["", "GET", "读取已有数据", "例如查询余额。"], ["", "POST", "创建资源或触发动作", "例如创建充值订单。"]],
      check: "为什么 GET 不修改数据，也仍然需要权限检查？"
    },
    {
      id: "l2-http-status",
      core: "HTTP 200 只说明请求得到响应，不能单独证明业务成功、权限通过或金额正确。",
      title: "看到 200，不要立刻宣布成功",
      plain: "通信、业务和数据是三道不同检查。",
      visualTitle: "三道检查门",
      flow: [["第一层", "HTTP 成功", "有没有正常响应"], ["第二层", "业务成功", "账户和权限是否通过"], ["第三层", "数据可用", "字段、类型和范围正确"]],
      conceptTitle: "常见状态码",
      concepts: [["200", "请求已处理，继续看正文"], ["401", "身份凭证缺失或失效"], ["403", "身份已知但没有权限"], ["429", "请求太频繁，需要等待"]],
      check: "为什么 200、业务成功和余额字段有效要分别检查？"
    },
    {
      id: "l2-timeout-idempotency",
      core: "幂等表示同一业务动作重复执行，最终效果和执行一次相同；幂等键识别同一次重试。",
      title: "先拆“幂”，再理解“幂等键”",
      plain: "数学里的幂与重复运算有关。幂等借用“重复做”的概念，但不是在计算乘方。",
      exampleTitle: "重复后的结果会不会继续变化",
      examples: [["is-right", "幂等操作", "把账户设置为停用，做十次仍然只是停用。", "最终状态与做一次相同。"], ["is-wrong", "非幂等操作", "余额增加 100，做两次会增加 200。", "重复会继续改变结果。"]],
      visualTitle: "同一次充值怎样安全重试",
      flow: [["第一次", "携带键 A", "服务器创建订单"], ["网络超时", "结果未知", "客户端没收到回复"], ["重试", "继续使用键 A", "返回原结果，不再创建"]],
      analogy: ["取号类比", "幂等键像办事号码。同一号码回来查询会找到原记录；真正再办一件新事，才领取新号码。"],
      check: "为什么每次重试都生成新键，会让幂等保护失效？"
    },
    {
      id: "l2-validation-security",
      core: "来自用户、模型和外部 API 的数据都要先检查，再进入资金、身份或权限流程。",
      title: "收到一个值，不等于这个值可以安全使用",
      plain: "数据进入关键系统前，要像过门卫一样逐层检查。",
      visualTitle: "三道验证",
      flow: [["检查 1", "有没有", "balance 字段存在吗"], ["检查 2", "对不对", "是数字、范围合理吗"], ["检查 3", "能不能用", "当前用户有权限吗"]],
      conceptTitle: "认证和鉴权",
      concepts: [["Authentication", "确认你是谁"], ["Authorization", "确认你能做什么"], ["Validation", "数据是否满足规则"], ["Sanitization", "清理或转义危险内容"]],
      analogy: ["API Key 案例", "前端代码任何访问者都能查看。把密钥放前端，就像把店铺钥匙贴在玻璃门外。"],
      check: "为什么金额字段缺失时不能默认补成 0？"
    },
    {
      id: "l2-python-api",
      core: "可靠 API 程序不只有发请求，还要检查状态、解析数据、验证字段并处理失败。",
      title: "先读懂流程，再读懂每一行代码",
      plain: "这一卡不要求你背代码，而是能说出每一步为什么存在。",
      visualTitle: "六步调用链",
      flow: [["01", "准备地址", "URL 与认证信息"], ["02", "发送请求", "设置 timeout"], ["03", "检查状态", "200、401、500"], ["04", "解析 JSON", "变成 dict"], ["05", "验证字段", "存在、类型、范围"], ["06", "展示或报错", "不猜未知结果"]],
      conceptTitle: "错误处理",
      concepts: [["try", "放可能失败的操作"], ["except", "某类失败后怎样处理"], ["raise", "主动阻止无效数据继续"], ["日志", "记录错误类型和请求 ID"]],
      check: "按顺序复述请求、状态、解析、验证和失败处理。"
    },
    {
      id: "l2-git",
      core: "Git 是版本管理工具，Commit 是其中一个存档点，GitHub 是存放和协作管理仓库的网站。",
      title: "Git 不是 Commit，GitHub 也不是 Git",
      plain: "先分清工具、一次版本记录和远程平台。",
      visualTitle: "三个词的关系",
      flow: [["工具", "Git", "管理项目版本"], ["一次记录", "Commit", "带说明的版本存档"], ["远程平台", "GitHub", "在线存放与协作"]],
      conceptTitle: "一次 Commit 怎样产生",
      concepts: [["工作区", "正在修改文件"], ["暂存区", "git add 选择本次变化"], ["本地仓库", "git commit 生成存档"], ["远程仓库", "git push 上传"]],
      exampleTitle: "什么叫好的 Commit",
      examples: [["is-wrong", "不好理解", "update", "目的不清，还可能混入多个功能。"], ["is-right", "容易理解", "Handle balance API timeout", "只完成一件事，容易检查和撤回。"]],
      analogy: ["游戏类比", "Git 是整套存档系统，Commit 是某一个存档点，GitHub 像云端存档与多人协作大厅。"],
      check: "为什么一次 Commit 最好只讲一件清楚的事？"
    }
  ].forEach(addBeginner);

  curriculum.questionGuides = curriculum.questionGuides || {};
  curriculum.questionGuides[0] = {
    "l1-01": { terms: "Source of Truth = 最终负责这个事实的系统；API 只是读取通道。", plain: "窗口能把信息递给你，但真正记账的是窗口背后的账户系统。", trap: "不要把调用方式误认为事实拥有者。" },
    "l1-04": { terms: "充值流水只记录充值，不包含消费、退款和冻结等全部变化。", plain: "知道一共充过多少，不等于知道现在还剩多少。", trap: "历史事件不能直接代替当前状态。" },
    "l1-05": { terms: "接口超时 = 本次没及时获得可信结果，不等于余额为 0。", plain: "不知道就明确说明不知道，并给出安全下一步。", trap: "不能根据旧记录估算金额。" },
    "l1-25": { terms: "Grader = 判卷者，可以是规则程序、人工或模型。", plain: "它把实际结果与标准进行比较并给出分数。", trap: "Grader 不负责生成账户事实。" },
    "l1-26": { terms: "Eval Set = 一整套带预期结果的测试题。", plain: "单条 Eval 像一道题，Eval Set 像一张试卷。", trap: "它不是训练参数或用户列表。" },
    "l1-27": { terms: "0 是有效数值；缺失、无权限和超时是其他状态。", plain: "余额为 0 代表查询成功且确实没有可用余额。", trap: "不要把零值误判成没有数据。" },
    "l1-28": { terms: "Regression Test = 修改后重跑过去已通过的关键测试。", plain: "加入新能力后再考旧题，确认旧能力没有退步。", trap: "这里不是机器学习的回归预测。" },
    "l1-29": { terms: "Adversarial = 故意诱导系统违反规则的对抗情况。", plain: "它在检查系统会不会被一句命令骗过安全边界。", trap: "它不是普通的表达变化。" },
    "l1-31": { terms: "Metric = 测什么；Threshold = 达到多少算通过。", plain: "温度是指标，38.5°C 的发烧线是阈值。", trap: "不要把测量项目和及格线调换。" },
    "l1-32": { terms: "RAG = 从授权资料中找到证据，再交给模型解释。", plain: "政策问题先查当前文件，不让模型凭记忆回答。", trap: "查政策和执行退款是两种任务。" }
  };
  curriculum.questionGuides[1] = {
    "l2-01": { terms: "JSON 的字段名和文字必须使用双引号。", plain: "JSON 像格式严格的表单，一个符号写错可能整份无法读取。", trap: "Python 字典能用单引号，不代表 JSON 也可以。" },
    "l2-02": { terms: "HTTP 成功、业务成功、数据正确是三层检查。", plain: "200 只表示请求得到正常响应，正文仍可能写着业务失败。", trap: "不要看到 200 就展示金额。" },
    "l2-04": { terms: "401 常表示身份凭证无效；403 常表示身份已知但无权限。", plain: "401 更像“请先证明你是谁”。", trap: "具体 API 仍应查看文档。" },
    "l2-05": { terms: "Retry = 重试。重试必须限制次数，并判断操作是否安全。", plain: "无限重复会放大故障，还可能重复创建订单。", trap: "重试不是越多越可靠。" },
    "l2-06": { terms: "Idempotency Key = 识别同一次业务动作的唯一号码。", plain: "同一号码重试，服务器返回原结果，不再做第二遍。", trap: "新的业务动作必须使用新键。" },
    "l2-07": { terms: "dict = 用字段名查找值的 Python 容器。", plain: "会员对象有 name、vip、balance 等字段，所以适合 dict。", trap: "list 更适合按顺序保存多项内容。" },
    "l2-08": { terms: "Validation = 检查存在、类型、范围和关系。", plain: "收到 amount 不代表它一定是可用金额。", trap: "模型和外部 API 输出都要验证。" },
    "l2-09": { terms: "Commit = Git 创建的一次带说明的本地版本记录。", plain: "它像一个可追踪的存档点。", trap: "Commit 不等于自动上传 GitHub。" },
    "l2-10": { terms: "前端代码会下载到访问者电脑，因此不能保存秘密。", plain: "API Key 应留在受保护的服务器端。", trap: "变量名隐蔽不等于加密。" },
    "l2-11": { terms: "JSON null 对应 Python None，表示当前没有值。", plain: "空值与数字 0、空字符串不是一个含义。", trap: "关键金额为 null 时不能补 0。" },
    "l2-12": { terms: "完整错误处理包括超时、状态、格式、业务字段和用户提示。", plain: "每一步解决不同失败，不能统一吞掉错误。", trap: "只写 try/except 不代表处理完整。" },
    "l2-14": { terms: "Content-Type 告诉接收方正文使用什么格式。", plain: "application/json 表示响应体按 JSON 解析。", trap: "格式正确不代表业务正确。" },
    "l2-15": { terms: "单个等号 = 赋值，把右侧保存到左侧变量。", plain: "balance 像盒子标签，680 是盒内内容。", trap: "比较是否相等使用两个等号。" },
    "l2-18": { terms: "键值对 = 一个字段名对应一个值。", plain: "会员资料需要按 balance、name 取值，因此适合 dict。", trap: "不要因为有多个值就一律选 list。" },
    "l2-19": { terms: "Python 写 True，JSON 写 true。", plain: "含义对应，但大小写语法不同。", trap: "代码对大小写敏感。" },
    "l2-20": { terms: "Parse = 按格式规则把文字转换成程序数据。", plain: "json.loads 把 JSON 字符串变成 Python dict 或 list。", trap: "解析不是发送网络请求。" },
    "l2-21": { terms: "Endpoint = API 中某项具体能力的地址。", plain: "API 像整家餐厅，Endpoint 像一个具体服务窗口。", trap: "它不是模型参数。" },
    "l2-23": { terms: "403 = 身份已知，但没有目标资源的权限。", plain: "系统知道你是谁，但仍拒绝你查看这个账户。", trap: "401 与 403 的重点不同。" },
    "l2-28": { terms: "timeout=5 限制客户端等待时间。", plain: "等 5 秒没结果，不代表服务器一定没有执行。", trap: "超时是结果未知。" },
    "l2-30": { terms: "status 看变化清单，diff 看每一行具体变化。", plain: "先确认改了哪些文件，再阅读具体改动。", trap: "push 是上传，不是检查差异。" }
  };

  curriculum.version = "20260728-beginner1";
})();
