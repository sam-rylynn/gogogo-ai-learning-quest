(function () {
  "use strict";

  var curriculum = window.GOGOGO_DEEP_CURRICULUM;
  if (!curriculum || !curriculum.levels) return;

  function lesson(id, title, core, legacyIndex, body) {
    return {
      id: id,
      t: title,
      card: [title, core],
      legacyIndex: legacyIndex,
      body: body
    };
  }

  function choice(id, question, options, answer, explain, tag) {
    return {
      id: id,
      type: "choice",
      q: question,
      options: options,
      answer: answer,
      explain: explain,
      tag: tag
    };
  }

  function judge(id, question, correct, explain, tag) {
    return choice(id, question, ["正确", "错误"], correct ? 0 : 1, explain, tag);
  }

  function appendLessonDetails(id, details) {
    Object.keys(curriculum.levels).some(function (levelIndex) {
      var lessons = curriculum.levels[levelIndex];
      if (!Array.isArray(lessons)) return false;
      var target = lessons.filter(function (item) { return item.id === id; })[0];
      if (!target) return false;
      target.body += details;
      return true;
    });
  }

  var supplements = {
    "l1-task-spec": `
      <h2>5. 基础词汇逐个拆开</h2>
      <table class="ul-depth-table">
        <thead><tr><th>词汇</th><th>直白解释</th><th>容易混淆的地方</th></tr></thead>
        <tbody>
          <tr><td>Prompt 提示</td><td>这一次交给模型的输入</td><td>它可以承载任务规格，但不天然等于完整规格</td></tr>
          <tr><td>Instruction 指令</td><td>要求系统执行的动作</td><td>“查余额”是指令，不包含数据与验收边界</td></tr>
          <tr><td>Requirement 需求</td><td>用户或业务需要什么</td><td>需求描述问题，未必已经给出实现办法</td></tr>
          <tr><td>Specification 规格</td><td>对行为、输入、输出和边界的精确定义</td><td>规格必须能被开发和测试共同使用</td></tr>
          <tr><td>Acceptance Criteria 验收标准</td><td>可以观察和判定的通过条件</td><td>“效果好”不是标准，“字段完整率 100%”才是</td></tr>
        </tbody>
      </table>
      <h2>6. 再看两个不同场景</h2>
      <div class="exm"><b>宠物过敏咨询：</b>不能只写“判断狗狗是否过敏”。还要定义用户提供哪些症状、资料来源是什么、哪些情况必须就医、不得给出什么医疗承诺，以及输出如何区分一般建议与紧急风险。</div>
      <div class="exm"><b>商业项目筛选：</b>不能只写“推荐好项目”。要说明目标城市、预算、业态限制、证据来源、评分维度、未知信息标签，以及“推荐入库”所需的最低证据门槛。</div>
      <h2>7. 规格从粗到细的三层</h2>
      <ol>
        <li><b>业务规格：</b>为什么做、谁受益、什么结果有价值。</li>
        <li><b>产品规格：</b>用户流程、页面状态、权限与异常体验。</li>
        <li><b>技术规格：</b>接口、字段、状态码、日志、测试与性能门槛。</li>
      </ol>
      <p>零基础阶段先学会写清业务与产品规格，再逐步补技术规格。不要一上来用技术词掩盖需求没有想清楚。</p>
    `,
    "l1-system-roles": `
      <h2>6. 概率系统和确定性系统</h2>
      <p><b>概率性（Probabilistic）</b>表示同一输入可能得到不同但合理的输出，LLM 属于这一类。<b>确定性（Deterministic）</b>表示相同条件按固定规则得到可预测结果，余额加减、权限校验和字段格式检查通常应由确定性程序承担。</p>
      <div class="exm"><b>适合概率系统：</b>把已验证的退款政策解释得更易懂。<br><b>适合确定性系统：</b>判断当前用户 ID 是否等于账户所属用户 ID。</div>
      <h2>7. Orchestration 是什么？</h2>
      <p><b>编排（Orchestration）</b>是安排各角色先后顺序、传递数据并处理失败的控制流程。模型可以参与选择工具，但生产系统通常还需要程序约束允许调用的工具、参数和最大次数。</p>
      <div class="exm"><b>宠物营养问答：</b>LLM 提取宠物年龄与症状 → 规则先判断是否存在紧急就医信号 → RAG 检索已审核营养资料 → 工具计算推荐热量范围 → LLM 解释结果 → 高风险情况交给兽医。</div>
      <h2>8. 角色边界不是固定不变</h2>
      <p>同一个知识点在不同风险等级下可能采用不同分工。普通商品说明可以由 RAG 加 LLM 完成；涉及药物剂量时，即使检索到资料，也应触发更严格规则和人工专业审核。</p>
    `,
    "l1-evals-basics": `
      <h2>6. Test、Eval 和 Review 的区别</h2>
      <ul>
        <li><b>Test 测试：</b>范围最广，既可以检查普通程序，也可以检查 AI 系统。</li>
        <li><b>Eval 评估：</b>更强调用样本与评分方法衡量 AI 行为质量。</li>
        <li><b>Review 审核：</b>通常指人或系统对结果进行检查，可能是一次性的，也可能是评估流程中的一个环节。</li>
      </ul>
      <h2>7. 四种常见 Grader</h2>
      <table class="ul-depth-table">
        <thead><tr><th>评分方式</th><th>适合内容</th><th>限制</th></tr></thead>
        <tbody>
          <tr><td>Exact Match 精确匹配</td><td>状态码、金额、分类标签</td><td>不适合允许多种表达的长文本</td></tr>
          <tr><td>Rule-based 规则评分</td><td>字段、格式、关键词禁令</td><td>复杂语义可能覆盖不足</td></tr>
          <tr><td>Human Review 人工评分</td><td>细腻体验、专业判断</td><td>成本高，评分者可能不一致</td></tr>
          <tr><td>Model Grader 模型评分</td><td>大规模初筛、语言质量</td><td>自身也会出错，必须校准</td></tr>
        </tbody>
      </table>
      <div class="exm"><b>组合案例：</b>余额金额用程序精确匹配；是否泄露敏感信息用规则扫描；解释是否容易理解用带量表的人工抽检。不要强迫一种评分器解决所有问题。</div>
    `,
    "l1-hard-soft-metrics": `
      <h2>5. 严重度、发生率和风险不是同一个词</h2>
      <ul>
        <li><b>严重度 Severity：</b>错误一旦发生，后果有多大。</li>
        <li><b>发生率 Frequency：</b>错误出现得多不多。</li>
        <li><b>风险 Risk：</b>通常综合考虑发生可能性和后果。</li>
      </ul>
      <p>一次大额越权转账的发生率可能很低，但严重度极高，仍然需要设置硬性阻断。标点不统一可能经常发生，但后果很小，通常属于体验优化。</p>
      <h2>6. 三种判分结果</h2>
      <ol>
        <li><b>Pass：</b>满足所有硬门槛与最低体验要求。</li>
        <li><b>Fail：</b>发生硬性失败或关键指标低于阈值。</li>
        <li><b>Needs Review：</b>证据冲突、标准无法自动判断，需要人工复核。</li>
      </ol>
      <div class="exm"><b>内容审核案例：</b>明确包含违禁承诺时直接 Fail；完全合规则 Pass；隐喻表达是否构成承诺无法确定时进入 Needs Review，而不是强行给高低分。</div>
    `,
    "l1-source-of-truth": `
      <h2>6. 原始数据、派生数据、缓存和日志</h2>
      <table class="ul-depth-table">
        <thead><tr><th>类型</th><th>含义</th><th>能否直接当最终事实</th></tr></thead>
        <tbody>
          <tr><td>Primary Data 原始权威数据</td><td>由负责该事实的系统维护</td><td>通常可以，但仍要检查权限与时效</td></tr>
          <tr><td>Derived Data 派生数据</td><td>根据原始数据计算得到</td><td>要知道公式、版本和更新时间</td></tr>
          <tr><td>Cache 缓存</td><td>为了速度保存的临时副本</td><td>可能过期，关键场景需核对新鲜度</td></tr>
          <tr><td>Log 日志</td><td>记录系统发生过什么</td><td>适合追查，不一定代表当前状态</td></tr>
        </tbody>
      </table>
      <div class="exm"><b>库存案例：</b>仓库系统是当前库存事实源；搜索页上的“有货”可能来自 10 分钟前缓存；订单日志只能证明某次下单发生过，不能单独证明现在还有货。</div>
      <h2>7. 数据新鲜度 Freshness</h2>
      <p>对实时性高的数据，要同时返回 <code>updated_at</code> 或版本号。昨天的正确余额不是今天的正确余额。事实不仅要“来自正确系统”，还要“足够新”。</p>
    `,
    "l1-metrics-thresholds": `
      <h2>6. 分母写错，指标就会骗人</h2>
      <p>任何比例都要问清分子和分母。例如“成功率 95%”可能是 95/100，也可能排除了 40 次超时后得到 57/60。后者如果不披露排除条件，会严重误导。</p>
      <div class="exm"><b>完整写法：</b>在 100 条固定样本中，90 条正常返回、5 条安全拒绝、5 条超时；其中 95 条符合各自预期，所以任务成功率为 95/100，而不是只在有响应的 95 条里算 100%。</div>
      <h2>7. Leading 与 Lagging 指标</h2>
      <ul>
        <li><b>领先指标（Leading Metric）：</b>较早出现，可帮助预警，例如工具调用失败率。</li>
        <li><b>滞后指标（Lagging Metric）：</b>结果发生后才看到，例如用户投诉率或真实资金损失。</li>
      </ul>
      <p>上线监控不能只等投诉。应同时观察调用错误、字段缺失、拒绝率和人工升级量等早期信号。</p>
    `,
    "l1-eval-set": `
      <h2>6. 一条 Test Case 的完整格式</h2>
      <pre><code>case_id: balance_timeout_001
input: 已登录会员查询余额
setup: 余额服务超过 5 秒未响应
expected: 不展示金额，提示暂时无法确认
grader: 检查页面不得出现数字余额
severity: hard_failure</code></pre>
      <p><b>Setup</b>描述测试前置状态；没有它，同一句输入可能无法复现同一结果。<b>Case ID</b>让错误可以被追踪、讨论和加入回归集。</p>
      <h2>7. Coverage 覆盖率不是只有一个百分比</h2>
      <p>应建立覆盖矩阵：用户身份、数据状态、接口状态、输入表达和风险类型分别有哪些样本。100 条都在测试正常会员余额，并不能说明对权限攻击有覆盖。</p>
      <div class="exm"><b>表达变化案例：</b>“我余额多少”“我还有多少钱”“账户里还有米吗”可能是同一意图。评估集应包含自然表达变化，但不能只靠换同义词堆数量。</div>
    `,
    "l1-capstone": `
      <h2>6. Traceability：每个需求都能追到证据</h2>
      <p><b>可追踪性（Traceability）</b>表示需求、系统实现、测试样本和上线指标之间可以互相对应。</p>
      <table class="ul-depth-table">
        <thead><tr><th>需求</th><th>实现</th><th>评估证据</th></tr></thead>
        <tbody>
          <tr><td>未授权不得返回余额</td><td>鉴权中间件 + 字段拦截</td><td>未登录、跨账户和过期令牌样本均不泄露金额</td></tr>
          <tr><td>超时不得猜测</td><td>5 秒超时 + 失败闭合页面</td><td>超时样本中数字余额出现次数为 0</td></tr>
          <tr><td>结果必须包含更新时间</td><td>响应字段校验</td><td>正常样本字段完整率 100%</td></tr>
        </tbody>
      </table>
      <div class="exm"><b>为什么重要：</b>如果产品经理新增“显示冻结余额”，可追踪表会提醒开发补字段、测试补样本、监控补指标，而不是只改一段页面文字。</div>
    `,
    "l2-python-start": `
      <h2>6. 解释器、语句、表达式和函数</h2>
      <ul>
        <li><b>Interpreter 解释器：</b>读取并执行 Python 代码的程序。</li>
        <li><b>Statement 语句：</b>一条要执行的完整指令，例如 <code>balance = 680</code>。</li>
        <li><b>Expression 表达式：</b>计算后能得到一个值的代码，例如 <code>balance + 20</code>。</li>
        <li><b>Function 函数：</b>被命名的一组可重复步骤，例如 <code>print</code>。</li>
        <li><b>Argument 参数：</b>调用函数时放进括号的数据，例如 <code>print(balance)</code> 里的 balance。</li>
        <li><b>Return Value 返回值：</b>函数处理后交回的结果；print 主要产生显示效果，不是把余额改掉。</li>
      </ul>
      <div class="exm"><b>咖啡机类比：</b>函数像咖啡机，参数像投入的咖啡豆和杯型，返回值像制作好的咖啡。调用函数不等于修改所有输入数据。</div>
    `,
    "l2-python-types": `
      <h2>6. 类型转换 Conversion</h2>
      <pre><code>text_balance = "680"
number_balance = int(text_balance)
total = number_balance + 20</code></pre>
      <p><code>int(...)</code> 尝试把文字转换为整数。但 <code>int("六百八十")</code> 会失败，所以转换也必须进入错误处理。</p>
      <h2>7. 等于、不等于和大小比较</h2>
      <ul>
        <li><code>=</code>：赋值，把右侧保存到左侧变量。</li>
        <li><code>==</code>：比较两边是否相等。</li>
        <li><code>!=</code>：比较两边是否不相等。</li>
        <li><code>&gt;</code>、<code>&lt;</code>：比较大小。</li>
      </ul>
      <div class="exm"><code>balance = 680</code> 是保存数据；<code>balance == 680</code> 才是在提出“它是否等于 680”的判断，结果为 True 或 False。</div>
    `,
    "l2-python-containers": `
      <h2>6. Index、Key 与可变性</h2>
      <p><b>Index 索引</b>是按位置取 list 项目，Python 通常从 0 开始；<b>Key 键</b>是按名称取 dict 的值。索引回答“第几个”，键回答“哪个字段”。</p>
      <pre><code>first_transaction = transactions[0]
current_balance = member["balance"]</code></pre>
      <p><b>Mutable 可变</b>表示创建后内容还能修改。list 和 dict 通常可变；tuple 通常用于表达不应被随意改变的组合。可变不等于可以跳过业务权限。</p>
      <div class="exm"><b>购物车案例：</b>购物车商品列表用 list，因为有顺序且会增删；单件商品的名称、单价、数量用 dict；固定经纬度可用 tuple；已选标签去重可用 set。</div>
    `,
    "l2-json": `
      <h2>6. 转义字符和编码</h2>
      <p>如果字符串本身包含双引号，需要用反斜杠转义，例如 <code>{"message": "他说\\"你好\\""}</code>。换行常写作 <code>\\n</code>。</p>
      <p><b>Encoding 编码</b>决定文字怎样转换成字节。JSON 通常使用 UTF-8；如果客户端和服务器编码不一致，中文可能显示成乱码。</p>
      <h2>7. JSON 只是格式，不是数据库</h2>
      <p>JSON 可以保存在文件、通过网络传输或作为 API 响应，但它本身不负责查询、权限、并发或持久化。不要把“一段 JSON”误称为“一个数据库”。</p>
      <div class="exm"><b>嵌套案例：</b><code>{"member": {"name": "豆豆"}, "transactions": [{"amount": -80}]}</code> 中，member 是对象，transactions 是数组，数组里又包含对象。</div>
    `,
    "l2-json-python": `
      <h2>5. Serialization 与 Deserialization</h2>
      <ul>
        <li><b>序列化（Serialization）：</b>把程序里的 dict、list 等转换成可存储或传输的 JSON 文本。</li>
        <li><b>反序列化（Deserialization）：</b>把 JSON 文本恢复成程序可操作的数据。</li>
      </ul>
      <pre><code>json_text = json.dumps(data, ensure_ascii=False)
python_data = json.loads(json_text)</code></pre>
      <p><code>dumps</code> 是 Python 到 JSON，<code>loads</code> 是 JSON 到 Python。名字里的 s 可以先记成 string。</p>
      <div class="exm"><b>失败案例：</b>服务端意外返回 HTML 错误页，客户端仍调用 <code>response.json()</code>，就会解析失败。因此解析前还要检查状态码和 Content-Type。</div>
    `,
    "l2-api-basics": `
      <h2>6. API、SDK 和 Library 的区别</h2>
      <ul>
        <li><b>API：</b>系统开放的能力契约。</li>
        <li><b>SDK（Software Development Kit）：</b>服务提供方为某种语言准备的一套开发工具，内部通常帮助你调用 API。</li>
        <li><b>Library 库：</b>可复用代码集合，例如 Python 的 requests。</li>
      </ul>
      <h2>7. 版本、分页和速率限制</h2>
      <p><b>API Version</b>表示契约版本，例如 <code>/v1/</code>；升级版本可能改变字段。<b>Pagination 分页</b>把大量结果分批返回。<b>Rate Limit 速率限制</b>限制单位时间内的请求数量。</p>
      <div class="exm"><b>交易记录案例：</b>余额端点返回一个账户摘要；交易列表端点可能每页返回 20 条，并附带下一页游标。二者不能当成同一种响应结构处理。</div>
    `,
    "l2-http": `
      <h2>6. URL 也有组成部分</h2>
      <pre><code>https://api.example.com/v1/members/123/balance?currency=CNY</code></pre>
      <ul>
        <li><code>https</code>：协议。</li>
        <li><code>api.example.com</code>：主机名。</li>
        <li><code>/v1/members/123/balance</code>：路径。</li>
        <li><code>currency=CNY</code>：查询参数。</li>
      </ul>
      <p>HTTPS 表示 HTTP 通信经过加密保护，但不代表对方业务一定可信，也不替代登录和权限控制。</p>
      <h2>7. Header、Query 和 Body 怎样选？</h2>
      <div class="exm">身份令牌通常放 Header；筛选条件可放 Query；创建订单的结构化内容常放 Body。敏感密钥不应放进 URL，因为 URL 更容易进入浏览历史与日志。</div>
    `,
    "l2-http-status": `
      <h2>5. Error Object 错误对象</h2>
      <pre><code>{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account is temporarily locked",
    "request_id": "req_123"
  }
}</code></pre>
      <p><b>Error Code</b>供程序稳定判断；<b>Message</b>供人阅读；<b>Request ID</b>帮助服务端在日志中追踪这一次请求。程序不应依赖一段随时可能改写的中文 message 来判断错误类型。</p>
      <h2>6. Retryable 与 Non-retryable</h2>
      <p>503、部分 429 和网络瞬断可能适合按策略重试；400 参数错误、401 凭证失效、403 无权限通常需要修正条件，原样重试没有意义。</p>
    `,
    "l2-timeout-idempotency": `
      <h2>6. 先解释“幂”是什么</h2>
      <p>数学里的<b>幂（Power）</b>表示同一个数重复相乘，例如 2 的 3 次幂写作 2³，意思是 2 × 2 × 2。这里的“次”是在问一个运算被重复应用多少次。</p>
      <p><b>幂等（Idempotent）</b>借用了“重复运算”的概念，但它不是在算乘方。它描述一种性质：同一个操作执行一次和执行多次，对系统最终状态产生相同效果。数学上常写成 <code>f(f(x)) = f(x)</code>。</p>
      <div class="exm"><b>幂等操作：</b>把会员状态“设置为已停用”。执行一次是已停用，再执行十次仍然只是已停用。<br><b>非幂等操作：</b>“余额增加 100 元”。执行一次加 100，执行两次加 200，最终状态不同。</div>
      <h2>7. 为什么还需要“键”？</h2>
      <p><b>Key 键</b>是一次业务动作的唯一标识。服务器不能仅凭“金额相同”判断两次请求是否是同一笔，因为用户可能真的连续充值两次 100 元。</p>
      <ol>
        <li>客户端开始一次充值动作，生成唯一幂等键 A。</li>
        <li>第一次请求使用 A，服务器创建订单并保存 A 与结果。</li>
        <li>客户端超时后重试，必须继续使用同一个 A。</li>
        <li>服务器看到 A 已处理，返回原结果，不再创建第二单。</li>
        <li>用户主动发起另一笔充值时，生成新的幂等键 B。</li>
      </ol>
      <div class="exm"><b>错误案例：</b>每次重试都生成新键，服务器会把它们视为不同业务动作，幂等保护就失效。<br><b>查询案例：</b>GET 余额通常天然接近幂等，因为重复读取不会主动改变余额；但每次读取到的值仍可能因真实交易变化。</div>
      <h2>8. 幂等不等于“请求只发送一次”</h2>
      <p>网络请求仍可能发送多次。幂等机制保证的是相同业务意图不会被重复执行，而不是阻止所有重复流量。服务器仍需保存键、核对请求内容并设置合理有效期。</p>
    `,
    "l2-validation-security": `
      <h2>6. Trust Boundary 信任边界</h2>
      <p><b>信任边界</b>是数据从一个安全责任范围进入另一个范围的位置。用户输入、LLM 输出、第三方 API 响应、上传文件和数据库旧数据在进入关键流程时都应被视为需要验证。</p>
      <h2>7. Validation 和 Sanitization</h2>
      <ul>
        <li><b>Validation 验证：</b>判断数据是否满足规则，例如金额必须为数字且大于 0。</li>
        <li><b>Sanitization 清理：</b>移除或转义危险内容，例如展示用户文字前处理恶意脚本。</li>
      </ul>
      <div class="exm"><b>模型输出案例：</b>LLM 返回 <code>{"amount": "一百元"}</code>。即使语义能看懂，资金接口也应拒绝，因为 amount 没有满足数值 Schema。</div>
    `,
    "l2-python-api": `
      <h2>5. try、except 和 raise</h2>
      <ul>
        <li><b>try：</b>放可能失败的代码。</li>
        <li><b>except：</b>指定某类失败发生后怎么处理。</li>
        <li><b>raise：</b>主动抛出错误，阻止无效数据继续流动。</li>
      </ul>
      <p>错误处理不是把所有异常藏起来。如果统一写成“什么都不做”，系统会失去可观察性。应向用户提供安全提示，同时给日志保留请求 ID 与错误类型。</p>
      <h2>6. Import、Package 和 Dependency</h2>
      <p><b>Package 包</b>是一组可安装的 Python 代码；<b>Dependency 依赖</b>是当前项目需要的外部包；<code>import requests</code> 表示在代码中使用已安装的 requests 包。</p>
      <div class="exm"><b>完整链路：</b>用户输入会员 ID → Python 验证格式 → requests 发送 HTTP → 服务端返回 JSON → Python 解析并验证 → 页面展示，任何一步失败都进入对应分支。</div>
    `,
    "l2-git": `
      <h2>6. Git、GitHub、Repository 和 Commit 分别是什么？</h2>
      <table class="ul-depth-table">
        <thead><tr><th>词</th><th>它是什么</th><th>它不是什么</th></tr></thead>
        <tbody>
          <tr><td>Git</td><td>安装在电脑上的版本控制工具</td><td>不是网站，也不是某一次保存</td></tr>
          <tr><td>GitHub</td><td>托管 Git 仓库并支持协作的网站服务</td><td>不是 Git 本身</td></tr>
          <tr><td>Repository 仓库</td><td>项目文件与版本历史的集合，简称 repo</td><td>不只是一个普通文件夹</td></tr>
          <tr><td>Commit 提交</td><td>仓库历史中的一个有说明的版本快照</td><td>不是“把代码交给领导”，也不自动上传网络</td></tr>
          <tr><td>Branch 分支</td><td>从某个版本延伸出的独立工作线</td><td>不是文件副本的随意命名</td></tr>
        </tbody>
      </table>
      <h2>7. 从修改到 Commit 经过四个区域</h2>
      <ol>
        <li><b>Working Tree 工作区：</b>你正在编辑的真实文件。</li>
        <li><b>Staging Area 暂存区：</b>你用 <code>git add</code> 选中、准备纳入下一次提交的变化。</li>
        <li><b>Local Repository 本地仓库：</b><code>git commit</code> 后保存的版本历史。</li>
        <li><b>Remote Repository 远程仓库：</b><code>git push</code> 后同步到 GitHub 等远端。</li>
      </ol>
      <div class="exm"><b>为什么需要暂存区：</b>你同时改了“余额超时处理”和“首页颜色”。可以只 add 超时相关文件，先形成一个功能明确的 Commit；视觉变化稍后单独提交。</div>
      <h2>8. “好的 Commit”到底是什么意思？</h2>
      <p>好的 Commit 不是“代码写得完美”，而是一个<b>目的单一、范围可理解、能够被独立审查和回退</b>的版本单位。</p>
      <table class="ul-depth-table">
        <thead><tr><th>不好的提交</th><th>问题</th><th>更好的拆法</th></tr></thead>
        <tbody>
          <tr><td><code>update</code></td><td>看不出为什么改</td><td><code>Handle balance API timeout</code></td></tr>
          <tr><td>同时改超时、字体、课程文案</td><td>三个目的混在一起，难审查和回退</td><td>拆成三个 Commit</td></tr>
          <tr><td>只提交一半功能且页面无法运行</td><td>这个版本不是完整检查点</td><td>补齐同一目的所需文件再提交</td></tr>
        </tbody>
      </table>
      <h2>9. 逐步示例：修复余额超时</h2>
      <pre><code>git status
git diff
git add balance-client.py balance-client.test.py
git diff --staged
git commit -m "Handle balance API timeout"</code></pre>
      <ol>
        <li>status 确认有哪些文件被修改。</li>
        <li>diff 阅读尚未暂存的具体变化。</li>
        <li>add 只选择这次超时修复相关代码与测试。</li>
        <li><code>git diff --staged</code> 再看即将进入 Commit 的内容。</li>
        <li>commit 创建本地版本，并用动词说明它完成了什么。</li>
      </ol>
      <h2>10. Commit Message 怎样写？</h2>
      <p>入门时先用“动词 + 对象 + 目的”即可，例如 <code>Add balance field validation</code>、<code>Prevent duplicate recharge requests</code>、<code>Explain Python dict before quiz</code>。重点是让未来的你看到历史时能理解变化意图。</p>
      <div class="ul-checkpoint"><b>重新自检：</b>Git 是工具，Commit 是这个工具创建的一次版本记录，GitHub 是可以存放并协作管理仓库的服务。三者不能互换。</div>
    `
  };

  Object.keys(supplements).forEach(function (id) {
    appendLessonDetails(id, supplements[id]);
  });

  var levelThree = [
    lesson(
      "l3-ai-ml-map",
      "AI、机器学习与深度学习：先看完整地图",
      "AI 是让机器完成智能任务的总领域；机器学习让系统从数据中学习规律；深度学习是使用多层神经网络的一类机器学习。",
      null,
      `
        <div class="ul-depth-intro"><span>从最大概念开始</span><p>先分清范围，后面出现模型、训练和神经网络时才不会混成一个词。</p></div>
        <h2>1. 三层包含关系</h2>
        <ul>
          <li><b>人工智能（Artificial Intelligence, AI）：</b>让机器表现出理解、判断、规划、生成等能力的总领域。</li>
          <li><b>机器学习（Machine Learning, ML）：</b>不把每条规则全部手写，而是让算法从数据中找到模式。</li>
          <li><b>深度学习（Deep Learning, DL）：</b>使用多层神经网络学习复杂模式，是机器学习的一部分。</li>
        </ul>
        <p>关系是：深度学习属于机器学习，机器学习属于人工智能。不是所有 AI 都必须用机器学习，早期专家系统可以主要依赖人工规则。</p>
        <h2>2. 规则程序与机器学习</h2>
        <table class="ul-depth-table"><thead><tr><th>方式</th><th>规则从哪里来</th><th>适合场景</th></tr></thead><tbody>
          <tr><td>Rule-based 规则程序</td><td>人明确写出</td><td>年龄必须大于 18、金额不能小于 0</td></tr>
          <tr><td>Machine Learning</td><td>算法从样本中学习</td><td>根据大量行为预测用户流失概率</td></tr>
        </tbody></table>
        <h2>3. 什么时候不需要 ML？</h2>
        <p>如果规则清楚、变化少、必须百分之百可解释，就优先用普通程序。例如计算余额总和、检查身份证格式、执行固定权限规则。不能因为“AI 更高级”就把确定性问题变成概率问题。</p>
        <h2>4. 两个对照案例</h2>
        <div class="exm"><b>不用 ML：</b>会员等级满 1000 积分升级，规则明确。<br><b>适合 ML：</b>根据浏览、复购、客诉等几十个信号预测未来 30 天是否流失，人工很难写完全部组合规则。</div>
        <div class="ul-checkpoint"><b>自检：</b>“检查余额是否为负数”和“预测谁可能停止复购”，哪一个优先用规则，哪一个可能用 ML？</div>
      `
    ),
    lesson(
      "l3-data-language",
      "数据的语言：样本、特征、标签与数据集",
      "样本是一条观察记录，特征是提供给模型的输入信息，标签是希望模型预测的目标，数据集是许多样本的集合。",
      null,
      `
        <div class="ul-depth-intro"><span>先会读一张数据表</span><p>机器学习术语多数可以映射到一张普通表格。</p></div>
        <h2>1. 四个核心词</h2>
        <table class="ul-depth-table"><thead><tr><th>词</th><th>表格直觉</th><th>会员流失例子</th></tr></thead><tbody>
          <tr><td>Sample 样本</td><td>一行记录</td><td>某一位会员的一次观察</td></tr>
          <tr><td>Feature 特征</td><td>输入列</td><td>近 30 天访问次数、客单价、投诉次数</td></tr>
          <tr><td>Label 标签</td><td>要预测的目标列</td><td>未来 30 天是否流失</td></tr>
          <tr><td>Dataset 数据集</td><td>整张或多张相关表</td><td>过去两年所有符合条件的会员样本</td></tr>
        </tbody></table>
        <h2>2. 特征不是“越多越好”</h2>
        <p>特征要在预测时可取得、与任务相关、来源合法。预测未来流失时不能使用“未来是否已经流失”这种答案本身，也不能使用只有结果发生后才产生的数据。</p>
        <h2>3. 标签从哪里来？</h2>
        <p>标签可能来自历史事实、人工标注或业务规则。例如“未来 30 天无任何购买”可定义为流失标签。标签定义一旦变化，模型学习的任务也会变化。</p>
        <h2>4. Label Leakage 标签泄漏</h2>
        <div class="exm">用“账户已注销时间”作为预测流失的特征，会让离线分数异常高，因为这个字段几乎直接暴露了答案；真实预测发生在注销之前，根本拿不到它。</div>
        <h2>5. 数据类型</h2>
        <p>特征可以是数值、类别、文本、图像或时间序列。类别“城市=杭州”不能直接理解为比“城市=北京”更大，需要合适编码方式。</p>
        <div class="ul-checkpoint"><b>自检：</b>预测“会员是否会流失”时，最近购买次数是什么？是否流失是什么？</div>
      `
    ),
    lesson(
      "l3-learning-types",
      "监督、无监督与自监督：模型怎样获得学习信号",
      "监督学习使用输入与标签学习预测，无监督学习在没有目标标签时发现结构，自监督学习从数据本身构造学习任务。",
      null,
      `
        <div class="ul-depth-intro"><span>学习方式看“答案从哪里来”</span><p>不是看算法名字，而是看训练时有没有明确目标信号。</p></div>
        <h2>1. Supervised Learning 监督学习</h2>
        <p>每个训练样本包含输入和正确目标，模型学习二者映射。分类与回归都常属于监督学习。</p>
        <div class="exm">输入会员历史行为，标签是“未来是否流失”；输入房屋信息，标签是成交价格。</div>
        <h2>2. Unsupervised Learning 无监督学习</h2>
        <p>没有预先给出的目标标签，算法尝试发现数据结构。典型任务是<b>聚类（Clustering）</b>和降维。</p>
        <div class="exm">根据购买频率、品类偏好和价格敏感度自动发现不同会员群组，但“高价值客户”这个业务名称仍需人来解释。</div>
        <h2>3. Self-supervised Learning 自监督学习</h2>
        <p>从原始数据自身构造预测目标，例如遮住一句话中的部分词，让模型预测被遮住内容。大语言模型预训练大量使用自监督信号。</p>
        <h2>4. Reinforcement Learning 强化学习</h2>
        <p>系统通过动作、环境反馈和奖励学习策略，例如游戏智能体。它与普通分类任务不同，不是每一步都有固定标签。</p>
        <h2>5. 无监督不等于“没有人负责”</h2>
        <p>聚类结果仍需检查稳定性、可解释性和业务价值。模型发现的群组不天然等于真实人群本质，更不能自动变成歧视性规则。</p>
        <div class="ul-checkpoint"><b>自检：</b>有“是否流失”标签时属于哪类学习？没有标签、只想发现自然群组时属于哪类？</div>
      `
    ),
    lesson(
      "l3-classification-regression",
      "分类与回归：预测类别还是连续数字",
      "分类输出离散类别或类别概率，回归输出连续数值；同一业务问题的定义不同，任务类型也可能改变。",
      2,
      `
        <div class="ul-depth-intro"><span>看输出，不看输入</span><p>输入都可以包含年龄、金额和文字，关键是模型最终要预测什么。</p></div>
        <h2>1. Classification 分类</h2>
        <p>输出一个或多个类别，例如会流失/不会流失、猫/狗/兔。模型常先输出每个类别的概率，再由阈值转成最终类别。</p>
        <h2>2. Regression 回归</h2>
        <p>输出连续数值，例如下月销量 12,580、预计客单价 126.4、日粮建议克数 235。</p>
        <h2>3. Binary、Multi-class 与 Multi-label</h2>
        <ul>
          <li><b>二分类：</b>两个互斥类别，如是否流失。</li>
          <li><b>多分类：</b>多个类别选一个，如图片是猫、狗还是兔。</li>
          <li><b>多标签：</b>可同时命中多个标签，如内容同时涉及“宠物营养”和“过敏风险”。</li>
        </ul>
        <h2>4. 同一问题可有不同定义</h2>
        <div class="exm">“预测客户价值”可以定义为高/中/低三类，这是分类；也可以预测未来 90 天消费金额，这是回归。先定义业务输出，再选择任务类型。</div>
        <h2>5. 概率不是承诺</h2>
        <p>模型说流失概率 0.82，不代表用户必然流失。概率需要经过校准，并结合业务阈值决定是否触发行动。</p>
        <div class="ul-checkpoint"><b>自检：</b>预测“是否购买”和“预计购买金额”分别属于什么任务？</div>
      `
    ),
    lesson(
      "l3-workflow",
      "机器学习项目流程：从业务问题到可用系统",
      "机器学习项目从目标定义、数据准备、基线、训练、离线评估，到上线监控与迭代，模型训练只是其中一步。",
      null,
      `
        <div class="ul-depth-intro"><span>不要从选算法开始</span><p>先确认问题值得预测、预测结果能触发行动、数据在预测时真实可得。</p></div>
        <h2>1. 七个基本阶段</h2>
        <ol>
          <li><b>Problem Framing 问题定义：</b>预测什么、给谁用、提前多久、错一次代价是什么。</li>
          <li><b>Data Collection 数据收集：</b>确定来源、权限、时间范围与标签。</li>
          <li><b>Data Preparation 数据准备：</b>清洗、去重、处理缺失并构造特征。</li>
          <li><b>Baseline 基线：</b>建立最简单参照。</li>
          <li><b>Training 训练：</b>让算法从训练数据调整参数。</li>
          <li><b>Evaluation 评估：</b>在未用于训练的数据上衡量表现与风险。</li>
          <li><b>Deployment and Monitoring 部署监控：</b>把预测接入流程并持续观察。</li>
        </ol>
        <h2>2. 预测必须连接行动</h2>
        <div class="exm">模型预测某会员可能流失后，业务动作可能是发出关怀问卷，而不是自动发大额优惠券。动作还要经过预算、频率和公平性规则。</div>
        <h2>3. Offline 与 Online</h2>
        <p><b>离线评估</b>在历史数据上检查模型；<b>在线评估</b>观察真实用户环境中的效果。离线准确率提高，不代表实际复购一定增加。</p>
        <h2>4. 机器学习是系统，不只是模型文件</h2>
        <p>数据管道、特征计算、调用接口、监控、人工流程和回退机制都会影响最终效果。模型分数只是系统证据的一部分。</p>
        <div class="ul-checkpoint"><b>自检：</b>如果模型给出流失概率，却没有任何可执行业务动作，这个项目缺少哪一层价值闭环？</div>
      `
    ),
    lesson(
      "l3-data-split",
      "三套卷子：训练集、验证集与测试集",
      "训练集用于学习参数，验证集用于选择方案和调参，测试集用于最后估计泛化表现；时间和用户边界必须避免泄漏。",
      0,
      `
        <div class="ul-depth-intro"><span>为什么要分数据</span><p>在看过的题上得高分不能证明会处理新数据。</p></div>
        <h2>1. 三份数据的职责</h2>
        <table class="ul-depth-table"><thead><tr><th>数据</th><th>用途</th><th>能否反复看结果</th></tr></thead><tbody>
          <tr><td>Training Set 训练集</td><td>调整模型参数</td><td>可以用于训练迭代</td></tr>
          <tr><td>Validation Set 验证集</td><td>选择模型、特征和超参数</td><td>开发阶段可比较，但也会被间接适应</td></tr>
          <tr><td>Test Set 测试集</td><td>最终估计新数据表现</td><td>应尽量少看，只用于最终检查</td></tr>
        </tbody></table>
        <h2>2. Parameter 与 Hyperparameter</h2>
        <p><b>参数（Parameter）</b>由模型从训练数据学到；<b>超参数（Hyperparameter）</b>由人或搜索过程设定，例如树的深度、学习率。验证集常用于选择超参数。</p>
        <h2>3. Data Leakage 数据泄漏</h2>
        <p>任何在真实预测时不可获得、却进入训练或评估的信息都可能造成泄漏。它会让离线分数虚高。</p>
        <div class="exm"><b>用户泄漏：</b>同一会员的高度相似记录同时出现在训练与测试中，模型可能记住用户。<br><b>时间泄漏：</b>用 12 月发生的数据预测 11 月。<br><b>处理泄漏：</b>先用全体数据计算平均值，再切训练测试。</div>
        <h2>4. 时间任务优先按时间切分</h2>
        <p>预测未来时，应尽量用过去训练、较近未来验证、更晚未来测试，模拟真实上线顺序。</p>
        <div class="ul-checkpoint"><b>自检：</b>为什么不能每次改模型都查看测试集并继续优化？</div>
      `
    ),
    lesson(
      "l3-baseline",
      "Baseline：先证明复杂模型真的更好",
      "基线是最简单、可解释的参照方案；新模型必须在相同数据和指标下稳定超过基线，复杂度才有价值。",
      null,
      `
        <div class="ul-depth-intro"><span>没有参照就没有提升</span><p>模型得到 80 分，单独看无法判断好坏。</p></div>
        <h2>1. 什么可以做 Baseline？</h2>
        <ul>
          <li>多数类：永远预测最常见类别。</li>
          <li>简单统计：永远预测历史平均销量。</li>
          <li>业务规则：近 60 天未购买就标记高风险。</li>
          <li>简单模型：逻辑回归或浅层决策树。</li>
        </ul>
        <h2>2. 为什么简单基线重要？</h2>
        <p>它能揭示数据是否含有有效信号，也能防止团队用复杂模型制造“技术进步幻觉”。如果复杂模型只比简单规则高 0.1%，却成本增加十倍，可能不值得。</p>
        <div class="exm">流失样本只占 10%。永远预测“不流失”就有 90% 准确率。新模型准确率 91% 看似提升，但可能仍抓不到真正流失用户。</div>
        <h2>3. 比较必须公平</h2>
        <p>基线和候选模型要使用同一数据切分、同一指标和同一业务约束。不能让候选模型看更多数据，再声称算法更强。</p>
        <h2>4. Baseline 也能上线</h2>
        <p>如果简单规则效果足够、成本低、可解释且风险可控，它可以成为正式方案。机器学习项目的目标是解决问题，不是必须使用复杂模型。</p>
        <div class="ul-checkpoint"><b>自检：</b>为什么“模型准确率 92%”在没有基线时信息不足？</div>
      `
    ),
    lesson(
      "l3-generalization",
      "欠拟合、过拟合与泛化：模型到底学会了吗",
      "欠拟合表示连训练规律都没学好，过拟合表示记住训练细节却不能处理新数据，泛化表示能在未见样本上保持表现。",
      1,
      `
        <div class="ul-depth-intro"><span>目标不是背训练集</span><p>真正有价值的是对未来新样本的表现。</p></div>
        <h2>1. 三种状态</h2>
        <table class="ul-depth-table"><thead><tr><th>状态</th><th>训练表现</th><th>验证/测试表现</th></tr></thead><tbody>
          <tr><td>Underfitting 欠拟合</td><td>差</td><td>差</td></tr>
          <tr><td>Overfitting 过拟合</td><td>很好</td><td>明显变差</td></tr>
          <tr><td>Good Generalization 泛化良好</td><td>好</td><td>接近且稳定</td></tr>
        </tbody></table>
        <h2>2. 为什么会过拟合？</h2>
        <ul>
          <li>模型相对数据过于复杂。</li>
          <li>数据量少、噪声多或不具代表性。</li>
          <li>训练时间过长。</li>
          <li>反复针对验证集调试，间接把验证集也背熟。</li>
        </ul>
        <h2>3. 常见缓解方法</h2>
        <p>增加有代表性数据、简化模型、正则化、早停、数据增强和交叉验证。方法选择取决于数据与任务，不是全部一起堆。</p>
        <h2>4. Cross-validation 交叉验证</h2>
        <p>把数据轮流分成多份训练与验证，以减少单次随机切分造成的偶然性。时间序列不能随意打乱，仍要尊重时间方向。</p>
        <div class="exm"><b>宠物图片案例：</b>训练集中每张狗图都有相同角落水印，模型可能学会认水印而不是认狗。训练分数很高，换平台图片就失败。</div>
        <div class="ul-checkpoint"><b>自检：</b>训练 99%、测试 62% 与训练 60%、测试 58% 分别更像什么问题？</div>
      `
    ),
    lesson(
      "l3-data-quality",
      "数据质量、代表性、类别不平衡与偏差",
      "模型上限由数据定义；缺失、错误标签、重复、抽样偏差和类别不平衡都会让高分模型在真实环境中失败。",
      null,
      `
        <div class="ul-depth-intro"><span>Garbage In, Garbage Out</span><p>输入垃圾，输出也会是垃圾。更多低质量数据不一定优于更少但准确的数据。</p></div>
        <h2>1. 六类常见数据问题</h2>
        <ul>
          <li><b>Missing 缺失：</b>关键字段为空。</li>
          <li><b>Incorrect 错误：</b>金额或标签录入错误。</li>
          <li><b>Duplicate 重复：</b>同一事件被计算多次。</li>
          <li><b>Inconsistent 不一致：</b>同一城市出现多种拼写。</li>
          <li><b>Unrepresentative 不具代表性：</b>样本只来自少数用户。</li>
          <li><b>Stale 过期：</b>旧数据已不反映当前业务。</li>
        </ul>
        <h2>2. 类别不平衡</h2>
        <p>正例远少于负例时，准确率会被多数类支配。需要分层切分、合适指标、重采样或代价敏感方法，但不能凭空复制少数类后就认为问题解决。</p>
        <h2>3. Sampling Bias 抽样偏差</h2>
        <div class="exm">只用愿意填写问卷的活跃会员训练流失模型，会漏掉沉默用户。模型对活跃群体表现很好，却无法代表真正高风险人群。</div>
        <h2>4. Label Quality 标签质量</h2>
        <p>不同标注者对“高风险”理解不一致时，应先制定标注指南、抽样复核并测量一致性。模型无法稳定学会一个人类自己都没有定义清楚的标签。</p>
        <h2>5. 公平性与合法性</h2>
        <p>某些特征可能代理敏感属性。即使相关，也要检查是否有合法用途、是否造成群体不公平，以及用户是否知情。</p>
        <div class="ul-checkpoint"><b>自检：</b>为什么把数据量从一万条扩到十万条，仍可能让模型更差？</div>
      `
    ),
    lesson(
      "l3-confusion-matrix",
      "混淆矩阵：先数清四种结果",
      "二分类结果分为真正例、假正例、真负例和假负例；准确率、精确率与召回率都由这四个数量计算。",
      null,
      `
        <div class="ul-depth-intro"><span>指标计算的地基</span><p>先把预测与真实情况交叉，就能看清错在“误报”还是“漏报”。</p></div>
        <h2>1. 四种结果</h2>
        <table class="ul-depth-table"><thead><tr><th>名称</th><th>真实情况</th><th>模型预测</th><th>过敏筛查例子</th></tr></thead><tbody>
          <tr><td>TP 真正例</td><td>有风险</td><td>预测有风险</td><td>成功发现真实过敏</td></tr>
          <tr><td>FP 假正例</td><td>无风险</td><td>预测有风险</td><td>误报，增加复核</td></tr>
          <tr><td>TN 真负例</td><td>无风险</td><td>预测无风险</td><td>正确放行</td></tr>
          <tr><td>FN 假负例</td><td>有风险</td><td>预测无风险</td><td>漏掉真实过敏</td></tr>
        </tbody></table>
        <h2>2. Positive 是业务定义</h2>
        <p>正例不一定是“好事”。疾病、欺诈、流失都常被定义为正例，因为它们是要重点发现的目标。</p>
        <h2>3. 先问哪类错更贵</h2>
        <div class="exm"><b>过敏筛查：</b>FN 漏报可能伤害健康，代价很高。<br><b>营销推送：</b>FP 误报会骚扰大量用户，可能更需要控制。</div>
        <h2>4. 多分类怎么办？</h2>
        <p>猫、狗、兔多分类可以建立更大的混淆矩阵，观察真实猫被错分成狗或兔的具体数量，而不是只看一个总准确率。</p>
        <div class="ul-checkpoint"><b>自检：</b>真实会流失却预测不会流失，属于 FP 还是 FN？</div>
      `
    ),
    lesson(
      "l3-metrics",
      "准确率、精确率、召回率、F1 与决策阈值",
      "指标回答不同问题；精确率控制误报，召回率控制漏报，F1 平衡二者，阈值决定概率如何转成行动。",
      3,
      `
        <div class="ul-depth-intro"><span>不要只背公式</span><p>先用自然语言理解每个分母是谁。</p></div>
        <h2>1. 四个常见指标</h2>
        <ul>
          <li><b>Accuracy 准确率：</b>全部样本里答对多少。</li>
          <li><b>Precision 精确率：</b>所有“预测为正”的样本里，多少真的为正。</li>
          <li><b>Recall 召回率：</b>所有“真实为正”的样本里，抓到了多少。</li>
          <li><b>F1 Score：</b>综合平衡 Precision 与 Recall 的调和平均。</li>
        </ul>
        <h2>2. 一个数字例子</h2>
        <p>100 位会员中真实有 10 位会流失。模型标记 20 位，其中 8 位真的流失：TP=8，FP=12，FN=2，TN=78。</p>
        <ul>
          <li>Precision = 8/20 = 40%。</li>
          <li>Recall = 8/10 = 80%。</li>
          <li>Accuracy = (8+78)/100 = 86%。</li>
        </ul>
        <h2>3. Threshold 决策阈值</h2>
        <p>模型可能输出流失概率。把阈值从 0.5 降到 0.3，通常会抓住更多正例，提高 Recall，但也可能增加 FP，降低 Precision。</p>
        <div class="exm"><b>高召回：</b>初步安全筛查，宁可多送人工复核。<br><b>高精确：</b>成本很高的线下拜访，只挑最可能转化的人。</div>
        <h2>4. F1 也不是万能指标</h2>
        <p>F1 不考虑 TN，也不直接包含实际金额成本。最终仍要计算业务代价，例如每次误报成本、每次漏报损失和人工容量。</p>
        <h2>5. 指标要切片</h2>
        <p>总体 Recall 90%，可能在新用户上只有 55%。应按时间、渠道、地区、设备或关键群体分别查看。</p>
        <div class="ul-checkpoint"><b>自检：</b>漏掉真实风险代价更大时优先关注哪个指标？误报骚扰代价更大时呢？</div>
      `
    ),
    lesson(
      "l3-correlation-causation",
      "相关不等于因果：模型预测不等于解释原因",
      "相关性表示变量一起变化，因果关系表示改变一个因素会导致另一个结果变化；预测模型通常不能单独证明因果。",
      null,
      `
        <div class="ul-depth-intro"><span>会预测不等于知道为什么</span><p>模型可以找到稳定相关模式，但业务干预需要更严格证据。</p></div>
        <h2>1. Correlation 相关性</h2>
        <p>两个变量经常一起变化。例如购买次数少与流失率高相关。这能帮助预测，但不能证明“减少购买次数导致流失”。</p>
        <h2>2. Causation 因果关系</h2>
        <p>因果要求在其他条件可比时，改变某因素会改变结果。常通过随机实验、自然实验或严谨因果分析建立证据。</p>
        <h2>3. Confounder 混杂因素</h2>
        <div class="exm">冰淇淋销量与中暑人数同时上升，不是冰淇淋导致中暑，而是高温同时影响二者。高温就是混杂因素。</div>
        <h2>4. Prediction 与 Intervention</h2>
        <p>“谁会流失”是预测；“给优惠券是否能减少流失”是干预效果问题。高风险用户可能即使收到优惠券也会离开，不能把预测分数直接解释成行动效果。</p>
        <h2>5. 可解释性也不是因果证明</h2>
        <p>特征重要性只说明模型在预测时依赖某特征，不证明该特征在现实中造成结果。</p>
        <div class="ul-checkpoint"><b>自检：</b>模型发现投诉次数与流失高度相关，能否直接断言投诉导致全部流失？为什么？</div>
      `
    ),
    lesson(
      "l3-drift-monitoring",
      "上线之后：分布漂移、监控与业务指标",
      "数据和用户会变化，模型上线后必须监控输入分布、预测质量、系统可靠性和真实业务结果，并设置回退机制。",
      null,
      `
        <div class="ul-depth-intro"><span>上线不是终点</span><p>测试集只能代表某个历史时期，生产环境会继续变化。</p></div>
        <h2>1. Distribution Drift 分布漂移</h2>
        <p>输入数据分布变化，例如用户从线下会员转向小程序新用户，年龄、行为和渠道都改变。</p>
        <h2>2. Concept Drift 概念漂移</h2>
        <p>输入与标签之间的关系变化。例如促销机制改变后，过去代表流失的“30 天未购买”不再有同样含义。</p>
        <h2>3. 四层监控</h2>
        <table class="ul-depth-table"><thead><tr><th>层</th><th>例子</th></tr></thead><tbody>
          <tr><td>数据</td><td>缺失率、分布、类别比例</td></tr>
          <tr><td>模型</td><td>Precision、Recall、校准</td></tr>
          <tr><td>系统</td><td>延迟、错误率、调用成本</td></tr>
          <tr><td>业务</td><td>挽回率、投诉率、优惠成本</td></tr>
        </tbody></table>
        <h2>4. Ground Truth 延迟</h2>
        <p>流失标签可能要 30 天后才能确认，因此线上模型质量指标会延迟。需要同时使用输入漂移、预测分布等早期信号。</p>
        <h2>5. 回退与重训</h2>
        <p>漂移不意味着自动重训一定正确。应先确认数据管道无误，再决定调整阈值、重新标注、重训或退回规则基线。</p>
        <div class="ul-checkpoint"><b>自检：</b>为什么离线测试分数高，模型上线三个月后仍可能失效？</div>
      `
    ),
    lesson(
      "l3-capstone",
      "第三关综合案例：会员流失预测从 0 到上线",
      "完整 ML 项目把业务目标、数据定义、基线、切分、指标、行动和监控连成闭环，而不是只训练一个高准确率模型。",
      null,
      `
        <div class="ul-depth-intro"><span>把 13 张卡连成一条项目线</span><p>案例目标：提前 30 天发现可能流失的宠物食品会员，供运营安排低风险关怀。</p></div>
        <h2>1. 问题与行动</h2>
        <p><b>标签：</b>未来 30 天无购买且会员未主动注销。<b>行动：</b>进入关怀队列，由规则控制频率与优惠上限。模型不直接发券。</p>
        <h2>2. 样本与特征</h2>
        <p>样本是一位会员在某观察日的状态；特征包括过去 7/30/90 天购买次数、客单价变化、投诉次数和活跃天数。不能使用观察日之后产生的数据。</p>
        <h2>3. 数据切分</h2>
        <p>1 至 9 月训练、10 月验证、11 月测试。相同会员的相邻样本要防止跨集合造成泄漏。</p>
        <h2>4. 基线与候选模型</h2>
        <p>基线规则是“60 天无购买”；候选模型使用多个行为特征。二者在同一测试集比较 Recall、Precision、覆盖人数与每次挽回成本。</p>
        <h2>5. 错误代价</h2>
        <ul>
          <li>FP：对不会流失用户发送不必要关怀，增加骚扰和优惠成本。</li>
          <li>FN：漏掉真实流失用户，失去挽回机会。</li>
        </ul>
        <h2>6. 上线门槛与监控</h2>
        <p>候选模型必须稳定超过基线，关键群体表现不能明显恶化；上线后监控数据缺失、预测比例、投诉率、真实挽回率和单位成本。</p>
        <h2>7. 结论边界</h2>
        <p>模型预测谁“更可能”流失，不能证明用户为什么流失，也不能证明优惠券一定有效。干预效果需要单独实验。</p>
        <div class="ul-checkpoint"><b>进入训练前：</b>你能指出这个案例的样本、特征、标签、基线、FN、业务动作和上线监控吗？</div>
      `
    )
  ];

  var levelFour = [
    lesson(
      "l4-neuron",
      "神经网络起点：输入、权重、偏置与激活",
      "一个人工神经元把输入乘以权重、加上偏置，再经过激活函数；神经网络由大量这类计算分层连接组成。",
      null,
      `
        <div class="ul-depth-intro"><span>先看最小计算单元</span><p>“神经网络”是数学模型名称，不是电脑里真的长了人脑神经元。</p></div>
        <h2>1. Input 输入</h2>
        <p>输入是模型收到的数字特征。例如预测流失时，近 30 天购买次数、客单价变化和投诉次数都可以成为输入。</p>
        <h2>2. Weight 权重</h2>
        <p><b>权重</b>表示某个输入在当前计算中的影响方向与强度。正权重可能提高输出，负权重可能降低输出。训练的核心之一就是调整大量权重。</p>
        <h2>3. Bias 偏置</h2>
        <p><b>偏置</b>是额外可学习数值，让模型不必在所有输入为 0 时输出也固定为 0。它与统计学中的“偏见”不是同一个概念。</p>
        <h2>4. Activation Function 激活函数</h2>
        <p>激活函数为网络加入非线性能力。没有它，堆很多层线性计算仍相当于一个线性变换，难以学习复杂关系。</p>
        <pre><code>输出 = 激活函数(输入1 × 权重1 + 输入2 × 权重2 + 偏置)</code></pre>
        <h2>5. Layer 层</h2>
        <p>输入层接收数据，隐藏层逐步变换表示，输出层给出预测。深度学习中的“深”主要指存在多层可学习变换。</p>
        <div class="exm"><b>图像直觉：</b>较早层可能响应边缘和颜色，中间层组合成纹理与局部形状，更后层形成对猫耳、眼睛等复杂模式的表示。它们不是人手逐层写死的标签。</div>
        <div class="ul-checkpoint"><b>自检：</b>权重、偏置和激活函数分别解决什么问题？</div>
      `
    ),
    lesson(
      "l4-training-inference",
      "训练与推理：模型什么时候学习，什么时候工作",
      "训练使用数据和误差调整参数；推理固定已有参数，对新输入计算输出。聊天时通常发生的是推理，不是重新训练整个模型。",
      null,
      `
        <div class="ul-depth-intro"><span>两个阶段不能混用</span><p>模型回答你的问题，不代表它立即把这次对话写进所有参数。</p></div>
        <h2>1. Training 训练</h2>
        <p>训练阶段反复执行：输入样本 → 产生预测 → 计算损失 → 计算梯度 → 更新参数。需要大量数据、算力和时间。</p>
        <h2>2. Inference 推理</h2>
        <p>推理阶段使用已经训练好的参数处理新输入，通常只做前向计算，不更新整个模型参数。</p>
        <table class="ul-depth-table"><thead><tr><th>对比</th><th>训练</th><th>推理</th></tr></thead><tbody>
          <tr><td>目的</td><td>学参数</td><td>用参数产生结果</td></tr>
          <tr><td>是否有标准目标</td><td>通常需要学习信号</td><td>不一定知道正确答案</td></tr>
          <tr><td>是否更新参数</td><td>是</td><td>通常否</td></tr>
          <tr><td>成本</td><td>很高</td><td>相对较低但会随输入输出增长</td></tr>
        </tbody></table>
        <h2>3. Fine-tuning 微调</h2>
        <p>微调是在已有模型基础上，用更小的特定数据继续训练部分或全部参数。它仍属于训练，不等于在提示词里放几个例子。</p>
        <h2>4. In-context Learning 上下文学习</h2>
        <p>在提示中提供指令和示例，模型在本次上下文中模仿模式，但基础参数通常没有永久改变。</p>
        <div class="exm"><b>客服案例：</b>在提示里放 3 个回复示例是上下文学习；用一批审核数据更新模型参数是微调；用户发来新问题并得到回答是推理。</div>
        <div class="ul-checkpoint"><b>自检：</b>普通聊天、提示示例和微调分别属于推理、上下文学习还是训练？</div>
      `
    ),
    lesson(
      "l4-loss",
      "损失函数：模型怎样知道自己错了多少",
      "损失函数把预测与目标之间的差异变成可优化数值；训练目标是降低损失，但低训练损失不自动等于真实业务可靠。",
      null,
      `
        <div class="ul-depth-intro"><span>Loss 是学习信号</span><p>模型需要一个可计算标准，才能知道参数应向哪个方向改变。</p></div>
        <h2>1. Prediction 与 Target</h2>
        <p><b>Prediction 预测</b>是模型当前输出；<b>Target 目标</b>是训练样本给出的正确结果。损失函数比较二者。</p>
        <h2>2. Loss 与 Metric</h2>
        <p><b>Loss 损失</b>主要用于训练优化，要求能指导参数更新；<b>Metric 指标</b>用于人理解与业务评价。二者可能相关，但不一定相同。</p>
        <div class="exm">分类训练可优化交叉熵损失，业务报告却关注 Recall 和每次漏报损失。不能只看训练 Loss 下降。</div>
        <h2>3. Batch 与 Epoch</h2>
        <ul>
          <li><b>Batch 批次：</b>一次用于计算更新的一小组样本。</li>
          <li><b>Epoch 轮次：</b>模型大致看完全部训练样本一遍。</li>
        </ul>
        <h2>4. 训练、验证损失曲线</h2>
        <p>训练损失持续下降而验证损失开始上升，常提示过拟合。曲线只是信号，还要排查数据切分与实现错误。</p>
        <h2>5. 业务代价不能遗漏</h2>
        <p>普通损失函数可能把每个错误等价处理，但医疗漏诊和普通误报的代价不同。可通过加权损失、阈值和业务规则反映差异。</p>
        <div class="ul-checkpoint"><b>自检：</b>为什么训练 Loss 很低，仍不能直接宣布模型可以上线？</div>
      `
    ),
    lesson(
      "l4-gradient-descent",
      "梯度下降：参数怎样一步步被调整",
      "梯度表示损失对参数变化最敏感的方向，梯度下降沿降低损失的方向小步更新参数，学习率控制每一步大小。",
      null,
      `
        <div class="ul-depth-intro"><span>不用先学微积分公式</span><p>先建立“站在山坡上找下山方向”的直觉。</p></div>
        <h2>1. Gradient 梯度</h2>
        <p>梯度是一组方向信息，告诉我们每个参数稍微改变时，损失会怎样变化。它不是“模型答案”，而是优化过程的导航。</p>
        <h2>2. Gradient Descent 梯度下降</h2>
        <ol>
          <li>用当前参数做预测。</li>
          <li>计算损失。</li>
          <li>计算损失对各参数的梯度。</li>
          <li>沿让损失下降的方向更新一点。</li>
          <li>对许多批次重复。</li>
        </ol>
        <h2>3. Learning Rate 学习率</h2>
        <p>学习率控制更新步幅。太大可能越过低点并震荡，太小则训练非常慢或停在不理想位置。</p>
        <div class="exm"><b>下山类比：</b>梯度像脚下最陡方向，学习率像每一步长度。知道下坡方向不等于一步就到谷底。</div>
        <h2>4. Optimizer 优化器</h2>
        <p>优化器规定怎样利用梯度更新参数。SGD、Adam 是常见名字。初学阶段先理解它们都是“更新策略”，不需要背完整公式。</p>
        <h2>5. 局部与整体</h2>
        <p>神经网络的损失地形非常复杂。训练结果还受到初始化、数据顺序、学习率和随机性的影响。</p>
        <div class="ul-checkpoint"><b>自检：</b>梯度和学习率分别告诉训练过程“往哪走”和“走多远”中的哪一个？</div>
      `
    ),
    lesson(
      "l4-backprop",
      "反向传播：误差怎样传回每一层",
      "反向传播使用链式法则，从输出损失向后计算每个参数的梯度；它负责算梯度，优化器负责用梯度更新参数。",
      null,
      `
        <div class="ul-depth-intro"><span>Backward 不等于倒着生成文字</span><p>它发生在训练阶段，用于分配各参数对错误的责任。</p></div>
        <h2>1. Forward Pass 前向传播</h2>
        <p>输入从第一层依次通过网络，产生预测并计算损失。</p>
        <h2>2. Backward Pass 反向传播</h2>
        <p>从损失开始，沿计算图反向计算：如果某个中间结果改变一点，最终损失会改变多少。最终得到每个权重和偏置的梯度。</p>
        <h2>3. Chain Rule 链式法则直觉</h2>
        <p>后层依赖前层，最终损失对早期参数的影响需要把每一段影响连接起来。像追查“原料变化如何影响配方、口感，最后影响评分”。</p>
        <h2>4. 反向传播与梯度下降的分工</h2>
        <ul>
          <li><b>反向传播：</b>计算梯度。</li>
          <li><b>优化器：</b>根据梯度与学习率更新参数。</li>
        </ul>
        <h2>5. Vanishing / Exploding Gradient</h2>
        <p>深层网络中梯度可能越来越小或越来越大，造成难以学习或不稳定。现代结构使用初始化、归一化、残差连接等方法缓解。</p>
        <div class="ul-checkpoint"><b>自检：</b>“计算梯度”和“真正更新参数”分别由反向传播与优化器中的谁负责？</div>
      `
    ),
    lesson(
      "l4-token",
      "Token 与 Tokenizer：模型怎样切开文字",
      "Tokenizer 按词表和算法把文本转换成 Token ID；Token 可能是字、词片段、标点或特殊符号，不固定等于一个词。",
      0,
      `
        <div class="ul-depth-intro"><span>模型先看编号，不直接看文字</span><p>文本必须先转换成模型词表中的离散单位。</p></div>
        <h2>1. Token 与 Tokenizer</h2>
        <ul>
          <li><b>Token 词元：</b>模型处理的文本单位。</li>
          <li><b>Tokenizer 分词器：</b>负责文本与 Token 序列之间转换的工具。</li>
          <li><b>Vocabulary 词表：</b>模型认识的 Token 集合。</li>
          <li><b>Token ID：</b>每个 Token 在词表里的数字编号。</li>
        </ul>
        <h2>2. 为什么不直接按字或词切？</h2>
        <p>完整词表会无限膨胀，按单字符又让序列太长。子词切分在词表大小和表达能力之间折中，陌生词也能拆成已知片段。</p>
        <h2>3. Special Token 特殊词元</h2>
        <p>模型可能使用表示开始、结束、角色或填充的特殊 Token。它们用于组织输入，不一定对应可见文字。</p>
        <h2>4. Token 与成本</h2>
        <p>上下文容量、API 计费与生成延迟常按输入和输出 Token 数量计算。不同模型的 Tokenizer 不同，同一段话的数量也可能不同，不能死记“一个汉字等于几个 Token”。</p>
        <div class="exm"><b>案例：</b>一份重复页眉和导航的长文档会消耗大量 Token，却不增加有效信息。清理结构比单纯扩大上下文更重要。</div>
        <div class="ul-checkpoint"><b>自检：</b>Token、Token ID、Tokenizer 和 Vocabulary 分别是什么？</div>
      `
    ),
    lesson(
      "l4-embedding",
      "Embedding：把离散 Token 变成可学习向量",
      "Embedding 把 Token、句子或文档映射为向量；向量可以表达相似性，但距离近不等于事实相同或因果相关。",
      1,
      `
        <div class="ul-depth-intro"><span>从编号到连续数字</span><p>Token ID 只是编号，本身没有“100 比 20 更像宠物”的含义。</p></div>
        <h2>1. Vector 向量</h2>
        <p>向量是一组有顺序的数字，例如 <code>[0.12, -0.44, 0.08, ...]</code>。模型通过训练让这些数字承载可用模式。</p>
        <h2>2. Token Embedding 与 Text Embedding</h2>
        <ul>
          <li><b>Token Embedding：</b>语言模型内部把每个 Token ID 转成向量。</li>
          <li><b>Text Embedding：</b>把一句话或一篇文档压缩成用于检索、聚类等任务的向量。</li>
        </ul>
        <h2>3. Similarity 相似度</h2>
        <p>可用余弦相似度等方法比较向量方向。分数高表示在该模型表示下更相似，不代表两个文本完全等义。</p>
        <div class="exm">“犬类腹泻护理”可能与“狗狗拉肚子怎么办”接近，因此适合语义检索；但检索到的文章仍需检查来源、日期和具体宠物情况。</div>
        <h2>4. Embedding 的限制</h2>
        <ul>
          <li>专有名词、数字和细微否定可能表现不稳定。</li>
          <li>不同模型产生的向量通常不能直接混用。</li>
          <li>向量会编码训练数据中的偏差。</li>
          <li>文本相似不代表答案正确。</li>
        </ul>
        <div class="ul-checkpoint"><b>自检：</b>为什么 Token ID 不能直接表示语义，而 Embedding 可以用于近似语义比较？</div>
      `
    ),
    lesson(
      "l4-position",
      "位置与顺序：同样的词为什么排列不同意义不同",
      "Transformer 同时处理序列中的多个位置，需要显式加入位置信息，才能区分“狗追猫”和“猫追狗”。",
      null,
      `
        <div class="ul-depth-intro"><span>词相同，顺序改变，意思改变</span><p>仅有 Token Embedding 不能完整表达位置关系。</p></div>
        <h2>1. Sequence 序列</h2>
        <p>语言是有顺序的 Token 序列。句子前后位置、段落结构和对话角色都会影响含义。</p>
        <h2>2. Positional Encoding / Embedding</h2>
        <p>模型把位置信息加入 Token 表示，使每个 Token 同时带有“是什么”和“在哪里”的信息。不同 Transformer 可能使用绝对位置、相对位置或旋转位置编码等方法。</p>
        <h2>3. 位置不只是编号</h2>
        <p>模型需要学习相对距离和顺序关系，例如主语在动词前、引用内容靠近其来源、一个代词指向较早的名词。</p>
        <div class="exm"><b>对照：</b>“豆豆咬了玩具”和“玩具咬了豆豆”使用相同词，但角色关系完全不同。位置编码帮助模型区分顺序。</div>
        <h2>4. 长上下文中的位置挑战</h2>
        <p>模型在训练时见过的长度、位置方法和注意力分布都会影响长文本能力。上下文窗口支持 100K，不代表每个位置都能同样准确利用。</p>
        <div class="ul-checkpoint"><b>自检：</b>如果只保留词的向量而完全丢掉顺序，哪类语言信息会首先受损？</div>
      `
    ),
    lesson(
      "l4-attention",
      "Attention：Query、Key、Value 怎样决定关注谁",
      "Attention 用 Query 与 Key 计算相关权重，再按权重组合 Value；它让每个位置根据当前需要读取其他位置的信息。",
      2,
      `
        <div class="ul-depth-intro"><span>从“荧光笔”进入工作逻辑</span><p>类比帮助理解作用，Q、K、V 帮助理解计算分工。</p></div>
        <h2>1. 三个角色</h2>
        <ul>
          <li><b>Query 查询：</b>当前这个位置想寻找什么信息。</li>
          <li><b>Key 键：</b>每个候选位置用什么特征说明自己。</li>
          <li><b>Value 值：</b>如果被关注，实际要传递什么内容。</li>
        </ul>
        <p>Query 与各 Key 计算相似度，经过归一化形成权重，再对 Value 加权求和。</p>
        <h2>2. Self-Attention 自注意力</h2>
        <p>Query、Key、Value 都来自同一段序列，让句子中的每个 Token 读取其他 Token。例如“它”可以关注前文“宠物食品配方”。</p>
        <h2>3. Multi-head Attention 多头注意力</h2>
        <p>多个注意力头并行学习不同关系，有的可能更关注语法位置，有的关注指代或主题。它们不是人工固定分工。</p>
        <h2>4. Causal Mask 因果掩码</h2>
        <p>生成式模型预测下一个 Token 时不能偷看未来 Token，因此使用掩码限制每个位置只关注当前及之前内容。</p>
        <div class="exm"><b>问答案例：</b>问题询问“退款时限”，Query 会让相关位置更关注资料中的“7 天”“未拆封”等 Key，并聚合其 Value；但 Attention 权重本身不是可靠事实证明。</div>
        <h2>5. Attention 的限制</h2>
        <p>注意力计算不会自动验证事实，也不保证长上下文中每段信息都被同等利用。无关内容、冲突资料与位置都可能影响结果。</p>
        <div class="ul-checkpoint"><b>自检：</b>用一句话分别解释 Query、Key 和 Value。</div>
      `
    ),
    lesson(
      "l4-transformer-block",
      "Transformer Block：Attention 之外还有什么",
      "Transformer 层通常由注意力、前馈网络、残差连接和归一化组成；Attention 负责跨位置交流，前馈网络负责逐位置变换。",
      null,
      `
        <div class="ul-depth-intro"><span>Transformer 不等于 Attention 一个组件</span><p>模型把多个 Block 叠加，逐层更新每个 Token 的表示。</p></div>
        <h2>1. Attention 子层</h2>
        <p>让不同位置交换信息，当前 Token 可以根据上下文重新理解自身。</p>
        <h2>2. Feed-forward Network 前馈网络</h2>
        <p>对每个位置的向量独立进行非线性变换，扩展和压缩特征。它负责“加工”，Attention 更像“通信”。</p>
        <h2>3. Residual Connection 残差连接</h2>
        <p>把子层输入直接加到输出上，为信息和梯度提供捷径，帮助深层网络训练。</p>
        <h2>4. Layer Normalization 层归一化</h2>
        <p>调整中间表示的尺度，使训练更稳定。它不是把所有用户数据变成同一个值。</p>
        <h2>5. Encoder 与 Decoder</h2>
        <p>原始 Transformer 同时包含编码器和解码器。现代模型可能采用仅编码器、仅解码器或编码器-解码器结构。聊天型 LLM 常见的是自回归解码器结构。</p>
        <div class="exm"><b>一层直觉：</b>Attention 收集“上下文对我有什么影响”，前馈网络加工“收集后我应怎样更新”，残差与归一化帮助信息稳定流过很多层。</div>
        <div class="ul-checkpoint"><b>自检：</b>Attention 与前馈网络的主要分工是什么？</div>
      `
    ),
    lesson(
      "l4-llm-training",
      "LLM 怎样训练：预训练、指令微调与偏好对齐",
      "预训练学习广泛语言规律，指令微调学习按要求回答，偏好对齐让行为更符合人类偏好与安全标准；三者目标不同。",
      null,
      `
        <div class="ul-depth-intro"><span>能力不是一次训练得到</span><p>现代 LLM 通常经历多个训练阶段。</p></div>
        <h2>1. Pretraining 预训练</h2>
        <p>在大规模文本或多模态数据上预测缺失或后续 Token，学习语言、知识和模式。它主要使用自监督信号。</p>
        <h2>2. Instruction Tuning 指令微调</h2>
        <p>使用“指令-理想回答”数据，让模型更会遵循任务要求、格式和多轮对话。</p>
        <h2>3. Preference Alignment 偏好对齐</h2>
        <p>收集人类或规则对多个回答的偏好，训练模型更倾向有帮助、安全、诚实的行为。RLHF 和 DPO 是常见方法名称，不需要在此阶段记公式。</p>
        <h2>4. Parameter 参数不是事实表</h2>
        <p>训练把统计模式压进大量权重，而不是建立一个可以精确查询、实时更新的百科数据库。因此参数知识可能过期、模糊或混合冲突来源。</p>
        <h2>5. 数据与对齐的边界</h2>
        <p>高质量训练能降低问题，但不能保证零幻觉、实时事实或业务权限。产品仍需 RAG、工具、规则与 Evals。</p>
        <div class="exm"><b>更新政策案例：</b>模型预训练可能见过旧政策；即使指令遵循很好，也应从当前审批库检索最新版本，而不是依赖参数记忆。</div>
        <div class="ul-checkpoint"><b>自检：</b>预训练、指令微调和偏好对齐分别主要学习什么？</div>
      `
    ),
    lesson(
      "l4-decoding",
      "生成与采样：Logits、Temperature、Top-p 和停止条件",
      "模型先为下一个 Token 产生分数并转为概率，再按解码策略选择；Temperature 与 Top-p 改变随机性，不保证事实正确。",
      null,
      `
        <div class="ul-depth-intro"><span>“预测下一个 Token”还有选择过程</span><p>模型不是永远直接取一个固定答案。</p></div>
        <h2>1. Logits 与 Probability</h2>
        <p><b>Logits</b>是模型对词表中每个候选 Token 给出的原始分数，经过 Softmax 转成概率分布。</p>
        <h2>2. Greedy Decoding 贪心解码</h2>
        <p>每一步选择当前概率最高的 Token。它较稳定，但不保证整段结果全局最好，也不保证事实正确。</p>
        <h2>3. Temperature 温度</h2>
        <p>较低温度让概率更集中，输出更稳定；较高温度让候选更分散，输出更多样。温度是采样参数，不是“正确度旋钮”。</p>
        <h2>4. Top-k 与 Top-p</h2>
        <ul>
          <li><b>Top-k：</b>只在概率最高的 k 个候选中采样。</li>
          <li><b>Top-p：</b>选择累计概率达到 p 的最小候选集合再采样。</li>
        </ul>
        <h2>5. Max Tokens 与 Stop</h2>
        <p><b>Max Tokens</b>限制最多生成多少 Token；<b>Stop Sequence</b>遇到指定序列时停止。截断可能造成 JSON 不完整或句子中断。</p>
        <div class="exm"><b>创意文案：</b>可以适度提高随机性探索表达。<br><b>余额输出：</b>即使温度为 0，也不应让模型重新生成关键金额，仍要直接展示验证后的字段。</div>
        <div class="ul-checkpoint"><b>自检：</b>为什么降低 Temperature 会更稳定，却不能保证事实正确？</div>
      `
    ),
    lesson(
      "l4-context-hallucination",
      "上下文窗口、幻觉与多模态边界",
      "上下文窗口限制一次推理可处理的 Token；幻觉来自生成目标与事实验证的错位；Transformer 也可处理图像、音频等模态。",
      null,
      `
        <div class="ul-depth-intro"><span>容量、记忆和事实是三回事</span><p>上下文更大不等于模型永久记住，也不等于每段信息都会被正确使用。</p></div>
        <h2>1. Context Window 上下文窗口</h2>
        <p>一次推理中模型能接收和生成的 Token 总范围。系统提示、历史对话、检索资料、工具结果和输出都会占用容量。</p>
        <h2>2. 长上下文的三个问题</h2>
        <ul>
          <li>成本和延迟增加。</li>
          <li>无关或冲突信息干扰注意力。</li>
          <li>关键信息可能因位置或结构没有被有效利用。</li>
        </ul>
        <h2>3. Hallucination 幻觉</h2>
        <p>模型生成流畅但事实错误、无依据或虚构来源的内容。因为训练目标主要是产生符合上下文概率的后续 Token，而不是自动查询权威数据库。</p>
        <h2>4. 怎样降低但不能宣称消灭</h2>
        <p>使用权威 RAG、实时工具、结构化输出、引用核验、失败闭合和 Evals；让模型在没有证据时明确不确定。任何单一提示词都不能保证零幻觉。</p>
        <h2>5. Multimodal 多模态</h2>
        <p>Transformer 架构也可用于图像、音频和视频。不同模态会先被转换成模型可处理的表示，再参与注意力计算。多模态模型看见图片也不代表具备医疗诊断资格。</p>
        <div class="exm"><b>商品图案例：</b>模型可识别包装上的文本与视觉元素，但批次、真伪和最新配方仍需产品数据库或人工证据。</div>
        <div class="ul-checkpoint"><b>自检：</b>上下文窗口、长期记忆和事实数据库为什么不能互换？</div>
      `
    ),
    lesson(
      "l4-capstone",
      "第四关综合链路：一句话怎样变成回答",
      "文本经 Tokenizer、Embedding、位置表示和多层 Transformer 处理，形成下一个 Token 的概率并循环生成；训练决定参数，推理使用参数。",
      3,
      `
        <div class="ul-depth-intro"><span>把 13 张卡连起来</span><p>以“会员余额是多少？”为例，沿数据流走一遍。</p></div>
        <h2>1. 输入准备</h2>
        <ol>
          <li>系统把系统提示、用户问题和已验证工具结果组织成上下文。</li>
          <li>Tokenizer 把文字切成 Token，并转换为 Token ID。</li>
          <li>Embedding 把离散 ID 转成向量。</li>
          <li>位置信息加入向量，保留顺序和角色结构。</li>
        </ol>
        <h2>2. Transformer 计算</h2>
        <p>每一层的 Attention 让位置间交换信息，前馈网络继续加工表示，残差与归一化帮助信息稳定流动。多层之后，最后位置形成对下一个 Token 的表示。</p>
        <h2>3. 生成循环</h2>
        <ol>
          <li>模型输出所有候选 Token 的 Logits。</li>
          <li>Softmax 转为概率。</li>
          <li>解码策略选择一个 Token。</li>
          <li>新 Token 加入上下文，重复计算，直到停止。</li>
        </ol>
        <h2>4. 训练发生在哪里？</h2>
        <p>模型最初通过损失、反向传播和优化器学习参数。当前回答通常是推理，基础参数不会因为这次问答立即重训。</p>
        <h2>5. 为什么金额仍不能让模型自由生成？</h2>
        <p>上述流程优化的是合理后续 Token 概率，不包含天然事实保证。余额应由账户工具返回并经程序验证，页面可直接绑定字段；LLM 只解释，不重新“猜写”关键数值。</p>
        <h2>6. 你现在应该能解释什么</h2>
        <ul>
          <li>神经网络怎样通过损失和梯度训练。</li>
          <li>Token、Embedding、位置与 Attention 怎样处理输入。</li>
          <li>Transformer Block 不只有 Attention。</li>
          <li>Temperature 改变随机性，不改变事实来源。</li>
          <li>上下文、参数知识、RAG、工具和记忆的边界。</li>
        </ul>
        <div class="ul-checkpoint"><b>进入训练前：</b>不要只说“模型是文字接龙”。请从 Tokenizer 开始，用 6 至 8 步复述完整生成链路，并指出事实验证发生在模型外部的哪一步。</div>
      `
    )
  ];

  var levelThreeQuestions = [
    choice("l3-13", "下面哪项最适合优先使用固定规则，而不是机器学习？", ["预测未来 30 天会员流失概率", "根据图片识别宠物品种", "检查余额是否小于 0", "从文本发现投诉主题"], 2, "余额不能为负是明确确定性规则，无需用概率模型学习。", "AI 与 ML"),
    choice("l3-14", "预测会员是否流失时，“最近 30 天购买次数”通常是什么？", ["样本", "特征", "标签", "损失函数"], 1, "它是提供给模型的输入信息，属于特征。", "特征"),
    choice("l3-15", "机器学习数据表中的一行会员观察记录通常称为什么？", ["样本", "参数", "模型", "阈值"], 0, "一条独立观察记录通常称为样本。", "样本"),
    choice("l3-16", "没有预先标签，希望从购买行为中发现自然会员群组，属于什么任务？", ["监督分类", "监督回归", "无监督聚类", "规则校验"], 2, "聚类在没有目标标签时寻找数据中的群组结构。", "无监督学习"),
    choice("l3-17", "预测未来 30 天消费金额属于哪类任务？", ["回归", "二分类", "聚类", "权限校验"], 0, "连续数值预测通常属于回归。", "分类回归"),
    judge("l3-18", "用结果发生后才生成的“账户注销时间”预测注销风险，可能造成数据泄漏。", true, "真实预测时拿不到未来字段，它会泄露答案并虚高离线分数。", "数据泄漏"),
    choice("l3-19", "一个复杂模型准确率 91%，多数类基线已经有 90%。最合理的下一步是？", ["直接宣布重大突破", "比较召回、成本和稳定性，确认增益是否有价值", "删除基线", "只增加模型层数"], 1, "基线提供参照，候选模型必须在业务相关指标和成本上证明价值。", "Baseline"),
    choice("l3-20", "训练集和测试集表现都很差，最可能的初步判断是什么？", ["过拟合", "欠拟合", "测试泄漏", "一定上线成功"], 1, "连训练数据都学不好更符合欠拟合。", "欠拟合"),
    judge("l3-21", "如果训练数据只来自活跃用户，模型可能无法代表沉默用户。", true, "这是样本代表性和抽样偏差问题。", "数据质量"),
    choice("l3-22", "真实会流失，但模型预测不会流失，属于哪种结果？", ["真正例 TP", "假正例 FP", "真负例 TN", "假负例 FN"], 3, "真实为正、预测为负属于假负例，也就是漏报。", "混淆矩阵"),
    choice("l3-23", "Precision 回答的核心问题是什么？", ["真实正例中抓住多少", "预测为正的样本中多少真的为正", "全部样本中有多少负例", "模型训练了几轮"], 1, "Precision 的分母是所有预测为正的样本。", "精确率"),
    choice("l3-24", "F1 Score 主要用于什么？", ["综合平衡 Precision 与 Recall", "计算训练时长", "证明因果关系", "替代全部业务指标"], 0, "F1 是 Precision 与 Recall 的调和平均，但仍不能替代业务成本。", "F1"),
    judge("l3-25", "降低二分类决策阈值通常会抓住更多正例，但也可能增加误报。", true, "阈值降低通常提高 Recall，同时可能降低 Precision。", "决策阈值"),
    choice("l3-26", "冰淇淋销量和中暑人数同时上升，最合理的判断是？", ["冰淇淋一定导致中暑", "二者相关但可能都受高温影响", "中暑一定导致买冰淇淋", "相关性已经证明因果"], 1, "高温可能是同时影响二者的混杂因素，相关不等于因果。", "相关因果"),
    judge("l3-27", "上线后用户渠道和行为分布改变，历史测试集分数可能不再代表当前表现。", true, "输入分布变化会造成分布漂移。", "分布漂移"),
    choice("l3-28", "评估流失模型上线价值时，除模型指标外还应重点看什么？", ["真实挽回率、投诉和行动成本", "代码文件数量", "模型名称是否流行", "训练日志颜色"], 0, "模型预测必须连接真实业务效果、成本与风险。", "业务指标")
  ];

  var levelFourQuestions = [
    choice("l4-13", "神经网络中的 Weight 主要表示什么？", ["输入影响的方向和强度", "用户权限", "文件大小", "Token 数量"], 0, "权重是训练中学习的参数，用于调节输入对计算结果的影响。", "神经元"),
    choice("l4-14", "神经元中的 Bias 主要作用是什么？", ["替代全部输入", "提供可学习的额外偏移", "保存用户记忆", "切分 Token"], 1, "偏置让模型的计算不必被固定在所有输入为零时也输出零。", "偏置"),
    judge("l4-15", "没有非线性激活函数，堆叠多层线性变换仍难以表达复杂非线性关系。", true, "激活函数为网络加入非线性表达能力。", "激活函数"),
    choice("l4-16", "Loss Function 在训练中的主要作用是什么？", ["衡量预测与目标的差异", "把代码上传 GitHub", "增加上下文窗口", "替代业务权限"], 0, "损失函数提供可优化的错误信号。", "损失函数"),
    choice("l4-17", "Learning Rate 控制什么？", ["每次参数更新的步幅", "Token 词表大小", "用户登录时长", "测试集比例"], 0, "学习率决定优化器每一步调整参数的幅度。", "梯度下降"),
    choice("l4-18", "反向传播与优化器的分工最准确的是？", ["前者算梯度，后者用梯度更新参数", "前者生成 Token，后者切分文字", "二者都只负责推理", "二者都负责权限校验"], 0, "反向传播计算各参数梯度，优化器按更新策略改变参数。", "反向传播"),
    judge("l4-19", "普通聊天推理通常会立即用这一轮对话重新训练并永久修改全部模型参数。", false, "推理通常使用固定参数；上下文影响本轮输出，不等于重训基础模型。", "训练与推理"),
    choice("l4-20", "Tokenizer 的主要职责是什么？", ["在文本与 Token 序列之间转换", "验证账户权限", "更新 Git 分支", "计算业务利润"], 0, "Tokenizer 按词表和规则把文本切为 Token，也可把 Token 转回文本。", "Tokenizer"),
    choice("l4-21", "Transformer 为什么需要位置信息？", ["区分相同 Token 的不同排列顺序", "保证事实一定正确", "自动增加训练数据", "隐藏 API Key"], 0, "位置表示帮助模型理解顺序和相对关系。", "位置编码"),
    choice("l4-22", "Attention 中 Query、Key、Value 的关系最接近哪一项？", ["Query 与 Key 计算关注权重，再组合 Value", "Value 与 Query 删除 Key", "三者都是 Git 命令", "三者只用于计算价格"], 0, "Query 表达当前需要，Key 用于匹配，Value 是被加权聚合的信息。", "Attention"),
    choice("l4-23", "Transformer Block 中，前馈网络的主要作用是什么？", ["对每个位置的表示继续做非线性变换", "取代全部 Attention", "连接数据库", "生成用户权限"], 0, "Attention 负责位置间交流，前馈网络负责逐位置加工表示。", "Transformer"),
    choice("l4-24", "下面哪项最符合预训练的主要目标？", ["在大量数据上学习广泛语言与模式", "只学习某家公司最新权限", "把每次聊天永久保存", "保证零幻觉"], 0, "预训练通过大规模自监督任务学习通用统计模式。", "LLM 训练"),
    judge("l4-25", "把 Temperature 调到 0，就可以用 LLM 替代余额事实数据库。", false, "低温度只降低随机性，不提供实时事实或权限保证。", "生成参数"),
    choice("l4-26", "Top-p 采样大致在做什么？", ["在累计概率达到 p 的候选集合中采样", "只保留长度为 p 的文本", "把模型参数乘以 p", "检查 HTTP 状态码"], 0, "Top-p 使用累计概率构造动态候选集合。", "生成参数"),
    judge("l4-27", "上下文窗口更大后，信息结构、检索和冲突处理仍然重要。", true, "大窗口仍有成本、干扰、位置和注意力利用问题。", "上下文窗口"),
    choice("l4-28", "降低幻觉最可靠的产品组合是什么？", ["只要求模型不要编造", "权威检索或工具、字段验证、失败闭合与 Evals", "不断提高 Temperature", "删除全部错误日志"], 1, "幻觉缓解需要事实来源、系统约束和持续评估共同工作。", "幻觉")
  ];

  curriculum.levels[2] = levelThree;
  curriculum.levels[3] = levelFour;
  if (!curriculum.extraQuestions) curriculum.extraQuestions = {};
  curriculum.extraQuestions[2] = levelThreeQuestions;
  curriculum.extraQuestions[3] = levelFourQuestions;

  if (!curriculum.questionLessons) curriculum.questionLessons = {};
  curriculum.questionLessons[2] = {
    "l3-01": 3, "l3-02": 6, "l3-03": 8, "l3-04": 2,
    "l3-05": 12, "l3-06": 11, "l3-07": 7, "l3-08": 13,
    "l3-09": 6, "l3-10": 9, "l3-11": 3, "l3-12": 13,
    "l3-13": 1, "l3-14": 2, "l3-15": 2, "l3-16": 3,
    "l3-17": 4, "l3-18": 6, "l3-19": 7, "l3-20": 8,
    "l3-21": 9, "l3-22": 10, "l3-23": 11, "l3-24": 11,
    "l3-25": 11, "l3-26": 12, "l3-27": 13, "l3-28": 13
  };
  curriculum.questionLessons[3] = {
    "l4-01": 6, "l4-02": 6, "l4-03": 7, "l4-04": 9,
    "l4-05": 12, "l4-06": 2, "l4-07": 13, "l4-08": 5,
    "l4-09": 11, "l4-10": 13, "l4-11": 13, "l4-12": 14,
    "l4-13": 1, "l4-14": 1, "l4-15": 1, "l4-16": 3,
    "l4-17": 4, "l4-18": 5, "l4-19": 2, "l4-20": 6,
    "l4-21": 8, "l4-22": 9, "l4-23": 10, "l4-24": 11,
    "l4-25": 12, "l4-26": 12, "l4-27": 13, "l4-28": 13
  };

  if (!curriculum.audit) curriculum.audit = {};
  curriculum.audit[0].detailExpansion = "Prompt/规格/验收、概率与确定性、Grader、风险、数据血缘、指标分母、Test Case 与可追踪性";
  curriculum.audit[1].detailExpansion = "Python 语法单位、类型转换、容器、JSON 编码、API/SDK、HTTP、幂与幂等、信任边界、Git/Commit";
  curriculum.audit[2] = {
    lessonCount: levelThree.length,
    questionCount: 28,
    sequence: "AI/ML 地图 → 数据语言 → 学习类型 → 任务类型 → 项目流程 → 数据切分 → 基线 → 泛化 → 数据质量 → 混淆矩阵 → 指标阈值 → 因果 → 漂移监控 → 综合案例"
  };
  curriculum.audit[3] = {
    lessonCount: levelFour.length,
    questionCount: 28,
    sequence: "神经元 → 训练推理 → 损失 → 梯度下降 → 反向传播 → Token → Embedding → 位置 → Attention → Transformer Block → LLM 训练 → 生成采样 → 上下文与幻觉 → 综合链路"
  };
  curriculum.version = "20260728-depth2";
})();
