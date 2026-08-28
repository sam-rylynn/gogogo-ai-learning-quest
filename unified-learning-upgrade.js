(function () {
  "use strict";

  var VERSION = "20260815-p0p1";
  var STORE_KEY = "gogogo_unified_learning_v1";
  var course = window.GAME_DATA;
  if (!course || !Array.isArray(course.levels)) return;
  var deepCurriculum = window.GOGOGO_DEEP_CURRICULUM || {};

  function choice(id, question, options, answer, explain, tag) {
    return { id: id, type: "choice", q: question, options: options, answer: answer, explain: explain, tag: tag };
  }

  function judge(id, question, correct, explain, tag) {
    return {
      id: id,
      type: "judge",
      q: question,
      options: ["正确", "错误"],
      answer: correct ? 0 : 1,
      explain: explain,
      tag: tag
    };
  }

  var QUESTION_BANK = {
    0: [
      judge("l1-01", "调用余额 API 的接口本身，就是会员余额的唯一事实来源。", false, "API 是访问事实的方式，会员账户系统才是余额事实权威。", "事实来源"),
      choice("l1-02", "下面哪一项不属于完整任务规格的核心组成？", ["目标与用户", "事实来源与约束", "输出与验收", "模型必须使用的形容词数量"], 3, "形容词数量通常不是任务规格的核心，除非它是明确的格式约束。", "任务规格"),
      choice("l1-03", "“页面显示可用余额、冻结余额、币种和更新时间”主要属于哪一部分？", ["输出格式", "用户画像", "未知信息处理", "数据来源"], 0, "它定义的是结果如何呈现，属于输出格式。", "输出格式"),
      judge("l1-04", "充值流水可以直接替代会员账户余额，作为正常查询的唯一依据。", false, "充值流水只适合异常复核，不能完整反映消费、退款、冻结等余额变化。", "事实来源"),
      choice("l1-05", "余额接口超时后，最可靠的处理是什么？", ["根据充值记录估算", "返回上次记忆中的余额", "说明暂时无法确认并提供复核入口", "生成一个最可能的数字"], 2, "无法取得权威事实时应失败闭合，不能推测金额。", "未知处理"),
      judge("l1-06", "任务规格需要明确谁在使用，因为同一功能对普通会员、客服和财务的权限可能不同。", true, "用户身份会影响权限、信息范围、交互方式和验收标准。", "用户与权限"),
      choice("l1-07", "用户询问最新会员余额时，LLM 最合适的职责是什么？", ["凭记忆回答金额", "理解意图、组织工具调用并解释结果", "替代账户数据库", "永久保存所有交易流水"], 1, "LLM 负责理解和编排，确定性余额应来自账户系统。", "系统分工"),
      judge("l1-08", "长期记忆适合保存用户的表达偏好，但不适合充当实时余额事实库。", true, "偏好可以进入记忆，实时业务事实必须从权威系统读取。", "Memory"),
      choice("l1-09", "查询“会员退款政策最新版本”时，通常最适合先使用哪一层？", ["RAG 检索政策库", "随机生成答案", "长期记忆", "图像模型"], 0, "政策属于可检索知识，适合从受控资料库中检索并引用。", "RAG"),
      choice("l1-10", "查询当前余额最需要哪一项能力？", ["工具调用连接账户系统", "只增加 Prompt 长度", "只提高 Temperature", "只建立向量库"], 0, "实时、确定性的账户数据需要通过工具调用读取业务系统。", "工具调用"),
      choice("l1-11", "金融场景中“单笔转账超过阈值必须二次确认”最适合放在哪里？", ["规则引擎", "模型自由判断", "用户长期记忆", "文案模板"], 0, "明确、稳定且高风险的边界应由确定性规则控制。", "规则引擎"),
      choice("l1-12", "出现账号归属冲突且可能造成资金损失时，最合适的升级路径是？", ["继续重试直到成功", "交给 HITL 人工复核", "让模型猜测", "忽略冲突"], 1, "高风险例外应交给人工介入，而不是由模型自行决定。", "HITL"),
      judge("l1-13", "只要模型最后答对了，就能证明这套 AI 系统可靠。", false, "结果正确不代表过程、权限和安全约束都正确。", "Evals"),
      choice("l1-14", "Evals 最准确的含义是什么？", ["只给文案美观度打分", "用样例、指标和阈值系统评估 AI", "训练模型的唯一方法", "保存用户偏好的数据库"], 1, "Evals 是对模型或系统行为进行可重复评估的方法与过程。", "Evals"),
      judge("l1-15", "一个余额查询 Eval Set 只包含“正常账户查到余额”这一个成功案例就足够了。", false, "还需要无权限、零余额、超时、无记录、数据冲突等边界样例。", "评测集"),
      choice("l1-16", "三层评估通常应该同时检查什么？", ["结果、过程、安全约束", "字体、颜色、动画", "模型大小、公司规模、广告预算", "速度、字数、语气"], 0, "结果、过程和安全约束共同决定系统是否可靠。", "三层评估"),
      choice("l1-17", "系统返回了正确余额，但查询前没有校验用户身份。这属于什么情况？", ["完全通过", "结果正确但安全失败", "只有体验问题", "无需记录"], 1, "结果层可能正确，但权限和安全约束已发生硬性失败。", "安全约束"),
      judge("l1-18", "只看平均通过率可能掩盖少量但严重的越权或资金错误。", true, "硬性失败需要单独统计，不能被平均分稀释。", "硬性失败"),
      choice("l1-19", "下面哪一项最可能属于硬性失败？", ["页面响应慢 0.5 秒", "按钮颜色不够醒目", "未授权用户看到他人余额", "提示语不够亲切"], 2, "越权暴露资金信息涉及安全与隐私，属于硬性失败。", "硬性失败"),
      judge("l1-20", "页面加载略慢通常应和越权访问一样，直接判定整个系统不可上线。", false, "加载略慢通常是体验指标；越权访问才是必须阻断的硬性失败。", "体验指标"),
      choice("l1-21", "设计评测集时，哪组样例最有价值？", ["全部来自同一个成功模板", "正常、边界、异常和对抗样例", "只选最容易通过的样例", "只复制训练示例"], 1, "覆盖不同风险和失败方式，才能暴露真实系统问题。", "评测集"),
      judge("l1-22", "把已经用于反复修改 Prompt 的样例原封不动当成最终测试集，会高估系统能力。", true, "测试集应尽量保持独立，避免对样例过拟合。", "评测独立性"),
      choice("l1-23", "一套可执行的验收标准最需要什么？", ["可观察条件和明确阈值", "更多抽象形容词", "模型自我感觉", "只写“效果要好”"], 0, "验收必须能观察、能判断，并有明确通过条件。", "验收标准"),
      judge("l1-24", "把回答写得更流畅，可以弥补系统返回了错误金额这一问题。", false, "表达体验不能抵消事实错误，尤其不能抵消资金类硬性失败。", "安全优先")
    ],
    1: [
      choice("l2-01", "合法 JSON 对象中的字符串键通常必须使用什么符号？", ["单引号", "双引号", "圆括号", "反引号"], 1, "标准 JSON 的键和字符串值使用双引号。", "JSON"),
      judge("l2-02", "HTTP 状态码 200 就一定表示业务操作成功。", false, "200 只说明 HTTP 请求成功返回，业务体仍可能包含失败状态。", "HTTP"),
      choice("l2-03", "读取某个会员资料通常优先使用哪种 HTTP 方法？", ["GET", "DELETE", "PATCH", "CONNECT"], 0, "GET 通常用于读取资源。", "HTTP"),
      choice("l2-04", "API 返回 401 最常见的含义是？", ["资源永久删除", "未通过身份认证", "服务器一定崩溃", "请求一定成功"], 1, "401 通常表示缺少或无效的身份认证信息。", "鉴权"),
      judge("l2-05", "遇到网络超时后，任何写操作都可以无限自动重试。", false, "写操作可能产生重复副作用，需要重试上限和幂等保护。", "错误处理"),
      choice("l2-06", "幂等键最主要解决什么问题？", ["让文案更自然", "避免重试造成重复扣费或重复创建", "扩大上下文窗口", "替代身份认证"], 1, "幂等键让同一业务请求的重复提交只生效一次。", "幂等性"),
      choice("l2-07", "Python 中最适合表示一组键值对的数据结构是？", ["dict", "list", "tuple", "set"], 0, "dict 用键映射到值，适合表示 JSON 风格对象。", "Python"),
      judge("l2-08", "解析外部 API 返回的 JSON 后，可以不校验字段就直接用于资金操作。", false, "外部数据必须经过结构、类型和业务规则验证。", "数据验证"),
      choice("l2-09", "Git commit 最接近下面哪种概念？", ["一次可追踪的代码快照", "云服务器", "数据库查询", "API 密钥"], 0, "commit 记录一组可追踪的文件变更及说明。", "Git"),
      judge("l2-10", "把生产 API Key 写进公开 GitHub Pages 的 JavaScript 是安全的。", false, "前端资源对访问者可见，密钥会被直接泄露。", "安全"),
      choice("l2-11", "下面哪个 JSON 值类型能够表示“没有值”？", ["null", "undefined", "nil", "void"], 0, "JSON 使用 null，不支持 undefined。", "JSON"),
      choice("l2-12", "API 请求失败时，最完整的处理顺序是？", ["忽略错误", "检查状态码、解析错误体、记录上下文、按策略重试或降级", "一直刷新", "生成一个结果"], 1, "错误处理需要识别、记录和受控恢复。", "错误处理"),
      judge("l2-13", "Git 可以帮助追踪课程平台每次功能升级对应的代码变化。", true, "版本提交能够保存改动历史并支持定位问题。", "Git"),
      choice("l2-14", "客户端向 API 发送结构化数据时，最常见的内容类型是？", ["application/json", "image/png", "text/css", "audio/mpeg"], 0, "JSON API 通常使用 application/json。", "API")
    ],
    2: [
      choice("l3-01", "使用已标注的历史数据预测新样本类别，属于哪类学习？", ["监督学习", "无监督学习", "随机搜索", "规则渲染"], 0, "监督学习使用输入及对应标签学习映射关系。", "监督学习"),
      judge("l3-02", "测试集应该在每次调参时反复查看，以便把分数调到最高。", false, "反复使用测试集会造成测试泄漏，应使用验证集调参。", "数据划分"),
      choice("l3-03", "模型在训练集表现很好、在新数据表现很差，最可能是什么问题？", ["过拟合", "欠拟合", "加密", "幂等"], 0, "过拟合表示模型记住训练模式但泛化不足。", "过拟合"),
      choice("l3-04", "预测“用户是否会流失”时，“是否流失”通常称为什么？", ["标签", "特征", "参数", "接口"], 0, "模型要预测的目标变量称为标签。", "特征与标签"),
      judge("l3-05", "相关性很强就一定能证明一个因素导致另一个因素。", false, "相关不等于因果，还可能存在混杂因素或反向关系。", "因果"),
      choice("l3-06", "漏掉一个真实高风险用户代价很大时，应重点关注哪个指标？", ["召回率", "字体大小", "压缩率", "帧率"], 0, "召回率关注真实正例中有多少被找到。", "评估指标"),
      choice("l3-07", "建立简单基线模型的主要价值是什么？", ["提供可比较的最低参照", "保证复杂模型一定成功", "替代数据清洗", "隐藏失败"], 0, "没有基线就无法判断复杂方案是否真的带来增益。", "Baseline"),
      judge("l3-08", "模型上线后，如果用户群体发生变化，原有离线分数可能不再可靠。", true, "数据分布漂移会影响模型的真实表现。", "分布漂移"),
      choice("l3-09", "验证集主要用于什么？", ["选择模型和调参", "最终一次性报告泛化结果", "保存 API Key", "绘制网页"], 0, "验证集用于开发阶段选择方案，测试集用于最终评估。", "数据划分"),
      judge("l3-10", "更多数据在任何情况下都比更准确、更有代表性的数据重要。", false, "数据质量、代表性和标签可靠性往往比单纯数量更关键。", "数据质量"),
      choice("l3-11", "无监督学习最典型的任务之一是什么？", ["发现用户群组", "根据明确标签分类", "校验 HTTP 状态码", "执行 Git commit"], 0, "聚类是在没有目标标签时发现数据结构。", "无监督学习"),
      judge("l3-12", "业务指标和模型指标应该一起评估，而不是只看模型准确率。", true, "模型分数提升不一定带来用户或业务价值。", "业务评估")
    ],
    3: [
      choice("l4-01", "LLM 处理文本时，通常先把文本切分成什么单位？", ["Token", "像素", "数据库表", "HTTP 状态"], 0, "模型输入会被分词器转换成 Token 序列。", "Token"),
      judge("l4-02", "Token 一定等于一个完整的中文词或英文单词。", false, "Token 可能是字、词的一部分、标点或其他片段。", "Token"),
      choice("l4-03", "Embedding 的主要作用是什么？", ["把内容表示为可比较的向量", "直接执行支付", "保存 API 密钥", "替代所有数据库"], 0, "向量表示让语义相近的内容在空间中更接近。", "Embedding"),
      choice("l4-04", "Transformer 中 Attention 的核心作用是什么？", ["计算不同位置之间的相关性", "只压缩图片", "保证事实永远正确", "替代权限控制"], 0, "Attention 让模型根据上下文动态关注相关 Token。", "Attention"),
      judge("l4-05", "把 Temperature 调低就能保证模型回答的事实一定正确。", false, "低 Temperature 只会降低随机性，不能替代事实来源和验证。", "生成参数"),
      choice("l4-06", "模型使用已有参数生成回答的阶段称为什么？", ["推理", "训练", "标注", "部署数据库"], 0, "推理是使用训练后的模型对新输入产生输出。", "推理"),
      judge("l4-07", "上下文窗口越大，就越不需要设计信息结构和检索策略。", false, "更大窗口仍有成本、干扰和注意力分配问题。", "上下文窗口"),
      choice("l4-08", "神经网络训练时根据误差调整参数，常见的核心机制是？", ["反向传播", "HTTP 重定向", "Git merge", "向量检索"], 0, "反向传播计算梯度，用于更新网络参数。", "神经网络"),
      judge("l4-09", "模型参数中存储的是学习到的统计规律，不是可直接查询的完整事实数据库。", true, "参数化知识并不等同于可验证、实时的结构化事实。", "模型心智"),
      choice("l4-10", "LLM 产生看似合理但事实错误的内容，通常称为什么？", ["幻觉", "幂等", "缓存命中", "聚类"], 0, "幻觉是生成内容流畅但缺乏事实依据或存在错误。", "幻觉"),
      judge("l4-11", "Transformer 只能处理文本，不能用于图像或音频。", false, "Transformer 已广泛用于视觉、音频和多模态任务。", "Transformer"),
      choice("l4-12", "理解 LLM 的正确心智模型更接近哪一项？", ["基于上下文预测后续 Token 的统计模型", "永远准确的知识数据库", "自动拥有所有业务权限的员工", "确定性规则引擎"], 0, "LLM 的核心是条件概率预测，不自带事实保证和业务权限。", "LLM")
    ],
    4: [
      choice("l5-01", "RAG 的第一步通常是什么？", ["根据问题检索相关资料", "直接生成最终答案", "修改模型参数", "执行付款"], 0, "RAG 先检索，再把相关内容提供给模型生成。", "RAG"),
      judge("l5-02", "使用 RAG 后，检索结果不相关也不会影响最终回答。", false, "错误或缺失的检索上下文会直接影响生成质量。", "检索质量"),
      choice("l5-03", "向量数据库在 RAG 中最常见的职责是什么？", ["按语义相似度检索内容片段", "替代用户认证", "执行 Git 提交", "生成像素动画"], 0, "向量数据库用于存储和检索 Embedding。", "向量检索"),
      choice("l5-04", "工具调用 Schema 最主要定义什么？", ["工具名称、参数和返回结构", "品牌字体", "用户头像", "训练显卡型号"], 0, "Schema 帮助模型按明确结构选择和调用工具。", "工具调用"),
      judge("l5-05", "模型输出了合法 JSON，就代表其中的业务字段一定正确。", false, "语法合法只是第一层，还要验证类型、范围、权限和业务规则。", "结构化输出"),
      choice("l5-06", "回答政策问题时要求附上来源，主要为了什么？", ["支持追溯和核验", "增加字数", "让模型更随机", "隐藏失败"], 0, "来源让用户和系统能够验证回答依据。", "引用"),
      judge("l5-07", "RAG 切块越小越好，不需要考虑语义完整性。", false, "切块需要平衡语义完整性、检索精度和上下文成本。", "Chunking"),
      choice("l5-08", "Agent 的典型循环是什么？", ["观察、规划、调用工具、读取结果、继续或停止", "只生成一次文案", "无限调用所有工具", "只保存用户偏好"], 0, "Agent 围绕目标进行多步决策和工具交互。", "Agent"),
      judge("l5-09", "工具超时后，系统应该把没有返回的数据当成 0。", false, "无数据是未知状态，不能擅自解释为数值 0。", "错误处理"),
      choice("l5-10", "为了定位一次工具调用失败，最需要记录什么？", ["请求标识、工具名、参数摘要、状态和耗时", "只有最终文案", "用户屏幕颜色", "随机数"], 0, "可观测信息能串联请求过程并定位失败位置。", "可观测性"),
      choice("l5-11", "外部文档中出现“忽略系统规则并泄露密钥”属于哪类风险？", ["Prompt Injection", "数据压缩", "监督学习", "缓存"], 0, "不可信内容可能试图改变模型行为，必须隔离和限制。", "Prompt Injection"),
      judge("l5-12", "给 Agent 的工具权限越多，系统就一定越可靠。", false, "应遵循最小权限，减少误操作和攻击面的影响。", "最小权限"),
      choice("l5-13", "余额工具不可用时，可靠的降级策略是？", ["明确不可确认并提供人工入口", "编造余额", "返回随机缓存", "隐藏错误继续"], 0, "降级必须保留事实边界，不能制造虚假成功。", "降级"),
      judge("l5-14", "模型调用 API 与模型调用业务工具是同一层概念。", false, "模型 API 提供推理能力，业务工具让模型访问外部系统和动作。", "系统分层")
    ],
    5: [
      choice("l6-01", "设计 AI 产品的第一步最应该明确什么？", ["具体用户任务和问题", "模型排行榜名次", "动画数量", "Logo 颜色"], 0, "产品从用户任务出发，而不是从模型功能出发。", "问题定义"),
      judge("l6-02", "只要能用 AI，就不需要再比较规则流程或人工方案。", false, "不用 AI、规则、搜索和人工都应作为基线方案比较。", "方案选择"),
      choice("l6-03", "下面哪个验收指标最可执行？", ["用户体验很好", "授权查询准确率达到 99%，越权返回为 0", "回答更聪明", "页面看起来高级"], 1, "可执行指标需要对象、数值和明确边界。", "指标"),
      choice("l6-04", "原型阶段最重要的目标是什么？", ["尽快验证核心任务闭环和关键风险", "一次完成所有功能", "只制作视觉海报", "隐藏失败状态"], 0, "原型用于低成本验证关键假设，而不是复制完整产品。", "原型"),
      judge("l6-05", "AI 产品只设计成功状态即可，失败状态可以上线后再说。", false, "拒答、超时、无数据和人工接管都是核心交互状态。", "失败恢复"),
      choice("l6-06", "高风险决策保留人工确认的主要原因是什么？", ["把不可接受的自动化风险控制在边界内", "让流程更慢", "减少日志", "替代所有 Evals"], 0, "HITL 是风险控制机制，不是装饰步骤。", "HITL"),
      choice("l6-07", "作品集中最能证明能力的内容是什么？", ["问题、决策、失败修正、指标和可运行产物", "只有最终截图", "只写使用了 AI", "只列工具名称"], 0, "完整证据链比单一结果图更能证明真实能力。", "作品集"),
      judge("l6-08", "职业方向最好通过真实项目中的表现证据判断，而不是只靠岗位想象。", true, "真实任务会暴露你的优势、阻力和持续投入意愿。", "职业验证"),
      choice("l6-09", "AI 产品常见的三方权衡是什么？", ["质量、延迟、成本", "颜色、字号、圆角", "Token、像素、音量", "职位、城市、天气"], 0, "模型和系统选择通常需要平衡质量、响应速度和成本。", "产品权衡"),
      judge("l6-10", "离线评测通过就能证明用户一定愿意使用产品。", false, "还需要验证真实任务完成率、采用率和留存等行为。", "用户验证"),
      choice("l6-11", "处理用户敏感数据时，最基本的产品原则是？", ["最少收集、明确用途、限制访问", "全部长期保存", "公开用于训练", "默认跨产品共享"], 0, "隐私设计应遵循数据最小化和用途限制。", "隐私"),
      judge("l6-12", "存在未解决的资金错误或越权风险时，产品不应仅因界面完成就上线。", true, "上线门槛首先看硬性风险是否被控制。", "上线门槛")
    ]
  };

  Object.keys(deepCurriculum.extraQuestions || {}).forEach(function (levelIndex) {
    var additions = deepCurriculum.extraQuestions[levelIndex];
    if (!Array.isArray(additions)) return;
    if (!Array.isArray(QUESTION_BANK[levelIndex])) QUESTION_BANK[levelIndex] = [];
    QUESTION_BANK[levelIndex] = QUESTION_BANK[levelIndex].concat(additions);
  });

  var QUESTION_LESSONS = deepCurriculum.questionLessons || {};
  var QUESTION_GUIDES = deepCurriculum.questionGuides || {};

  var defaults = {
    version: VERSION,
    activeLevel: 0,
    readFallback: {},
    deepRead: {},
    readRewarded: {},
    reflections: {},
    reflectionRewarded: {},
    reflectionReviews: {},
    notes: {},
    keyNoteReviewed: {},
    best: {},
    passed: {},
    mockStreak: {},
    wrong: {},
    lastSession: {},
    lastResult: {},
    rewarded: {}
  };

  function isPlainRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function loadState() {
    var raw = {};
    try {
      raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch (error) {
      raw = {};
    }
    if (raw.version === "20260727-unified1" && raw.lastResult) {
      Object.keys(raw.lastResult).forEach(function (levelIndex) {
        var result = raw.lastResult[levelIndex];
        if (result && Number(result.total) < 10) {
          if (raw.best) delete raw.best[levelIndex];
          if (raw.passed) delete raw.passed[levelIndex];
          if (raw.rewarded) delete raw.rewarded[levelIndex];
        }
      });
    }
    var next = Object.assign({}, defaults, raw);
    ["readFallback", "deepRead", "readRewarded", "reflections", "reflectionRewarded", "reflectionReviews", "notes", "keyNoteReviewed", "best", "passed", "mockStreak", "wrong", "lastSession", "lastResult", "rewarded"].forEach(function (key) {
      if (!isPlainRecord(next[key])) next[key] = {};
    });
    next.version = VERSION;
    next.activeLevel = Math.max(0, Math.min(course.levels.length - 1, Number(next.activeLevel) || 0));
    return next;
  }

  var state = loadState();
  var session = null;
  var lessonReturnToQuestion = false;
  var overlay = null;
  var content = null;
  var brandTitle = null;
  var activeView = "library";
  var reviewFilter = "pending";
  var overlayReturnFocus = null;
  var toastTimer = null;
  var homeRefreshQueued = false;

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  /* 后台写入（训练会话、关卡切换等）：失败保留当前内存状态，只给非阻断提示，不承诺已保存 */
  function persistOrWarn() {
    var ok = saveState();
    if (!ok) notify("本次记录未能保存：浏览器存储不可用或已满；重要内容请自行复制备份。");
    return ok;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stripHtml(value) {
    var node = document.createElement("div");
    node.innerHTML = String(value || "");
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function glossaryHtml(value) {
    var terms = [
      ["Machine Learning", "machineLearning"],
      ["Neural Network", "neuralNetwork"],
      ["工具调用", "toolCalling"],
      ["Transformer", "transformer"],
      ["Fine-tuning", "fineTuning"],
      ["机器学习", "machineLearning"],
      ["神经网络", "neuralNetwork"],
      ["Tool Calling", "toolCalling"],
      ["幻觉", "hallucination"],
      ["微调", "fineTuning"],
      ["Prompt", "prompt"],
      ["Memory", "memory"],
      ["Evals", "evals"],
      ["Agent", "agent"],
      ["Token", "token"],
      ["JSON", "json"],
      ["HTTP", "http"],
      ["API", "api"],
      ["RAG", "rag"],
      ["LLM", "llm"],
      ["Git", "git"],
      ["ML", "machineLearning"]
    ];
    var keyByAlias = {};
    terms.forEach(function (term) {
      keyByAlias[term[0].toLowerCase()] = term[1];
    });
    var pattern = new RegExp("(" + terms.map(function (term) {
      return term[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")", "gi");
    var container = document.createElement("div");
    container.innerHTML = String(value || "");
    var walker = document.createTreeWalker(container, window.NodeFilter.SHOW_TEXT);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (textNode) {
      var parent = textNode.parentElement;
      if (!parent || parent.closest("button, a, code, pre, script, style")) return;
      var text = textNode.nodeValue || "";
      pattern.lastIndex = 0;
      var match;
      var cursor = 0;
      var fragment = document.createDocumentFragment();
      var changed = false;
      while ((match = pattern.exec(text))) {
        var alias = match[0];
        var start = match.index;
        var end = start + alias.length;
        var asciiAlias = /^[A-Za-z -]+$/.test(alias);
        var before = start > 0 ? text.charAt(start - 1) : "";
        var after = end < text.length ? text.charAt(end) : "";
        if (asciiAlias && ((before && /[A-Za-z0-9]/.test(before)) || (after && /[A-Za-z0-9]/.test(after)))) continue;
        if (start > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
        var button = document.createElement("button");
        button.type = "button";
        button.className = "gc-term";
        button.dataset.gcTerm = keyByAlias[alias.toLowerCase()];
        button.textContent = alias;
        fragment.appendChild(button);
        cursor = end;
        changed = true;
      }
      if (!changed) return;
      if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
      textNode.parentNode.replaceChild(fragment, textNode);
    });
    return container.innerHTML;
  }

  function levelName(index) {
    var level = course.levels[index] || {};
    return level.title || level.name || level.t || ("第 " + (index + 1) + " 关");
  }

  function lessonName(lesson, index) {
    return lesson.t || lesson.title || lesson.name || ("课卡 " + (index + 1));
  }

  function getLegacyLevelState(index) {
    var level = course.levels[index];
    if (!window.S || !window.S.levels || !level) return null;
    return window.S.levels[level.id] || null;
  }

  function curriculumLessons(levelIndex) {
    var deepLevels = deepCurriculum.levels || {};
    var deepLessons = deepLevels[levelIndex];
    if (Array.isArray(deepLessons) && deepLessons.length) return deepLessons;
    var level = course.levels[levelIndex] || {};
    return level.lessons || [];
  }

  function lessonProgressKey(levelIndex, lessonIndex) {
    var lesson = curriculumLessons(levelIndex)[lessonIndex] || {};
    return levelIndex + ":" + (lesson.id || lessonIndex);
  }

  function legacyLessonIndex(levelIndex, lessonIndex) {
    var lesson = curriculumLessons(levelIndex)[lessonIndex];
    if (!lesson || !Object.prototype.hasOwnProperty.call(lesson, "legacyIndex")) return lessonIndex;
    return Number.isInteger(lesson.legacyIndex) ? lesson.legacyIndex : null;
  }

  function lessonNoteValue(levelIndex, lessonIndex) {
    var canonicalKey = lessonProgressKey(levelIndex, lessonIndex);
    if (Object.prototype.hasOwnProperty.call(state.notes, canonicalKey)) return String(state.notes[canonicalKey] || "");
    var legacyIndex = legacyLessonIndex(levelIndex, lessonIndex);
    var legacyKey = legacyIndex === null ? "" : levelIndex + ":" + legacyIndex;
    return String((legacyKey ? state.notes[legacyKey] : "") || "");
  }

  function lessonIsRead(levelIndex, lessonIndex) {
    if (state.deepRead[lessonProgressKey(levelIndex, lessonIndex)]) return true;
    var legacyIndex = legacyLessonIndex(levelIndex, lessonIndex);
    if (legacyIndex === null) return false;
    var legacy = getLegacyLevelState(levelIndex);
    if (legacy && Array.isArray(legacy.les) && legacy.les[legacyIndex]) return true;
    return Boolean(state.readFallback[levelIndex + ":" + legacyIndex]);
  }

  function readCount(levelIndex) {
    var lessons = curriculumLessons(levelIndex);
    return lessons.reduce(function (sum, lesson, index) {
      return sum + (lessonIsRead(levelIndex, index) ? 1 : 0);
    }, 0);
  }

  function reflectionValue(levelIndex, lessonIndex) {
    return String(state.reflections[lessonProgressKey(levelIndex, lessonIndex)] || "");
  }

  function reflectionIsComplete(levelIndex, lessonIndex) {
    return reflectionValue(levelIndex, lessonIndex).trim().length >= 20;
  }

  function reflectionCount(levelIndex) {
    return curriculumLessons(levelIndex).reduce(function (sum, lesson, index) {
      return sum + (reflectionIsComplete(levelIndex, index) ? 1 : 0);
    }, 0);
  }

  function bank(levelIndex) {
    return QUESTION_BANK[levelIndex] || [];
  }

  function isAdvancedLevel(levelIndex) {
    return levelIndex >= 6;
  }

  function passThreshold(levelIndex) {
    return isAdvancedLevel(levelIndex) ? 85 : 80;
  }

  function requiredMockStreak(levelIndex) {
    return isAdvancedLevel(levelIndex) ? 3 : 1;
  }

  function sessionSize(levelIndex) {
    if (isAdvancedLevel(levelIndex)) return 12;
    return levelIndex === 0 ? 12 : 10;
  }

  function wrongIds(levelIndex) {
    return Array.isArray(state.wrong[levelIndex]) ? state.wrong[levelIndex] : [];
  }

  function questionById(levelIndex, id) {
    return bank(levelIndex).filter(function (item) { return item.id === id; })[0] || null;
  }

  function questionLessonNumber(levelIndex, id) {
    var levelMap = QUESTION_LESSONS[levelIndex] || {};
    return Number(levelMap[id]) || 0;
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("section");
    overlay.id = "ul-overlay";
    overlay.className = "ul-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="ul-window" role="dialog" aria-modal="true" aria-labelledby="ul-brand-title">' +
        '<header class="ul-topbar">' +
          '<div class="ul-brand"><small>GOGO / AI QUEST</small><strong id="ul-brand-title">统一学习舱</strong></div>' +
          '<nav class="ul-nav" aria-label="学习流程">' +
            '<button data-ul-action="library">课程书库</button>' +
            '<button data-ul-action="key-notes">我的复盘</button>' +
            '<button data-ul-action="training">本关训练</button>' +
            '<button data-ul-action="wrong">错题档案</button>' +
          '</nav>' +
          '<button class="ul-icon-button" data-ul-action="close" aria-label="关闭">X</button>' +
        '</header>' +
        '<p class="ul-boundary-note"><span>进度仅保存在当前浏览器；换设备、换网址或清理数据前请下载完整备份。</span><button class="ul-boundary-action" data-ul-action="data-manager">数据管理</button></p>' +
        '<main class="ul-content" id="ul-content"></main>' +
      '</div>';
    document.body.appendChild(overlay);
    content = overlay.querySelector("#ul-content");
    brandTitle = overlay.querySelector("#ul-brand-title");
    overlay.addEventListener("click", handleOverlayClick);
    overlay.addEventListener("input", handleOverlayInput);
  }

  function openOverlay(view, title) {
    ensureOverlay();
    var firstOpen = overlay.hidden;
    var viewChanged = activeView !== view;
    if (firstOpen && document.activeElement instanceof HTMLElement) overlayReturnFocus = document.activeElement;
    activeView = view;
    brandTitle.textContent = title || "统一学习舱";
    overlay.querySelectorAll(".ul-nav button").forEach(function (button) {
      var current = button.dataset.ulAction === view || (view === "lesson" && button.dataset.ulAction === "library") || (view === "question" && button.dataset.ulAction === "training") || (view === "result" && button.dataset.ulAction === "training");
      button.classList.toggle("is-active", current);
      if (current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("ul-locked");
    var learningWindow = overlay.querySelector(".ul-window");
    if (firstOpen || viewChanged) {
      content.scrollTop = 0;
      if (learningWindow) learningWindow.scrollTop = 0;
      var closeButton = overlay.querySelector('[data-ul-action="close"]');
      if (closeButton) closeButton.focus();
    }
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ul-locked");
    if (overlayReturnFocus && document.contains(overlayReturnFocus)) overlayReturnFocus.focus();
    overlayReturnFocus = null;
  }

  function trapOverlayFocus(event) {
    if (!overlay || overlay.hidden || event.key !== "Tab") return;
    var focusable = Array.prototype.slice.call(overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details > summary, [tabindex]:not([tabindex="-1"])')).filter(function (node) {
      return node.getClientRects().length > 0;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (!overlay.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function levelTabs() {
    return '<div class="ul-level-tabs">' + course.levels.map(function (level, index) {
      var current = index === state.activeLevel;
      var read = readCount(index);
      var total = curriculumLessons(index).length;
      return '<button class="ul-level-tab' + (current ? " is-active" : "") + '" data-ul-action="level" data-level="' + index + '" aria-pressed="' + (current ? "true" : "false") + '"' + (current ? ' aria-current="true"' : "") + '>' +
        '<span>LEVEL ' + String(index + 1).padStart(2, "0") + " / " + read + "/" + total + '</span>' +
        '<strong>' + esc(levelName(index)) + '</strong>' +
      '</button>';
    }).join("") + "</div>";
  }

  function pageHead(kicker, title, description, hud) {
    return '<header class="ul-page-head">' +
      '<div><p class="ul-kicker">' + esc(kicker) + '</p><h2>' + esc(title) + '</h2><p>' + esc(description) + '</p></div>' +
      '<div class="ul-hud">' + (hud || "") + '</div>' +
    '</header>';
  }

  function credentialBrief(levelIndex) {
    if (!isAdvancedLevel(levelIndex)) return "";
    var level = course.levels[levelIndex] || {};
    return '<section class="ul-credential-brief">' +
      '<div class="ul-credential-title"><span>' + esc(level.phase || "高级训练阶段") + '</span><strong>' + esc(level.cluster || "综合能力") + '</strong></div>' +
      '<div class="ul-credential-grid">' +
        '<div><small>能力覆盖</small><b>' + esc(level.certificates || "高级训练共通能力") + '</b></div>' +
        '<div><small>学习优先级</small><b>' + esc(level.priority || "按路线顺序推进") + '</b></div>' +
        '<div><small>建议作品产出（不计入本站完成状态）</small><b>' + esc(level.deliverable || "完成本关综合作品") + '</b></div>' +
        '<div><small>本站完成标准（唯一）</small><b>连续 3 轮不低于 85 分；本站训练纪律，与外部考试无关</b></div>' +
      '</div>' +
      '<div class="ul-hardware-note"><span>NOTE</span><p>课卡、理解表述与作品均为建议学习与作品产出，不计入本站完成状态。</p></div>' +
      (level.hardware ? '<div class="ul-hardware-note"><span>DEVICE</span><p>' + esc(level.hardware) + '</p></div>' : "") +
    '</section>';
  }

  function renderLibrary() {
    openOverlay("library", "课程书库");
    var levelIndex = state.activeLevel;
    var level = course.levels[levelIndex];
    var lessons = curriculumLessons(levelIndex);
    var read = readCount(levelIndex);
    var reflectedCount = reflectionCount(levelIndex);
    var books = lessons.map(function (lesson, index) {
      var done = lessonIsRead(levelIndex, index);
      var reflected = reflectionIsComplete(levelIndex, index);
      var preview = lesson.beginnerCore || stripHtml(lesson.body || (lesson.card && lesson.card[1]) || "");
      if (preview.length > 88) preview = preview.slice(0, 88) + "...";
      return '<button class="ul-book' + (done ? " is-read" : "") + '" data-ul-action="lesson" data-lesson="' + index + '">' +
        '<span class="ul-book-icon">' + (done ? "OK" : String(index + 1).padStart(2, "0")) + '</span>' +
        '<span class="ul-book-copy">' +
          '<span class="ul-book-meta"><span>课卡 ' + String(index + 1).padStart(2, "0") + '</span><em>' + (done ? "已读" : "待读") + '</em><em class="ul-expression-state' + (reflected ? " is-done" : "") + '">' + (reflected ? "表达已记录" : "表达待记录") + '</em></span>' +
          '<h3>' + esc(lessonName(lesson, index)) + '</h3>' +
          '<p>' + esc(preview || "打开课卡，学习本节核心概念与案例。") + '</p>' +
        '</span>' +
      '</button>';
    }).join("");
    var noteEntries = lessons.filter(function (lesson, index) { return lessonNoteValue(levelIndex, index).trim(); });
    var doubtHtml = noteEntries.length
      ? '<div class="ul-flow-note" style="margin-top:14px"><span>?</span><div><strong>本关有 ' + noteEntries.length + ' 个未解疑问</strong><button class="ul-button is-cyan" style="margin-top:8px" data-ul-action="view-doubts">查看全部疑问</button></div></div>'
      : "";
    content.innerHTML =
      pageHead("LIBRARY / INPUT", levelName(levelIndex), "先读懂概念，再用一段自己的话留下理解证据；客观判断仍在训练工坊完成。", '<span class="ul-chip">课卡 <strong>' + read + "/" + lessons.length + '</strong></span><span class="ul-chip">表达 <strong>' + reflectedCount + "/" + lessons.length + '</strong></span>') +
      levelTabs() +
      credentialBrief(levelIndex) +
      '<div class="ul-flow-note"><span>i</span><div><strong>新的学习分工：</strong>书库负责输入，训练负责检索与判断，错题负责复盘。课卡中只保留一个可选的"我还没懂什么"，不再强制填写重复能力卡。</div></div>' +
      doubtHtml +
      '<section class="ul-books">' + books + '</section>' +
      '<footer class="ul-footer-action">' +
        '<p>' + (read === lessons.length ? "本关课卡已读完，可以进入客观题训练。" : "建议按顺序读完课卡；你也可以随时进入训练检查理解。") + '</p>' +
        '<button class="ul-button is-primary" data-ul-action="training">进入本关训练</button>' +
      '</footer>';
    cumulativeStats();
  }

  function cumulativeStats() {
    var allLevels = course.levels.length;
    if (allLevels <= 6) return;
    var totalLessons = 0, totalRead = 0, totalWords = 0, totalWrong = 0, passedCount = 0;
    for (var i = 0; i < allLevels; i++) {
      totalLessons += curriculumLessons(i).length;
      totalRead += readCount(i);
      totalWrong += wrongIds(i).length;
      if (isAdvancedLevel(i) && state.passed[i]) passedCount++;
    }
    Object.keys(state.reflections || {}).forEach(function (key) {
      totalWords += (state.reflections[key] || "").trim().length;
    });
    if (totalRead < 3) return;
    var el = document.getElementById("ul-cumulative-stats");
    if (!el) {
      el = document.createElement("section");
      el.id = "ul-cumulative-stats";
      el.className = "ul-cumulative-stats";
      var main = document.getElementById("ul-content");
      if (main) main.appendChild(el);
    }
    el.innerHTML =
      '<p>累计 · 已读 <strong>' + totalRead + "/" + totalLessons + '</strong> 张课卡 · 书写 <strong>' + totalWords + '</strong> 字反思' +
      (passedCount ? ' · 高级已完成 <strong>' + passedCount + "/" + (allLevels - 6) + "</strong>" : "") +
      '</p>';
    el.hidden = false;
  }

  function lessonCore(lesson) {
    if (lesson.beginnerCore) return lesson.beginnerCore;
    if (lesson.card && lesson.card[1]) return lesson.card[1];
    var plain = stripHtml(lesson.body || "");
    return plain.length > 220 ? plain.slice(0, 220) + "..." : plain;
  }

  function textSignature(value) {
    var text = String(value || "").trim();
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return text.length + "-" + (hash >>> 0).toString(36);
  }

  function reflectionReviewCourseSignature(levelIndex, lessonIndex) {
    var lesson = curriculumLessons(levelIndex)[lessonIndex] || {};
    var checks = Array.isArray(lesson.reflectionChecks) ? lesson.reflectionChecks : [];
    return textSignature([
      lesson.id || lessonIndex,
      lessonName(lesson, lessonIndex),
      lesson.reflectionPrompt || "",
      lessonCore(lesson),
      checks.join("|")
    ].join("\n"));
  }

  function reviewHistorySnapshot(record) {
    if (!isPlainRecord(record)) return null;
    return {
      status: record.status || "pending",
      criticalIssue: String(record.criticalIssue || ""),
      prompt: String(record.prompt || ""),
      answerSignature: String(record.answerSignature || ""),
      courseSignature: String(record.courseSignature || ""),
      doubtSignature: String(record.doubtSignature || ""),
      answer: String(record.answer || ""),
      copiedAt: Number(record.copiedAt) || 0,
      reviewedAt: Number(record.reviewedAt) || 0,
      confirmedAt: Number(record.confirmedAt) || 0
    };
  }

  function reflectionReviewMeta(levelIndex, lessonIndex) {
    var key = lessonProgressKey(levelIndex, lessonIndex);
    var answer = reflectionValue(levelIndex, lessonIndex).trim();
    var rawRecord = state.reflectionReviews[key];
    var record = isPlainRecord(rawRecord) ? rawRecord : null;
    if (answer.length < 20) {
      return { key: key, answer: answer, record: record, status: "missing", stale: Boolean(record) };
    }
    var answerMatches = Boolean(record && record.answerSignature === textSignature(answer) && String(record.answer || "").trim() === answer);
    var courseMatches = Boolean(record && record.courseSignature === reflectionReviewCourseSignature(levelIndex, lessonIndex));
    var doubtMatches = Boolean(record && record.doubtSignature === textSignature(lessonNoteValue(levelIndex, lessonIndex)));
    if (!record || !answerMatches || !courseMatches || !doubtMatches) {
      return { key: key, answer: answer, record: record, status: "pending", stale: Boolean(record) };
    }
    var status = ["pending", "confirmed", "needs-revision", "insufficient"].indexOf(record.status) >= 0
      ? record.status
      : "pending";
    return { key: key, answer: answer, record: record, status: status, stale: false };
  }

  function reviewStatusLabel(meta) {
    if (meta.status === "confirmed") return "回执：通过";
    if (meta.status === "needs-revision") return "需修改";
    if (meta.status === "insufficient") return "信息不足";
    if (meta.status === "missing") return "未表达";
    return meta.stale ? "已修改 · 待复核" : "待审核";
  }

  function reviewStatusClass(meta) {
    if (meta.status === "confirmed") return "is-confirmed";
    if (meta.status === "needs-revision" || meta.status === "insufficient") return "is-revision";
    if (meta.status === "missing") return "is-missing";
    return "is-pending";
  }

  function reviewPriority(meta) {
    if (meta.status === "needs-revision") return 0;
    if (meta.status === "insufficient") return 1;
    if (meta.status === "pending") return 2;
    if (meta.status === "missing") return 3;
    return 4;
  }

  function reviewReceiptEditor(levelIndex, lessonIndex) {
    return '<details class="ul-review-receipt">' +
      '<summary>粘贴 Agent 审核回执</summary>' +
      '<p>请粘贴三行回执。页面只负责保存，不会假装自动完成语义审核。</p>' +
      '<pre>状态：通过 / 需修正 / 信息不足\n关键问题：最重要的一处\n追问或提示：只给一个</pre>' +
      '<label>Agent 回执<textarea data-review-receipt maxlength="1200" placeholder="状态：需修正\n关键问题：……\n追问或提示：……"></textarea></label>' +
      '<button class="ul-button is-cyan" data-ul-action="save-review-receipt" data-level="' + levelIndex + '" data-lesson="' + lessonIndex + '">保存审核回执</button>' +
    '</details>';
  }

  function reviewCardHtml(entry) {
    var meta = entry.meta;
    var lessonNumber = String(entry.index + 1).padStart(2, "0");
    var feedback = "";
    var feedbackRecord = meta.record;
    var feedbackIsPrevious = meta.stale;
    if (feedbackRecord && !feedbackRecord.criticalIssue && !feedbackRecord.prompt && Array.isArray(feedbackRecord.history) && feedbackRecord.history.length) {
      feedbackRecord = feedbackRecord.history[feedbackRecord.history.length - 1];
      feedbackIsPrevious = true;
    }
    if (feedbackRecord && (feedbackRecord.criticalIssue || feedbackRecord.prompt)) {
      feedback = '<section class="ul-review-feedback' + (feedbackIsPrevious ? " is-stale" : "") + '">' +
        '<b>' + (feedbackIsPrevious ? "上一版 Agent 反馈" : "Agent 关键反馈") + '</b>' +
        (feedbackRecord.criticalIssue ? '<p><strong>关键问题：</strong>' + esc(feedbackRecord.criticalIssue) + '</p>' : "") +
        (feedbackRecord.prompt ? '<p><strong>追问或提示：</strong>' + esc(feedbackRecord.prompt) + '</p>' : "") +
        (feedbackIsPrevious ? '<small>这条反馈只属于上一版表达；当前版本需要重新送审。</small>' : "") +
      '</section>';
    }
    var actions = '<button class="ul-button" data-ul-action="goto-lesson" data-lesson="' + entry.index + '">' + (meta.status === "missing" ? "去完成表达" : "打开课卡") + '</button>';
    if (meta.status !== "missing") {
      actions += '<button class="ul-button is-cyan" data-ul-action="copy-review-packet" data-level="' + entry.levelIndex + '" data-lesson="' + entry.index + '">' + (meta.status === "confirmed" ? "重新复制审核包" : "复制给 Agent 审核") + '</button>';
    }
    return '<article class="ul-review-card ' + reviewStatusClass(meta) + '" data-review-key="' + esc(meta.key) + '" tabindex="-1">' +
      '<header><span>课卡 ' + lessonNumber + '</span><em>' + reviewStatusLabel(meta) + '</em></header>' +
      '<h3>' + esc(lessonName(entry.lesson, entry.index)) + '</h3>' +
      (meta.status === "missing"
        ? '<div class="ul-review-empty-answer"><b>还没有自己的理解</b><p>先回到课卡，用自己的话完成一段表达；这里不会复制教材摘要充当你的笔记。</p></div>'
        : '<div class="ul-review-answer"><b>' + (meta.status === "confirmed" ? "已录入“通过”回执的我的理解" : "我的理解") + '</b><p>' + esc(meta.answer) + '</p></div>') +
      (entry.doubt ? '<div class="ul-review-doubt"><b>真实疑问</b><p>' + esc(entry.doubt) + '</p></div>' : "") +
      feedback +
      '<div class="ul-button-row">' + actions + '</div>' +
      (meta.status === "missing" ? "" : reviewReceiptEditor(entry.levelIndex, entry.index)) +
    '</article>';
  }

  function reviewSignalsHtml(levelIndex) {
    var wrongCount = wrongIds(levelIndex).length;
    var wrongItems = wrongIds(levelIndex).map(function (id) { return questionById(levelIndex, id); }).filter(Boolean).slice(0, 3);
    var allDoubts = curriculumLessons(levelIndex).map(function (lesson, index) {
      var note = lessonNoteValue(levelIndex, index).trim();
      return { note: note, index: index, lesson: lesson };
    }).filter(function (entry) { return entry.note; });
    var doubts = allDoubts.slice(0, 3);
    if (!wrongItems.length && !doubts.length) return "";
    var wrongHtml = wrongItems.length
      ? '<section class="ul-review-signal"><header><span>训练暴露</span><strong>' + wrongCount + ' 道错题</strong></header>' + wrongItems.map(function (item) {
          return '<div><em>' + esc(item.tag) + '</em><p>' + esc(item.q) + '</p></div>';
        }).join("") + '<button class="ul-button" data-ul-action="wrong">去错题档案验证修正</button></section>'
      : "";
    var doubtHtml = doubts.length
      ? '<section class="ul-review-signal"><header><span>阅读留下</span><strong>' + allDoubts.length + ' 个真实疑问</strong></header>' + doubts.map(function (entry) {
          return '<div><em>课卡 ' + String(entry.index + 1).padStart(2, "0") + '</em><p>' + esc(entry.note) + '</p></div>';
        }).join("") + '<button class="ul-button" data-ul-action="view-doubts">查看全部疑问</button></section>'
      : "";
    return '<section class="ul-review-signals" aria-label="当前薄弱信号">' + wrongHtml + doubtHtml + '</section>';
  }

  function reviewTrainingEvidenceHtml(levelIndex) {
    var result = isPlainRecord(state.lastResult[levelIndex]) ? state.lastResult[levelIndex] : null;
    if (!result || !Number(result.total)) return "";
    var mode = result.mode === "wrong" ? "错题复训" : "完整训练";
    var when = Number(result.at) ? new Date(Number(result.at)).toLocaleDateString("zh-CN") : "最近一次";
    return '<section class="ul-review-training-evidence"><span>最近训练证据</span><strong>' + esc(mode) + ' · ' + (Number(result.score) || 0) + ' 分</strong><small>' + esc(when) + ' · ' + (Number(result.correct) || 0) + '/' + (Number(result.total) || 0) + ' 正确</small><button class="ul-button" data-ul-action="training">再次验证</button></section>';
  }

  function reviewControlToken(node) {
    if (!node || !node.closest) return null;
    var control = node.closest("[data-ul-action]");
    if (!control || !overlay.contains(control)) return null;
    return {
      action: control.dataset.ulAction || "",
      filter: control.dataset.filter || "",
      level: control.dataset.level || "",
      lesson: control.dataset.lesson || ""
    };
  }

  function captureReviewRenderState() {
    if (!overlay || overlay.hidden || activeView !== "key-notes") return null;
    var learningWindow = overlay.querySelector(".ul-window");
    var tabs = content.querySelector(".ul-level-tabs");
    return {
      scrollTop: learningWindow ? learningWindow.scrollTop : 0,
      tabsScrollLeft: tabs ? tabs.scrollLeft : 0,
      focus: reviewControlToken(document.activeElement)
    };
  }

  function reviewControlFromToken(token) {
    if (!token) return null;
    if (token.reviewKey) {
      return Array.prototype.slice.call(content.querySelectorAll("[data-review-key]")).filter(function (card) {
        return card.dataset.reviewKey === token.reviewKey;
      })[0] || null;
    }
    if (!token.action) return null;
    var controls = Array.prototype.slice.call(overlay.querySelectorAll('[data-ul-action="' + token.action + '"]'));
    return controls.filter(function (control) {
      return (!token.filter || control.dataset.filter === token.filter) &&
        (!token.level || control.dataset.level === token.level) &&
        (!token.lesson || control.dataset.lesson === token.lesson);
    })[0] || null;
  }

  function restoreReviewRenderState(renderState, preferredFocus) {
    if (!renderState) return;
    var tabs = content.querySelector(".ul-level-tabs");
    var target = reviewControlFromToken(preferredFocus || renderState.focus);
    if (target) {
      try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
    }
    if (tabs) {
      if (target && target.dataset.ulAction === "level") {
        tabs.scrollLeft = Math.max(0, target.offsetLeft - (tabs.clientWidth - target.offsetWidth) / 2);
      } else {
        tabs.scrollLeft = renderState.tabsScrollLeft;
      }
    }
    var learningWindow = overlay.querySelector(".ul-window");
    if (learningWindow) learningWindow.scrollTop = renderState.scrollTop;
  }

  function renderKeyNotes(preferredFocus) {
    var renderState = captureReviewRenderState();
    openOverlay("key-notes", "我的复盘");
    var levelIndex = state.activeLevel;
    var lessons = curriculumLessons(levelIndex);
    var entries = lessons.map(function (lesson, index) {
      return {
        levelIndex: levelIndex,
        lesson: lesson,
        index: index,
        doubt: lessonNoteValue(levelIndex, index).trim(),
        meta: reflectionReviewMeta(levelIndex, index)
      };
    }).sort(function (a, b) { return reviewPriority(a.meta) - reviewPriority(b.meta); });
    var counts = { confirmed: 0, pending: 0, revision: 0 };
    entries.forEach(function (entry) {
      if (entry.meta.status === "confirmed") counts.confirmed += 1;
      else if (entry.meta.status === "needs-revision" || entry.meta.status === "insufficient") counts.revision += 1;
      else if (entry.meta.status !== "missing") counts.pending += 1;
    });
    var visible = entries.filter(function (entry) {
      return reviewFilter === "confirmed" ? entry.meta.status === "confirmed" : entry.meta.status !== "confirmed" && entry.meta.status !== "missing";
    });
    if (reviewFilter === "pending") visible = visible.slice(0, 3);
    var first = visible[0];
    var primaryAction = "";
    if (first) {
      if (first.meta.status === "pending") {
        primaryAction = '<button class="ul-button is-primary" data-ul-action="copy-review-packet" data-level="' + levelIndex + '" data-lesson="' + first.index + '">复制课卡 ' + String(first.index + 1).padStart(2, "0") + ' 审核包</button>';
      } else {
        primaryAction = '<button class="ul-button is-primary" data-ul-action="goto-lesson" data-lesson="' + first.index + '">' + (first.meta.status === "missing" ? "去完成" : "去修改") + '课卡 ' + String(first.index + 1).padStart(2, "0") + '</button>';
      }
    }
    var cards = visible.length
      ? visible.map(reviewCardHtml).join("")
      : '<div class="ul-empty"><h3>' + (reviewFilter === "confirmed" ? "还没有回执通过的理解" : "还没有需要处理的个人表达") + '</h3><p>' + (reviewFilter === "confirmed" ? "完成课卡表达并把 Agent 回执粘贴回来后，会形成你的理解档案。" : "这里不会把未写的课卡变成任务。可以直接训练；真实表达、疑问和错误出现后再回来复盘。") + '</p></div>';
    content.innerHTML =
      pageHead("MY REVIEW / PERSONAL EVIDENCE", levelName(levelIndex), "这里只保留你的表达、真实疑问、训练错误和 Agent 反馈；课程原文仍在书库。", '<span class="ul-chip">待处理 <strong>' + (counts.pending + counts.revision) + '</strong></span><span class="ul-chip is-complete">回执通过 <strong>' + counts.confirmed + '</strong></span>') +
      levelTabs() +
      '<section class="ul-review-dashboard" aria-label="本关复盘统计">' +
        '<div><span>待 Agent 审核</span><strong>' + counts.pending + '</strong></div>' +
        '<div class="is-warn"><span>需要修改</span><strong>' + counts.revision + '</strong></div>' +
        '<div class="is-good"><span>回执通过</span><strong>' + counts.confirmed + '</strong></div>' +
        '<div><span>当前错题</span><strong>' + wrongIds(levelIndex).length + '</strong></div>' +
      '</section>' +
      '<section class="ul-review-handoff"><span>AGENT HANDOFF</span><p><strong>网页不会自动读取你的 Agent 对话。</strong>先复制审核包，粘贴到你的 Agent，再把三行关键反馈带回这里保存。</p><button class="ul-button is-cyan" data-ul-action="copy-full-snapshot" data-ul-prompt="review">复制完整学习快照</button></section>' +
      reviewTrainingEvidenceHtml(levelIndex) +
      reviewSignalsHtml(levelIndex) +
      '<section class="ul-review-toolbar"><div role="group" aria-label="复盘筛选"><button class="ul-review-filter' + (reviewFilter === "pending" ? " is-active" : "") + '" data-ul-action="review-filter" data-filter="pending" aria-pressed="' + (reviewFilter === "pending" ? "true" : "false") + '">待处理</button><button class="ul-review-filter' + (reviewFilter === "confirmed" ? " is-active" : "") + '" data-ul-action="review-filter" data-filter="confirmed" aria-pressed="' + (reviewFilter === "confirmed" ? "true" : "false") + '">回执通过</button></div>' + primaryAction + '</section>' +
      '<section class="ul-review-list" aria-label="个人理解审核记录">' + cards + '</section>' +
      '<footer class="ul-footer-action ul-review-footer"><p>待处理页只显示优先级最高的 3 项。复盘不会阻塞训练；训练负责继续发现问题。</p><button class="ul-button" data-ul-action="training">进入本关训练</button></footer>';
    restoreReviewRenderState(renderState, preferredFocus);
  }

  function reflectionReviewPacket(levelIndex, lessonIndex, answerOverride) {
    var lesson = curriculumLessons(levelIndex)[lessonIndex];
    if (!lesson) return "";
    var answer = (answerOverride !== undefined ? String(answerOverride) : reflectionValue(levelIndex, lessonIndex)).trim();
    var checks = Array.isArray(lesson.reflectionChecks) ? lesson.reflectionChecks : [];
    var doubt = lessonNoteValue(levelIndex, lessonIndex).trim();
    return "请作为严格但鼓励的 AI 学习教练，只审核这一张课卡的理解表达。不要替我写最终答案，也不要给虚假的精确分数。\n\n" +
      "【关卡】" + levelName(levelIndex) + "\n" +
      "【课卡】" + lessonName(lesson, lessonIndex) + "\n" +
      "【表达题】" + (lesson.reflectionPrompt || "") + "\n" +
      "【课程核对要点】" + lessonCore(lesson) + "\n" +
      "【检查要点】" + checks.join("；") + "\n" +
      (doubt ? "【我仍然没懂】" + doubt + "\n" : "") +
      "\n【我的回答】\n" + answer + "\n\n" +
      "请只返回下面三行：\n" +
      "状态：通过 / 需修正 / 信息不足\n" +
      "关键问题：只指出最重要的一处；通过则写无\n" +
      "追问或提示：只给一个，让我自己修改或迁移应用";
  }

  function copyReflectionReviewPacket(levelIndex, lessonIndex, options) {
    options = options || {};
    var answer = (options.answer !== undefined ? String(options.answer) : reflectionValue(levelIndex, lessonIndex)).trim();
    if (answer.length < 20) {
      notify("请先在课卡中写下至少 20 字自己的理解");
      return;
    }
    copyPlainText(reflectionReviewPacket(levelIndex, lessonIndex, answer), options.recordFailed
      ? "审核包已复制；但理解表达未能保存到浏览器，请稍后重试记录"
      : "审核包已复制；在 Agent 审核后把三行回执粘贴回来", function () {
      var key = lessonProgressKey(levelIndex, lessonIndex);
      var existing = isPlainRecord(state.reflectionReviews[key]) ? state.reflectionReviews[key] : null;
      var currentAnswerSignature = textSignature(answer);
      var currentCourseSignature = reflectionReviewCourseSignature(levelIndex, lessonIndex);
      var currentDoubtSignature = textSignature(lessonNoteValue(levelIndex, lessonIndex));
      var sameSource = Boolean(existing && existing.answerSignature === currentAnswerSignature && String(existing.answer || "").trim() === answer && existing.courseSignature === currentCourseSignature && existing.doubtSignature === currentDoubtSignature);
      var now = Date.now();
      var previous = Object.prototype.hasOwnProperty.call(state.reflectionReviews, key) ? state.reflectionReviews[key] : undefined;
      var prevCopiedAt = existing ? existing.copiedAt : 0;
      var prevUpdatedAt = existing ? existing.updatedAt : 0;
      if (sameSource) {
        existing.copiedAt = now;
        existing.updatedAt = now;
      } else {
        var history = existing && Array.isArray(existing.history) ? existing.history.slice(-4) : [];
        var snapshot = reviewHistorySnapshot(existing);
        if (snapshot) history.push(snapshot);
        state.reflectionReviews[key] = {
          schema: 1,
          status: "pending",
          criticalIssue: "",
          prompt: "",
          answerSignature: currentAnswerSignature,
          courseSignature: currentCourseSignature,
          doubtSignature: currentDoubtSignature,
          answer: answer,
          copiedAt: now,
          updatedAt: now,
          reviewedAt: 0,
          confirmedAt: 0,
          history: history.slice(-5)
        };
      }
      if (!saveState()) {
        /* 复制本身已成功，但复制记录落盘失败：回滚 copiedAt/记录，调用方据此改提示 */
        if (sameSource && existing) {
          existing.copiedAt = prevCopiedAt;
          existing.updatedAt = prevUpdatedAt;
        } else if (previous === undefined) {
          delete state.reflectionReviews[key];
        } else {
          state.reflectionReviews[key] = previous;
        }
        return false;
      }
      refreshHomeSoon();
      return true;
    });
  }

  function parseReviewReceipt(text) {
    var lines = String(text || "").split(/\r?\n/).map(function (line) {
      return line.trim().replace(/^[>#*\-\s]+/, "").replace(/\*\*/g, "");
    }).filter(Boolean);
    function field(label) {
      for (var index = 0; index < lines.length; index += 1) {
        if (lines[index].indexOf(label) !== 0) continue;
        return lines[index].slice(label.length).replace(/^\s*[:：]\s*/, "").trim();
      }
      return "";
    }
    var rawStatus = field("状态").replace(/[\s。.!！]/g, "");
    var status = rawStatus === "需修正" ? "needs-revision" : (rawStatus === "信息不足" ? "insufficient" : (rawStatus === "通过" ? "confirmed" : ""));
    if (!status) return null;
    return {
      status: status,
      criticalIssue: field("关键问题"),
      prompt: field("追问或提示")
    };
  }

  function saveReflectionReviewReceipt(button) {
    var levelIndex = Number(button.dataset.level);
    var lessonIndex = Number(button.dataset.lesson);
    var card = button.closest(".ul-review-card");
    var textarea = card && card.querySelector("textarea[data-review-receipt]");
    var answer = reflectionValue(levelIndex, lessonIndex).trim();
    if (!textarea || answer.length < 20) {
      notify("当前课卡还没有可审核的理解表达");
      return;
    }
    var parsed = parseReviewReceipt(textarea.value);
    if (!parsed) {
      notify("未识别回执；请保留“状态：通过 / 需修正 / 信息不足”这一行");
      return;
    }
    if (!parsed.criticalIssue || !parsed.prompt) {
      notify("回执还缺“关键问题”或“追问或提示”");
      return;
    }
    var key = lessonProgressKey(levelIndex, lessonIndex);
    var existing = isPlainRecord(state.reflectionReviews[key]) ? state.reflectionReviews[key] : null;
    var answerSignature = textSignature(answer);
    var courseSignature = reflectionReviewCourseSignature(levelIndex, lessonIndex);
    var doubtSignature = textSignature(lessonNoteValue(levelIndex, lessonIndex));
    var sourceIsCurrent = Boolean(existing && existing.answerSignature === answerSignature && String(existing.answer || "").trim() === answer && existing.courseSignature === courseSignature && existing.doubtSignature === doubtSignature);
    if (!sourceIsCurrent || !Number(existing.copiedAt)) {
      notify("请先复制当前版本的审核包，再保存 Agent 回执");
      return;
    }
    var now = Date.now();
    var previous = state.reflectionReviews[key];
    state.reflectionReviews[key] = {
      schema: 1,
      status: parsed.status,
      criticalIssue: parsed.criticalIssue,
      prompt: parsed.prompt,
      answerSignature: answerSignature,
      courseSignature: courseSignature,
      doubtSignature: doubtSignature,
      answer: answer,
      copiedAt: Number(existing.copiedAt),
      updatedAt: now,
      reviewedAt: now,
      confirmedAt: parsed.status === "confirmed" ? now : 0,
      history: Array.isArray(existing.history) ? existing.history.slice(-5) : []
    };
    if (!saveState()) {
      state.reflectionReviews[key] = previous;
      notify("回执未能保存：浏览器存储不可用或已满，请稍后重试");
      renderKeyNotes({ reviewKey: key });
      return;
    }
    refreshHomeSoon();
    reviewFilter = parsed.status === "confirmed" ? "confirmed" : "pending";
    notify(parsed.status === "confirmed" ? "已保存 Agent 回执：通过（仅代表你粘贴的内容）" : "Agent 反馈已保存，下一步按关键问题修改");
    renderKeyNotes({ reviewKey: key });
  }

  function renderLesson(lessonIndex) {
    var levelIndex = state.activeLevel;
    var level = course.levels[levelIndex];
    var lessons = curriculumLessons(levelIndex);
    var lesson = lessons[lessonIndex];
    if (!lesson) {
      renderLibrary();
      return;
    }
    var canResumeQuestion = Boolean(lessonReturnToQuestion && session && session.levelIndex === levelIndex && currentQuestion());
    openOverlay("lesson", "课程书库");
    var done = lessonIsRead(levelIndex, lessonIndex);
    var noteKey = lessonProgressKey(levelIndex, lessonIndex);
    var noteValue = lessonNoteValue(levelIndex, lessonIndex);
    var reflectionKey = lessonProgressKey(levelIndex, lessonIndex);
    var savedReflection = reflectionValue(levelIndex, lessonIndex);
    var reflectionDone = reflectionIsComplete(levelIndex, lessonIndex);
    var reflectionPrompt = lesson.reflectionPrompt || ("请用自己的话总结《" + lessonName(lesson, lessonIndex) + "》，并举一个自己的例子。");
    var reflectionChecks = Array.isArray(lesson.reflectionChecks) ? lesson.reflectionChecks : ["说明核心概念", "指出一个误区", "包含自己的例子"];
    var reflectionCheckHtml = reflectionChecks.map(function (item) {
      return '<span>' + esc(item) + '</span>';
    }).join("");
    var readingContent = lesson.beginnerBody
      ? '<section class="ul-reading-path">' +
          '<div class="ul-reading-path-head"><span>默认阅读模式</span><strong>先理解，再补充术语</strong><small>先完成新手导读；需要完整知识时再展开教材。</small></div>' +
          '<article class="ul-beginner-body">' + glossaryHtml(lesson.beginnerBody) + '</article>' +
          '<details class="ul-full-lesson"><summary><span>展开完整教材</span><small>查看术语、工程细节、边界和更多案例</small></summary><article class="ul-lesson-body">' + glossaryHtml(lesson.body || "") + '</article></details>' +
        '</section>'
      : '<article class="ul-lesson-body">' + glossaryHtml(lesson.body || "") + '</article>';
    content.innerHTML =
      '<div class="ul-lesson-shell">' +
        '<button class="ul-button ul-back" data-ul-action="' + (canResumeQuestion ? "resume-question" : "library") + '">' + (canResumeQuestion ? "返回本轮训练" : "返回本关书库") + '</button>' +
        '<header class="ul-lesson-head">' +
          '<div class="ul-book-meta"><span>LEVEL ' + String(levelIndex + 1).padStart(2, "0") + ' / 课卡 ' + String(lessonIndex + 1).padStart(2, "0") + '</span><em>' + (done ? "已读" : "待读") + '</em></div>' +
          '<h1 class="ul-lesson-title">' + esc(lessonName(lesson, lessonIndex)) + '</h1>' +
        '</header>' +
        '<div class="ul-core-card"><strong>本卡核心结论</strong>' + esc(lessonCore(lesson)) + '</div>' +
        readingContent +
        '<section class="ul-reflection-card' + (reflectionDone ? " is-complete" : "") + '">' +
          '<header><div><span>WRITTEN CHECK / 理解表述</span><h2>只写一段自己的话</h2></div><em data-reflection-badge>' + (reflectionDone ? "已记录" : "待记录") + '</em></header>' +
          '<p class="ul-reflection-prompt">' + esc(reflectionPrompt) + '</p>' +
          '<div class="ul-reflection-checks">' + reflectionCheckHtml + '</div>' +
          '<label for="ul-reflection">我的理解表述</label>' +
          '<small>建议 30–120 字。至少 20 字会记为“已记录”；字数只代表形成记录，不代表内容一定正确。</small>' +
          '<textarea id="ul-reflection" data-reflection-key="' + esc(reflectionKey) + '" data-level-index="' + levelIndex + '" data-lesson-index="' + lessonIndex + '" placeholder="不要抄原文。先关掉上面的完整教材，再用自己的话说明。">' + esc(savedReflection) + '</textarea>' +
          '<footer><span data-reflection-count>' + savedReflection.trim().length + ' 字 · ' + (reflectionDone ? "已形成记录" : "至少还需 " + Math.max(0, 20 - savedReflection.trim().length) + " 字") + '</span><div class="ul-button-row"><button class="ul-button" data-ul-action="save-reflection">保存表达</button><button class="ul-button is-cyan" data-ul-action="copy-reflection">复制给 Agent 审核</button></div></footer>' +
        '</section>' +
        '<section class="ul-question-note">' +
          '<label for="ul-note">我还没懂什么？（可选，不是作业）</label>' +
          '<small>只记录真实疑问，之后可以随学习快照交给 Agent。已经理解就留空。</small>' +
          '<textarea id="ul-note" data-note-key="' + esc(noteKey) + '" placeholder="例如：我还分不清 RAG 和工具调用的边界。">' + esc(noteValue) + '</textarea>' +
          '<div class="ul-button-row" style="margin-top:10px"><button class="ul-button" data-ul-action="save-note">保存疑问</button></div>' +
        '</section>' +
        '<footer class="ul-footer-action">' +
          '<div class="ul-button-row">' +
            '<button class="ul-button" data-ul-action="lesson-prev" data-lesson="' + lessonIndex + '"' + (lessonIndex === 0 ? " disabled" : "") + '>上一张</button>' +
            '<button class="ul-button" data-ul-action="lesson-next" data-lesson="' + lessonIndex + '"' + (lessonIndex === lessons.length - 1 ? " disabled" : "") + '>下一张</button>' +
          '</div>' +
          '<button class="ul-button is-primary" data-ul-action="mark-read" data-lesson="' + lessonIndex + '">' + (done ? "已读，返回书库" : "标记已读") + '</button>' +
        '</footer>' +
      '</div>';
  }

  function markLessonRead(lessonIndex) {
    var levelIndex = state.activeLevel;
    var level = course.levels[levelIndex];
    var wasRead = lessonIsRead(levelIndex, lessonIndex);
    if (!wasRead && !reflectionIsComplete(levelIndex, lessonIndex)) {
      notify("先写一段自己的理解再标记已读，至少 20 字");
      return;
    }
    var readKey = lessonProgressKey(levelIndex, lessonIndex);
    var legacyIndex = legacyLessonIndex(levelIndex, lessonIndex);
    var fallbackKey = legacyIndex === null ? "" : levelIndex + ":" + legacyIndex;
    var hadDeep = Boolean(state.deepRead[readKey]);
    var hadFallback = fallbackKey ? Boolean(state.readFallback[fallbackKey]) : false;
    var hadRewardMarker = Object.prototype.hasOwnProperty.call(state.readRewarded, readKey);
    var previousRewardMarker = state.readRewarded[readKey];
    state.deepRead[readKey] = true;
    if (fallbackKey) state.readFallback[fallbackKey] = true;
    /* 旧版已读记录没有奖励回执字段时，假定历史 XP 已经处理，避免升级后重复发放。
       新的首次已读显式写 false；若 XP 保存失败，下一次点击可安全重试。 */
    if (!wasRead) state.readRewarded[readKey] = false;
    else if (!hadRewardMarker) state.readRewarded[readKey] = true;
    /* 先持久化 unified 已读状态；失败恢复旧值，不触碰 legacy 与 XP。 */
    if (!saveState()) {
      if (hadDeep) state.deepRead[readKey] = true;
      else delete state.deepRead[readKey];
      if (fallbackKey) {
        if (hadFallback) state.readFallback[fallbackKey] = true;
        else delete state.readFallback[fallbackKey];
      }
      if (hadRewardMarker) state.readRewarded[readKey] = previousRewardMarker;
      else delete state.readRewarded[readKey];
      notify("已读记录未能保存：浏览器存储不可用或已满，请稍后重试");
      renderLibrary();
      return;
    }
    var legacy = getLegacyLevelState(levelIndex);
    var legacyWasRead = legacyIndex !== null && legacy && Array.isArray(legacy.les) ? Boolean(legacy.les[legacyIndex]) : false;
    if (legacyIndex !== null && legacy && Array.isArray(legacy.les)) legacy.les[legacyIndex] = true;
    if (typeof window.save === "function" && window.save() === false && legacyIndex !== null && legacy && Array.isArray(legacy.les)) {
      legacy.les[legacyIndex] = legacyWasRead;
    }
    var rewardPending = state.readRewarded[readKey] === false;
    if (rewardPending && typeof window.addXP === "function" && window.addXP(8, "读完课卡", "unified:lesson:" + readKey)) {
      state.readRewarded[readKey] = true;
      if (!saveState()) state.readRewarded[readKey] = false;
    }
    if (typeof window.renderMap === "function") window.renderMap();
    if (typeof window.renderMe === "function") window.renderMe();
    refreshHomeSoon();
    notify(state.readRewarded[readKey] === false ? "课卡已记录；XP 暂未同步，再点一次可安全重试" : (wasRead ? "这张课卡已经读过" : "课卡已记录"));
    renderLibrary();
  }

  function renderTrainingHome(focusWrong) {
    openOverlay("training", "本关训练与审核");
    var levelIndex = state.activeLevel;
    var lessons = curriculumLessons(levelIndex);
    var read = readCount(levelIndex);
    var total = bank(levelIndex).length;
    var best = Number(state.best[levelIndex]) || 0;
    var wrong = wrongIds(levelIndex).length;
    var size = sessionSize(levelIndex);
    var threshold = passThreshold(levelIndex);
    var streak = Number(state.mockStreak[levelIndex]) || 0;
    var streakTarget = requiredMockStreak(levelIndex);
    var reviewCounts = { pending: 0, revision: 0, confirmed: 0 };
    lessons.forEach(function (lesson, index) {
      var meta = reflectionReviewMeta(levelIndex, index);
      if (meta.status === "confirmed") reviewCounts.confirmed += 1;
      else if (meta.status === "needs-revision" || meta.status === "insufficient") reviewCounts.revision += 1;
      else if (meta.status === "pending") reviewCounts.pending += 1;
    });
    var reviewNeedsAttention = reviewCounts.pending + reviewCounts.revision;
    content.innerHTML =
      pageHead("WORKSHOP / PRACTICE + REVIEW", levelName(levelIndex), "每次随机抽题，一次只判断一个概念；作答后立即解释，结束后自动判分并生成错题。", '<span class="ul-chip">题库 <strong>' + total + '</strong></span><span class="ul-chip">最高 <strong>' + best + ' 分</strong></span>' + (isAdvancedLevel(levelIndex) ? '<span class="ul-chip">连胜 <strong>' + Math.min(streak, streakTarget) + '/' + streakTarget + '</strong></span>' : "")) +
      levelTabs() +
      credentialBrief(levelIndex) +
      '<section class="ul-training-note-gate ' + (reviewNeedsAttention ? "" : "is-ready") + '"><div><span>MY REVIEW / OPTIONAL</span><strong>' + (reviewNeedsAttention ? "有 " + reviewNeedsAttention + " 条理解待审核或修改" : "当前没有待处理理解") + '</strong><p>复盘不再是训练门槛。你可以先训练诊断，再回到“我的复盘”处理真实理解、疑问和错题。</p></div><button class="ul-button ' + (reviewNeedsAttention ? "is-cyan" : "") + '" data-ul-action="key-notes">打开我的复盘</button></section>' +
      '<div class="ul-training-grid">' +
        '<section class="ul-mission-card">' +
          '<h3>本关训练任务</h3>' +
          '<p>本轮抽取 ' + Math.min(size, total) + ' 题，包含判断题和选择题。' + (isAdvancedLevel(levelIndex) ? '每轮至少 85 分，连续 3 轮达线才完成本关高级训练要求；一轮未达线会重新计数。这是自我训练纪律，与任何外部考试报名无关。' : '达到 80 分即通过。') + '系统按当前题库答案判分，判分范围只覆盖本题库。</p>' +
          '<div class="ul-stat-row">' +
            '<div class="ul-stat"><strong>' + read + "/" + lessons.length + '</strong>课卡已读</div>' +
            '<div class="ul-stat"><strong>' + total + '</strong>题库总量</div>' +
            '<div class="ul-stat"><strong>' + wrong + '</strong>当前错题</div>' +
            (isAdvancedLevel(levelIndex) ? '<div class="ul-stat"><strong>' + Math.min(streak, streakTarget) + '/' + streakTarget + '</strong>连续达线</div>' : "") +
          '</div>' +
          (read < lessons.length ? '<div class="ul-flow-note"><span>!</span><div>还有课卡未读。可以先训练诊断，也可以返回书库完成输入。</div></div>' : "") +
          '<div class="ul-button-row">' +
            '<button class="ul-button is-primary" data-ul-action="start" data-mode="normal">' + (isAdvancedLevel(levelIndex) ? "开始一轮高级训练" : "开始随机训练") + '</button>' +
            '<button class="ul-button" data-ul-action="start" data-mode="wrong"' + (wrong ? "" : " disabled") + '>只练错题</button>' +
            '<button class="ul-button" data-ul-action="library">返回书库</button>' +
          '</div>' +
        '</section>' +
        '<aside class="ul-side-card">' +
          '<h3>一页完成全部流程</h3>' +
          '<div class="ul-flow-list">' +
            '<div class="ul-flow-item"><span>1</span><div>选择或判断</div></div>' +
            '<div class="ul-flow-item"><span>2</span><div>立即看到解释</div></div>' +
            '<div class="ul-flow-item"><span>3</span><div>系统自动判分</div></div>' +
            '<div class="ul-flow-item"><span>4</span><div>错题进入复盘档案</div></div>' +
          '</div>' +
          '<p>Agent 深度复盘改为可选项，只在你对错题解释仍有疑问时使用。</p>' +
        '</aside>' +
      '</div>' +
      (focusWrong && wrong ? '<div class="ul-footer-action"><p>你从“错题档案”进入，目前有 ' + wrong + ' 道待消除错题。</p><button class="ul-button is-cyan" data-ul-action="wrong">查看错题解释</button></div>' : "");
  }

  function startSession(mode) {
    var levelIndex = state.activeLevel;
    var source = mode === "wrong"
      ? wrongIds(levelIndex).map(function (id) { return questionById(levelIndex, id); }).filter(Boolean)
      : bank(levelIndex).slice();
    if (!source.length) {
      notify(mode === "wrong" ? "当前没有错题" : "当前关卡尚未配置题目");
      return;
    }
    var last = Array.isArray(state.lastSession[levelIndex]) ? state.lastSession[levelIndex] : [];
    var fresh = source.filter(function (item) { return last.indexOf(item.id) === -1; });
    var ordered = shuffle(fresh).concat(shuffle(source.filter(function (item) { return fresh.indexOf(item) === -1; })));
    var count = mode === "wrong" ? source.length : Math.min(sessionSize(levelIndex), source.length);
    var selected = ordered.slice(0, count);
    state.lastSession[levelIndex] = selected.map(function (item) { return item.id; });
    persistOrWarn();
    session = {
      levelIndex: levelIndex,
      mode: mode,
      ids: selected.map(function (item) { return item.id; }),
      index: 0,
      revealed: false,
      chosen: null,
      answers: []
    };
    renderQuestion();
  }

  function currentQuestion() {
    if (!session) return null;
    return questionById(session.levelIndex, session.ids[session.index]);
  }

  function renderQuestion() {
    var item = currentQuestion();
    if (!item) {
      renderTrainingHome();
      return;
    }
    openOverlay("question", "本关训练与审核");
    var total = session.ids.length;
    var number = session.index + 1;
    var progress = Math.round((number / total) * 100);
    var sourceLesson = questionLessonNumber(session.levelIndex, item.id);
    var sourceLabel = sourceLesson ? "课卡 " + String(sourceLesson).padStart(2, "0") : "本关综合";
    var guide = (QUESTION_GUIDES[session.levelIndex] || {})[item.id] || null;
    var letters = ["A", "B", "C", "D", "E"];
    var answers = item.options.map(function (option, index) {
      var classes = "ul-answer";
      if (session.revealed && index === item.answer) classes += " is-correct";
      if (session.revealed && index === session.chosen && index !== item.answer) classes += " is-wrong";
      return '<button class="' + classes + '" data-ul-action="answer" data-answer="' + index + '"' + (session.revealed ? " disabled" : "") + '>' +
        '<b>' + letters[index] + '</b><span>' + esc(option) + '</span>' +
      '</button>';
    }).join("");
    var feedback = "";
    if (session.revealed) {
      var correct = session.chosen === item.answer;
      var lessonLink = "";
      if (!correct && sourceLesson) {
        lessonLink = '<div class="ul-source-hint" style="margin-top:8px"><button type="button" class="ul-button ul-question-link" data-ul-action="goto-lesson" data-lesson="' + (sourceLesson - 1) + '">📖 回课卡 ' + String(sourceLesson).padStart(2, "0") + ' 重读</button></div>';
      }
      feedback = '<div class="ul-feedback ' + (correct ? "is-correct" : "is-wrong") + '">' +
        '<strong>' + (correct ? "判断正确" : "判断错误，正确答案是 " + esc(item.options[item.answer])) + '</strong>' +
        esc(item.explain) +
        (guide && guide.plain ? '<div class="ul-guide-explain"><b>换句话说</b><p>' + esc(guide.plain) + '</p>' + (guide.trap ? '<small>容易误解：' + esc(guide.trap) + '</small>' : "") + '</div>' : "") +
        '<small class="ul-source-hint">知识来源：' + esc(sourceLabel) + '</small>' +
        lessonLink +
      '</div>' +
      '<div class="ul-button-row" style="margin-top:16px"><button class="ul-button is-primary" data-ul-action="next-question">' + (number === total ? "查看判分结果" : "下一题") + '</button></div>';
    }
    content.innerHTML =
      '<div class="ul-question-wrap">' +
        '<div class="ul-progress-head"><span>' + esc(levelName(session.levelIndex)) + '</span><strong>' + number + " / " + total + '</strong></div>' +
        '<div class="ul-progress-track"><span style="width:' + progress + '%"></span></div>' +
        '<section class="ul-question-card">' +
          '<span class="ul-question-type">' + (item.type === "judge" ? "判断题" : "单项选择题") + " / " + esc(sourceLabel) + " / " + esc(item.tag) + '</span>' +
          (guide && guide.terms ? '<div class="ul-reading-hint"><strong>读题翻译</strong><span>' + esc(guide.terms) + '</span></div>' : "") +
          '<h2>' + esc(item.q) + '</h2>' +
          '<div class="ul-answers">' + answers + '</div>' +
          feedback +
        '</section>' +
      '</div>';
  }

  function recordAnswer(answerIndex) {
    if (!session || session.revealed) return;
    var item = currentQuestion();
    if (!item) return;
    session.chosen = answerIndex;
    session.revealed = true;
    var correct = answerIndex === item.answer;
    session.answers.push({
      id: item.id,
      chosen: answerIndex,
      correct: correct
    });
    var wrong = wrongIds(session.levelIndex).slice();
    var position = wrong.indexOf(item.id);
    if (correct && position >= 0) wrong.splice(position, 1);
    if (!correct && position < 0) wrong.push(item.id);
    state.wrong[session.levelIndex] = wrong;
    persistOrWarn();
    renderQuestion();
  }

  function nextQuestion() {
    if (!session || !session.revealed) return;
    if (session.index >= session.ids.length - 1) {
      finishSession();
      return;
    }
    session.index += 1;
    session.revealed = false;
    session.chosen = null;
    renderQuestion();
  }

  function finishSession() {
    if (!session) return;
    var correct = session.answers.filter(function (answer) { return answer.correct; }).length;
    var total = session.answers.length;
    var score = total ? Math.round((correct / total) * 100) : 0;
    var fullTraining = session.mode === "normal";
    var levelIndex = session.levelIndex;
    var threshold = passThreshold(levelIndex);
    var passed = fullTraining && score >= threshold;
    var wrongNow = session.answers.filter(function (answer) { return !answer.correct; }).map(function (answer) { return answer.id; });
    /* 先快照旧持久状态：best/streak/passed/rewarded 只有落盘成功才生效 */
    var prevBest = Number(state.best[levelIndex]) || 0;
    var prevStreak = Number(state.mockStreak[levelIndex]) || 0;
    var prevPassed = Boolean(state.passed[levelIndex]);
    var prevRewarded = Boolean(state.rewarded[levelIndex]);
    var qualified = false;
    if (fullTraining) {
      state.best[levelIndex] = Math.max(prevBest, score);
      if (isAdvancedLevel(levelIndex)) {
        state.mockStreak[levelIndex] = passed ? prevStreak + 1 : 0;
        qualified = state.mockStreak[levelIndex] >= requiredMockStreak(levelIndex);
        state.passed[levelIndex] = Boolean(prevPassed || qualified);
      } else {
        qualified = passed;
        state.passed[levelIndex] = Boolean(prevPassed || passed);
      }
    }
    var rewardNow = fullTraining && state.passed[levelIndex] && !prevRewarded;
    state.lastResult[levelIndex] = {
      mode: session.mode,
      score: score,
      total: total,
      correct: correct,
      threshold: threshold,
      streak: Number(state.mockStreak[levelIndex]) || 0,
      qualified: Boolean(state.passed[levelIndex]),
      at: Date.now(),
      wrong: wrongNow,
      persisted: true
    };
    if (!saveState()) {
      /* 持久化失败：回滚全部完成相关状态，本轮分数仅以 persisted=false 展示，
         不计入正式通过/完成，不发 XP、不同步 legacy */
      state.best[levelIndex] = prevBest;
      state.mockStreak[levelIndex] = prevStreak;
      state.passed[levelIndex] = prevPassed;
      state.rewarded[levelIndex] = prevRewarded;
      state.lastResult[levelIndex] = {
        mode: session.mode,
        score: score,
        total: total,
        correct: correct,
        threshold: threshold,
        streak: prevStreak,
        qualified: prevPassed,
        at: Date.now(),
        wrong: wrongNow,
        persisted: false
      };
      refreshHomeSoon();
      lessonReturnToQuestion = false;
      session = null;
      renderResult(levelIndex);
      return;
    }
    if (rewardNow && typeof window.addXP === "function" && window.addXP(25, "本关训练通过", "unified:training:" + levelIndex)) {
      state.rewarded[levelIndex] = true;
      if (!saveState()) state.rewarded[levelIndex] = prevRewarded;
    }
    if (rewardNow && !state.rewarded[levelIndex]) {
      notify("训练结果已保存；XP 暂未同步，完成下一轮训练时会安全重试且不会重复发放");
    }
    if (fullTraining && state.passed[levelIndex] && isAdvancedLevel(levelIndex)) {
      var legacy = getLegacyLevelState(levelIndex);
      /* 只同步旧版练习勾选显示；legacy.quiz 不再回写——它不再是正式完成依据，
         正式完成只以本模块 state.passed 为准。 */
      if (legacy && Array.isArray(legacy.ex)) legacy.ex.forEach(function (item) { item.p = true; });
      if (typeof window.save === "function") window.save();
    }
    refreshHomeSoon();
    lessonReturnToQuestion = false;
    session = null;
    renderResult(levelIndex);
  }

  function renderResult(levelIndex) {
    var result = state.lastResult[levelIndex];
    if (!result) {
      renderTrainingHome();
      return;
    }
    openOverlay("result", "训练判分结果");
    var fullTraining = result.mode !== "wrong";
    var threshold = Number(result.threshold) || passThreshold(levelIndex);
    var passed = fullTraining ? result.score >= threshold : wrongIds(levelIndex).length === 0;
    var advanced = isAdvancedLevel(levelIndex);
    var qualified = Boolean(result.qualified || state.passed[levelIndex]);
    var streak = Number(result.streak) || 0;
    var tags = {};
    (result.wrong || []).forEach(function (id) {
      var item = questionById(levelIndex, id);
      if (item) tags[item.tag] = (tags[item.tag] || 0) + 1;
    });
    var tagHtml = Object.keys(tags).length
      ? Object.keys(tags).map(function (tag) { return '<span class="ul-tag">' + esc(tag) + " x" + tags[tag] + '</span>'; }).join("")
      : '<span class="ul-tag">本轮无薄弱项</span>';
    var unsaved = result.persisted === false;
    content.innerHTML =
      '<section class="ul-result-card' + (passed && !unsaved ? " is-pass" : "") + '">' +
        '<p class="ul-kicker">AUTOMATIC SCORING / 客观题判分</p>' +
        (unsaved
          ? '<div class="ul-flow-note"><span>!</span><div>本轮结果未保存（浏览器存储不可用或已满），请保留页面并稍后重试；当前分数仅为本轮展示，不计入正式完成或连续记录。</div></div>'
          : "") +
        '<div class="ul-result-score">' +
          '<div class="ul-score-orb">' + result.score + '</div>' +
          '<div><h2>' + (unsaved ? "本轮分数已计算，但未保存" : (fullTraining ? (advanced ? (passed ? (qualified ? "连续三轮达线已完成" : "本轮达线，继续保持") : "本轮未达 85 分") : (passed ? "本轮训练通过" : "本轮需要复训")) : (passed ? "本轮错题已清零" : "仍有错题需要复训"))) + '</h2>' +
          '<p>答对 ' + result.correct + " / " + result.total + " 题。" + (unsaved ? "本轮结果未保存，不计入正式完成或连续记录；错题清单仅供本轮参考。" : (fullTraining ? (advanced ? "本轮门槛为 " + threshold + " 分，当前连续达线 " + Math.min(streak, 3) + "/3。错误题目已自动进入错题档案。" : "系统已按当前题库答案完成本轮判分，错误题目已自动进入错题档案。") : "错题复训只负责修正错误，不会被记录为整关成绩或奖励 XP。")) + '</p></div>' +
        '</div>' +
        '<h3>本轮薄弱概念</h3>' +
        '<div class="ul-tag-list">' + tagHtml + '</div>' +
        (unsaved ? "" : '<div class="ul-flow-note"><span>i</span><div>' + (fullTraining ? (advanced ? (qualified ? "连续三轮达线已完成；若自选报考外部证书，规则以发证方当期通知为准，实操能力还要看本关作品证据。" : (passed ? "不要立刻背答案重考。先隔时复述薄弱概念，再完成下一轮训练。" : "连续记录已归零。先只练错题，理解后再开始新的完整训练。")) : (passed ? "本轮训练已形成记录。若解释仍不清楚，再把错题发给 Agent 深度复盘。" : "先只练本轮错题，不要立刻重做整套题。错题清零后再进行新的随机训练。")) : (passed ? "错题已清零。现在完成一组完整随机训练，才能形成本关成绩。" : "继续针对仍答错的错题复训。")) + '</div></div>') +
        '<div class="ul-button-row">' +
          '<button class="ul-button is-primary" data-ul-action="start" data-mode="wrong"' + (wrongIds(levelIndex).length ? "" : " disabled") + '>只练错题</button>' +
          '<button class="ul-button" data-ul-action="start" data-mode="normal">' + (fullTraining ? "再抽一组" : "开始完整训练") + '</button>' +
          '<button class="ul-button" data-ul-action="wrong">查看错题档案</button>' +
          '<button class="ul-button" data-ul-action="copy-review">复制结果给 Agent</button>' +
        '</div>' +
      '</section>';
  }

  function renderWrongArchive() {
    openOverlay("wrong", "错题档案");
    var levelIndex = state.activeLevel;
    var ids = wrongIds(levelIndex);
    var tagCounts = {};
    ids.map(function (id) { return questionById(levelIndex, id); }).filter(Boolean).forEach(function (item) {
      tagCounts[item.tag] = (tagCounts[item.tag] || 0) + 1;
    });
    var tagWarning = "";
    Object.keys(tagCounts).forEach(function (tag) {
      if (tagCounts[tag] > 1) tagWarning += '<span class="ul-tag is-warn">' + esc(tag) + " x" + tagCounts[tag] + " · 建议重读对应课卡</span>";
    });
    var cards = ids.map(function (id) {
      var item = questionById(levelIndex, id);
      if (!item) return "";
      var sourceLesson = questionLessonNumber(levelIndex, item.id);
      var sourceLabel = sourceLesson ? "课卡 " + String(sourceLesson).padStart(2, "0") : "本关综合";
      return '<article class="ul-wrong-card">' +
        '<span class="ul-question-type">' + esc(sourceLabel) + " / " + esc(item.tag) + '</span>' +
        '<h3>' + esc(item.q) + '</h3>' +
        '<p><strong>正确答案：</strong>' + esc(item.options[item.answer]) + '</p>' +
        '<p>' + esc(item.explain) + '</p>' +
        '<small class="ul-source-hint">知识来源：本关' + esc(sourceLabel) + '</small>' +
      '</article>';
    }).join("");
    content.innerHTML =
      pageHead("ERROR ARCHIVE / RETRIEVAL", levelName(levelIndex), "错题不是惩罚，而是下一轮最小训练集。答对后会自动从档案中移除。", '<span class="ul-chip">待消除 <strong>' + ids.length + '</strong></span>') +
      levelTabs() +
      (tagWarning ? '<div class="ul-tag-list" style="margin:0 14px 14px">' + tagWarning + '</div>' : "") +
      (ids.length
        ? '<div class="ul-wrong-list">' + cards + '</div><footer class="ul-footer-action"><p>先读解释，再用“只练错题”验证是否真正修正。</p><div class="ul-button-row"><button class="ul-button is-primary" data-ul-action="start" data-mode="wrong">只练错题</button><button class="ul-button" data-ul-action="copy-review">复制错题给 Agent</button></div></footer>'
        : '<div class="ul-empty"><h3>当前没有错题</h3><p>开始一次随机训练，系统会把错误判断自动收集到这里。</p><button class="ul-button is-primary" data-ul-action="training">开始训练</button></div>');
  }

  function renderDoubts() {
    var levelIndex = state.activeLevel;
    var lessons = curriculumLessons(levelIndex);
    var entries = lessons.map(function (lesson, index) {
      return { note: lessonNoteValue(levelIndex, index).trim(), title: lesson.t || lesson.title || ("课卡 " + (index + 1)), index: index };
    }).filter(function (entry) { return entry.note; });
    openOverlay("library", "课程书库");
    content.innerHTML =
      pageHead("DOUBTS / 未解疑问", levelName(levelIndex), "这些是你读过课卡后留下的真实疑问，按课卡排列。复制或收起后不会消失，直到你手动清空。", '<span class="ul-chip">疑问 <strong>' + entries.length + '</strong></span><span class="ul-chip">课卡 <strong>' + lessons.length + '</strong></span>') +
      (entries.length
        ? '<div class="ul-doubt-list">' + entries.map(function (entry) {
            return '<article class="ul-doubt-card"><h3>' + esc(entry.title) + ' <button class="ul-button" data-ul-action="goto-lesson" data-lesson="' + entry.index + '">打开课卡</button></h3><p>' + esc(entry.note) + '</p></article>';
          }).join("") + '</div>'
        : '<div class="ul-empty"><h3>本关没有未解疑问</h3><p>每张课卡底部的"我还没懂什么"是留给真实困惑的，不是作业。</p></div>') +
      '<footer class="ul-footer-action"><button class="ul-button" data-ul-action="library">返回书库</button></footer>';
  }

  function reviewPacket() {
    var levelIndex = state.activeLevel;
    var result = state.lastResult[levelIndex] || {};
    var ids = wrongIds(levelIndex);
    var details = ids.map(function (id, index) {
      var item = questionById(levelIndex, id);
      if (!item) return "";
      return (index + 1) + ". " + item.q + "\n正确答案：" + item.options[item.answer] + "\n页面解释：" + item.explain;
    }).filter(Boolean).join("\n\n");
    return "请继续作为我的长期 AI 学习教练，帮我复盘《GOGO · AI 闯关地图》的客观训练。\n\n" +
      "【当前关卡】" + levelName(levelIndex) + "\n" +
      "【最近成绩】" + (result.score == null ? "暂无" : result.score + " 分（" + result.correct + "/" + result.total + "）") + "\n" +
      "【仍未消除的错题】" + ids.length + " 道\n\n" +
      (details || "当前没有错题。") +
      "\n\n请不要重新讲整章，只针对最关键的一个误区：①指出我混淆了什么；②用一个新例子解释；③再出一道不重复的小题检查我。";
  }

  function copyReview() {
    var text = reviewPacket();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        notify("训练结果已复制，可以粘贴给 Agent");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      notify("训练结果已复制，可以粘贴给 Agent");
    } catch (error) {
      notify("复制失败，请手动选择错题内容");
    }
    textarea.remove();
  }

  function saveCurrentNote() {
    var textarea = overlay.querySelector("textarea[data-note-key]");
    if (!textarea) return;
    var key = textarea.dataset.noteKey;
    var previous = Object.prototype.hasOwnProperty.call(state.notes, key) ? state.notes[key] : undefined;
    state.notes[key] = textarea.value.trim();
    if (!saveState()) {
      if (previous === undefined) delete state.notes[key];
      else state.notes[key] = previous;
      notify("疑问未能保存：浏览器存储不可用或已满，请稍后重试");
      return;
    }
    notify(textarea.value.trim() ? "疑问已保存" : "该课卡没有待解决疑问");
  }

  function updateReflectionUi(textarea, persisted) {
    var value = textarea.value.trim();
    var card = textarea.closest(".ul-reflection-card");
    if (!card) return;
    var complete = value.length >= 20;
    var unsaved = persisted === false;
    card.classList.toggle("is-complete", complete && !unsaved);
    var badge = card.querySelector("[data-reflection-badge]");
    var counter = card.querySelector("[data-reflection-count]");
    if (badge) badge.textContent = unsaved ? "未保存，请重试" : (complete ? "已记录" : "待记录");
    if (counter) counter.textContent = value.length + " 字 · " + (unsaved ? "未保存，请重试" : (complete ? "已形成记录" : "至少还需 " + Math.max(0, 20 - value.length) + " 字"));
  }

  function saveCurrentReflection() {
    var textarea = overlay.querySelector("textarea[data-reflection-key]");
    if (!textarea) return;
    var key = textarea.dataset.reflectionKey;
    var value = textarea.value.trim();
    var previous = Object.prototype.hasOwnProperty.call(state.reflections, key) ? state.reflections[key] : undefined;
    var hadReward = Boolean(state.reflectionRewarded[key]);
    var complete = value.length >= 20;
    var rewardNow = complete && !hadReward;
    state.reflections[key] = value;
    if (!saveState()) {
      /* 失败回滚理解与奖励标记：不发 XP、不同步 legacy、不显示已记录 */
      if (previous === undefined) delete state.reflections[key];
      else state.reflections[key] = previous;
      updateReflectionUi(textarea, false);
      notify("理解表达未能保存：浏览器存储不可用或已满，请稍后重试");
      return;
    }
    if (rewardNow) {
      if (typeof window.addXP === "function" && window.addXP(4, "记录理解表达", "unified:reflection:" + key)) {
        state.reflectionRewarded[key] = true;
        if (!saveState()) delete state.reflectionRewarded[key];
      }
      if (typeof window.renderMe === "function") window.renderMe();
    }
    updateReflectionUi(textarea);
    refreshHomeSoon();
    notify(complete && !state.reflectionRewarded[key] ? "理解表达已保存；XP 暂未同步，再次保存可安全重试" : (complete ? "理解表达已保存" : "内容已保存；写满 20 字后记为已记录"));
  }

  function copyPlainText(text, successMessage, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        if (typeof onSuccess === "function" && onSuccess() === false) {
          notify("内容已复制，但复制记录未保存，请稍后重试");
          return;
        }
        notify(successMessage);
      }).catch(function () {
        fallbackCopyPlainText(text, successMessage, onSuccess);
      });
      return;
    }
    fallbackCopyPlainText(text, successMessage, onSuccess);
  }

  function fallbackCopyPlainText(text, successMessage, onSuccess) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy command rejected");
      if (typeof onSuccess === "function" && onSuccess() === false) {
        notify("内容已复制，但复制记录未保存，请稍后重试");
        textarea.remove();
        return;
      }
      notify(successMessage);
    } catch (error) {
      notify("复制失败，请手动选择理解表达");
    }
    textarea.remove();
  }

  function copyCurrentReflection() {
    var textarea = overlay.querySelector("textarea[data-reflection-key]");
    if (!textarea) return;
    var levelIndex = Number(textarea.dataset.levelIndex);
    var lessonIndex = Number(textarea.dataset.lessonIndex);
    var answer = textarea.value.trim();
    if (!answer) {
      notify("请先写下你的理解，再复制给 Agent");
      return;
    }
    var key = textarea.dataset.reflectionKey;
    var previous = Object.prototype.hasOwnProperty.call(state.reflections, key) ? state.reflections[key] : undefined;
    state.reflections[key] = answer;
    var persisted = saveState();
    if (!persisted) {
      /* 复制仍用本次输入的内容，但记录落盘失败：回滚状态，提示文案区分“已复制但记录未保存” */
      if (previous === undefined) delete state.reflections[key];
      else state.reflections[key] = previous;
      updateReflectionUi(textarea, false);
    }
    copyReflectionReviewPacket(levelIndex, lessonIndex, { answer: answer, recordFailed: !persisted });
  }

  function handleOverlayInput(event) {
    var reflection = event.target.closest("textarea[data-reflection-key]");
    if (reflection) {
      var rKey = reflection.dataset.reflectionKey;
      var rPrev = Object.prototype.hasOwnProperty.call(state.reflections, rKey) ? state.reflections[rKey] : undefined;
      state.reflections[rKey] = reflection.value;
      var ok = saveState();
      if (!ok) {
        if (rPrev === undefined) delete state.reflections[rKey];
        else state.reflections[rKey] = rPrev;
        notify("输入内容未能保存：浏览器存储不可用或已满");
      }
      updateReflectionUi(reflection, ok);
      refreshHomeSoon();
      return;
    }
    var textarea = event.target.closest("textarea[data-note-key]");
    if (!textarea) return;
    var nKey = textarea.dataset.noteKey;
    var nPrev = Object.prototype.hasOwnProperty.call(state.notes, nKey) ? state.notes[nKey] : undefined;
    state.notes[nKey] = textarea.value;
    if (!saveState()) {
      if (nPrev === undefined) delete state.notes[nKey];
      else state.notes[nKey] = nPrev;
      notify("输入内容未能保存：浏览器存储不可用或已满");
    }
    refreshHomeSoon();
  }

  function handleOverlayClick(event) {
    var button = event.target.closest("[data-ul-action]");
    if (!button || button.disabled) return;
    var action = button.dataset.ulAction;
    if (action === "close") closeOverlay();
    if (action === "library") { lessonReturnToQuestion = false; renderLibrary(); }
    if (action === "key-notes") renderKeyNotes();
    if (action === "training") renderTrainingHome();
    if (action === "wrong") renderWrongArchive();
    if (action === "level") {
      state.activeLevel = Number(button.dataset.level) || 0;
      persistOrWarn();
      refreshHomeSoon();
      if (activeView === "key-notes") renderKeyNotes({ action: "level", level: String(state.activeLevel) });
      else if (activeView === "wrong") renderWrongArchive();
      else if (activeView === "training" || activeView === "question" || activeView === "result") renderTrainingHome();
      else renderLibrary();
    }
    if (action === "lesson") renderLesson(Number(button.dataset.lesson));
    if (action === "goto-lesson") {
      lessonReturnToQuestion = Boolean(activeView === "question" && session && session.levelIndex === state.activeLevel);
      renderLesson(Number(button.dataset.lesson));
    }
    if (action === "resume-question") { lessonReturnToQuestion = false; renderQuestion(); }
    if (action === "lesson-prev") renderLesson(Number(button.dataset.lesson) - 1);
    if (action === "lesson-next") renderLesson(Number(button.dataset.lesson) + 1);
    if (action === "mark-read") markLessonRead(Number(button.dataset.lesson));
    if (action === "save-note") saveCurrentNote();
    if (action === "save-reflection") saveCurrentReflection();
    if (action === "copy-reflection") copyCurrentReflection();
    if (action === "start") startSession(button.dataset.mode || "normal");
    if (action === "answer") recordAnswer(Number(button.dataset.answer));
    if (action === "next-question") nextQuestion();
    if (action === "copy-review") copyReview();
    if (action === "review-filter") {
      reviewFilter = button.dataset.filter === "confirmed" ? "confirmed" : "pending";
      renderKeyNotes({ action: "review-filter", filter: reviewFilter });
    }
    if (action === "copy-review-packet") copyReflectionReviewPacket(Number(button.dataset.level), Number(button.dataset.lesson));
    if (action === "save-review-receipt") saveReflectionReviewReceipt(button);
    if (action === "view-doubts") renderDoubts();
    if (action === "copy-full-snapshot") {
      var snapshotHub = window.GOGOGO_PROGRESS_HUB;
      if (snapshotHub && typeof snapshotHub.copyFullAgentSnapshot === "function") snapshotHub.copyFullAgentSnapshot(button.dataset.ulPrompt || "review");
      else notify("完整学习快照模块未就绪，请刷新页面后重试");
    }
    if (action === "data-manager") {
      var dataHub = window.GOGOGO_PROGRESS_HUB;
      if (!dataHub || typeof dataHub.openDataManager !== "function") {
        notify("数据管理模块未就绪，请刷新页面后重试");
      } else {
        closeOverlay();
        window.setTimeout(function () { dataHub.openDataManager(); }, 360);
      }
    }
  }

  function notify(message) {
    var node = document.querySelector(".ul-toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "ul-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      node.setAttribute("aria-atomic", "true");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.hidden = true;
    }, 2600);
  }

  function homeLevelIndex() {
    var label = document.getElementById("pg-level-label");
    var match = String(label ? label.textContent : "").match(/第\s*(\d+)\s*关/);
    var index = match ? Number(match[1]) - 1 : state.activeLevel;
    return Math.max(0, Math.min(course.levels.length - 1, index));
  }

  function syncActiveLevelToHome() {
    var levelIndex = homeLevelIndex();
    if (state.activeLevel === levelIndex) return;
    state.activeLevel = levelIndex;
    persistOrWarn();
  }

  function renderArtifactArchive() {
    openOverlay("artifacts", "旧作存档");
    var artifacts = {};
    try {
      var raw = localStorage.getItem("gogogo_pixel_guild_v1");
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && isPlainRecord(parsed.artifacts)) artifacts = parsed.artifacts;
    } catch (error) {
      artifacts = {};
    }
    var entries = Object.keys(artifacts).filter(function (key) {
      var item = artifacts[key];
      return isPlainRecord(item) && (String(item.body || "").trim() || String(item.evidence || "").trim());
    });
    var listHtml = entries.length
      ? entries.map(function (key) {
          var item = artifacts[key];
          return '<section class="ul-artifact-card">' +
            '<h3>第 ' + esc(key) + ' 关旧作</h3>' +
            (String(item.body || "").trim() ? '<div><small>项目产物</small><p>' + esc(String(item.body)) + '</p></div>' : "") +
            (String(item.evidence || "").trim() ? '<div><small>证据与限制</small><p>' + esc(String(item.evidence)) + '</p></div>' : "") +
          '</section>';
        }).join("")
      : '<div class="ul-empty"><h3>没有旧作记录</h3><p>旧版作品门没有留下内容；新的学习证据请走书库、训练与我的复盘。</p></div>';
    content.innerHTML =
      pageHead("LEGACY ARCHIVE / READ ONLY", "旧作存档", "这里只读展示旧版“项目作品陈列门”保存的内容，不能编辑；新证据请走书库、训练与我的复盘。", "") +
      '<section class="ul-artifact-list">' + listHtml + '</section>' +
      '<footer class="ul-footer-action"><button class="ul-button" data-ul-action="training">进入本关训练</button></footer>';
  }

  function interceptLegacyActions(event) {
    var unified = event.target.closest("[data-ul-launch]");
    if (unified) {
      event.preventDefault();
      event.stopImmediatePropagation();
      syncActiveLevelToHome();
      if (unified.dataset.ulLaunch === "library") renderLibrary();
      else if (unified.dataset.ulLaunch === "key-notes") renderKeyNotes();
      else if (unified.dataset.ulLaunch === "wrong") renderWrongArchive();
      else renderTrainingHome();
      return;
    }
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;
    if (action !== "library" && action !== "workshop" && action !== "codex" && action !== "retest" && action !== "artifact") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    syncActiveLevelToHome();
    if (action === "library") renderLibrary();
    else if (action === "codex") renderWrongArchive();
    else if (action === "artifact") renderArtifactArchive();
    else renderTrainingHome();
  }

  function refreshHome() {
    document.querySelectorAll('[data-action="workshop"]').forEach(function (button) {
      var text = button.classList.contains("pg-station") ? "本关训练" : "训练";
      if (button.textContent.trim() !== text) button.textContent = text;
    });
    document.querySelectorAll('[data-action="codex"]').forEach(function (button) {
      var text = button.classList.contains("pg-station") ? "错题档案" : "错题";
      if (button.textContent.trim() !== text) button.textContent = text;
    });
    document.querySelectorAll('[data-action="key-notes"]').forEach(function (button) {
      var text = button.classList.contains("pg-station") ? "我的复盘" : "复盘";
      if (button.textContent.trim() !== text) button.textContent = text;
    });
    document.querySelectorAll('[data-action="retest"]').forEach(function (button) {
      var text = button.classList.contains("pg-station") ? "间隔复训" : "复训";
      if (button.textContent.trim() !== text) button.textContent = text;
    });
    document.querySelectorAll('[data-action="artifact"]').forEach(function (button) {
      var text = button.classList.contains("pg-station") ? "旧作存档" : "旧作";
      if (button.textContent.trim() !== text) button.textContent = text;
    });
    var mentor = document.getElementById("pg-mentor");
    if (mentor && mentor.textContent !== "学习顺序：书库输入并写自己的话，训练诊断，复盘处理真实理解与错误，72h 再验证。") {
      mentor.textContent = "学习顺序：书库输入并写自己的话，训练诊断，复盘处理真实理解与错误，72h 再验证。";
    }
    var gates = document.getElementById("pg-gates");
    if (!gates) return;
    var levelIndex = homeLevelIndex();
    var lessons = curriculumLessons(levelIndex);
    var read = readCount(levelIndex);
    var evidenceStrong = document.getElementById("pg-evidence-count");
    if (evidenceStrong && evidenceStrong.textContent !== read + "/" + lessons.length) {
      evidenceStrong.textContent = read + "/" + lessons.length;
    }
    if (evidenceStrong && evidenceStrong.closest("button")) {
      evidenceStrong.closest("button").setAttribute("aria-label", "课卡已读 " + read + "/" + lessons.length + "，打开课程书库");
    }
    var best = Number(state.best[levelIndex]) || 0;
    var wrong = wrongIds(levelIndex).length;
    var hasTrainingResult = isPlainRecord(state.lastResult[levelIndex]) && Number(state.lastResult[levelIndex].total) > 0;
    var reviewAttention = lessons.reduce(function (sum, lesson, index) {
      var status = reflectionReviewMeta(levelIndex, index).status;
      return sum + (status === "pending" || status === "needs-revision" || status === "insufficient" ? 1 : 0);
    }, 0);
    var signature = [levelIndex, read, lessons.length, reviewAttention, hasTrainingResult ? 1 : 0, best, wrong].join("-");
    var flow = document.getElementById("pg-mode-row");
    var threshold = passThreshold(levelIndex);
    var currentStep = read < lessons.length ? 0 : (!hasTrainingResult ? 1 : (wrong > 0 ? 2 : (reviewAttention > 0 ? 3 : (best < threshold ? 1 : 4))));
    var stepName = ["书库学习", "训练诊断", "错题复盘", "我的复盘", "间隔复训"][currentStep];
    var nextLevelIndex = levelIndex + 1;
    var nextLevelPreview = nextLevelIndex < course.levels.length
      ? "LEVEL " + String(nextLevelIndex + 1).padStart(2, "0") + " · " + levelName(nextLevelIndex)
      : "全路径终局 · 高级训练作品集";
    var eyebrow = document.querySelector(".pg-eyebrow");
    if (eyebrow && eyebrow.firstChild) eyebrow.firstChild.nodeValue = "当前关卡 · ";
    if (flow && (flow.dataset.ulSignature !== signature || !flow.querySelector(".ul-current-quest"))) {
      flow.dataset.ulSignature = signature;
      flow.setAttribute("aria-label", "当前学习步骤");
      flow.innerHTML =
        '<div class="ul-current-quest">' +
          '<span>CURRENT STEP · ' + String(currentStep + 1).padStart(2, "0") + '</span>' +
          '<strong>' + stepName + '</strong>' +
        '</div>';
    }
    gates.setAttribute("aria-label", "下一关预告");
    var nextAction = "workshop";
    var nextLabel = "间隔复训";
    if (currentStep === 0) {
      nextAction = "library";
      nextLabel = "继续书库 " + read + "/" + lessons.length;
    } else if (currentStep === 1) {
      nextAction = "workshop";
      nextLabel = "开始本关训练";
    } else if (currentStep === 2) {
      nextAction = "codex";
      nextLabel = "清理错题 " + wrong;
    } else if (currentStep === 3) {
      nextAction = "key-notes";
      nextLabel = "处理复盘 " + reviewAttention;
    }
    var primary = document.querySelector("[data-home-progress]");
    if (primary) {
      if (primary.dataset.action !== nextAction) primary.dataset.action = nextAction;
      if (primary.textContent !== nextLabel) primary.textContent = nextLabel;
      if (primary.getAttribute("aria-label") !== nextLabel) primary.setAttribute("aria-label", nextLabel);
    }
    if (gates.dataset.ulSignature === signature && gates.querySelector(".ul-next-level-preview")) return;
    gates.dataset.ulSignature = signature;
    gates.innerHTML =
      '<div class="ul-next-level-preview">' +
        '<span>NEXT LEVEL / 下一关预告</span>' +
        '<strong>' + esc(nextLevelPreview) + '</strong>' +
      '</div>';
  }

  function refreshHomeSoon() {
    if (homeRefreshQueued) return;
    homeRefreshQueued = true;
    window.requestAnimationFrame(function () {
      homeRefreshQueued = false;
      refreshHome();
    });
  }

  function init() {
    ensureOverlay();
    document.addEventListener("click", interceptLegacyActions, true);
    document.addEventListener("keydown", function (event) {
      var glossaryOverlay = document.querySelector(".gc-overlay");
      if (glossaryOverlay && !glossaryOverlay.hidden) return;
      if (event.key === "Escape" && overlay && !overlay.hidden) {
        event.preventDefault();
        closeOverlay();
        return;
      }
      trapOverlayFocus(event);
    });
    refreshHome();
    var root = document.getElementById("pg-app") || document.body;
    var observer = new MutationObserver(refreshHomeSoon);
    observer.observe(root, { childList: true, subtree: true });
    window.GOGOGO_UNIFIED_LEARNING = {
      version: VERSION,
      openLibrary: renderLibrary,
      openKeyNotes: function () { syncActiveLevelToHome(); renderKeyNotes(); },
      openReview: function () { syncActiveLevelToHome(); renderKeyNotes(); },
      openTraining: renderTrainingHome,
      openWrongArchive: renderWrongArchive,
      openArtifactArchive: renderArtifactArchive
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
