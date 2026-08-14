# GOGO GO 项目进度

## 当前结论

提交 66feaf6 feat: replace key notes with evidence-based review 已提交、推送并部署。

- 本地 main、origin/main 跟踪引用和 GitHub 远端 main 均为 66feaf6。
- GitHub Pages 运行 #12 成功。
- GitHub Pages 公开实页已打开并验证“我的复盘”，控制台无警告或错误。
- Cloudflare Pages 的 course HTML、pixel-guild-upgrade.js、unified-learning-upgrade.css 和 unified-learning-upgrade.js 与本地 66feaf6 逐字节一致。
- 当前已跟踪工作树干净。

## 项目目标

用单页网页承载 AI 从业者的课程、训练、错题和学习进度；Codex 负责解释、追问、语义审核和长期反馈。产品不依赖 Claude，也不假装网页可以自动读取 Codex 对话。

## 已发布能力

### 学习主线

- 14 个学习关卡。
- 基础课程与高级证书扩展。
- 高级阶段 64 张课卡、128 道题的数据契约。
- 初学者导读、术语词卡、每课理解表达。
- 判断题和选择题训练、即时审核、错题回课卡和间隔复训。
- 三个 localStorage 状态键保持兼容。

### 首页与任务板

- 六个场景入口统一使用课程书库的视觉标准。
- 中央任务板保持在场景边界内，不使用蒙版。
- 任务板上半部分显示 GOGOGO，下半部分显示当前最新进度按钮。
- 旧的大型当前关卡背景板已移除。
- 场景人物保持在任务板前景层。

### “我的复盘”

- 旧“重点笔记”已替换为“我的复盘”。
- 复盘只保留学习者自己的表达、真实疑问、当前错题、最近训练证据和 Codex 回执。
- 没有表达时是真正空状态，不自动制造 8 个待办。
- 复盘不阻塞训练；学习者可先训练诊断，再回来处理真实问题。
- 单课卡审核采用显式链路：复制审核包 → 粘贴到 Codex → 带回三行反馈 → 保存。
- 网页不会自动读取 Codex 对话，复制动作也不会自动确认理解。
- 回答、疑问或课程内容变化后，旧回执立即失效并等待重新审核。
- 旧 keyNoteReviewed 数据仅为兼容保留，不再参与 UI、流程或训练门槛。

### 可用性与无障碍

- 模态框支持焦点陷阱、Escape 关闭和焦点归还。
- 同视图重绘保留滚动、筛选按钮焦点和关卡横向位置。
- 页面允许浏览器缩放。
- 当前导航、关卡标签和筛选器补充 aria-current、aria-pressed 与分组语义。
- 1170、390、320 像素宽度验证无横向溢出。

## 当前源码与产品产物

### Git 内

- 发布提交：66feaf6e6aa5c29a1e9f496a55bbc726be5791a3。
- 本轮提交涉及 4 个文件，907 行新增、164 行删除：
  - AI从业者闯关之路.html
  - pixel-guild-upgrade.js
  - unified-learning-upgrade.css
  - unified-learning-upgrade.js

### Git 外

- 推广文案/2026-08-13-AI证书内测推文-修订版.md
- 本地 QA 截图、design-qa.md 和历史学习资料均受 .gitignore 管理。
- 上述有价值材料已进入完整源码归档和独立未跟踪/忽略归档，但没有进入 66feaf6。

## 已验证范围

- git diff --check。
- 全部顶层 JavaScript 的 node --check。
- index.html 和主页面内联脚本编译。
- 本地 HTML、CSS、JS HTTP 200 与正确 MIME。
- 表达、疑问、回执、签名失效、刷新持久化和关卡隔离。
- 空状态可直接训练。
- 回执歧义拒绝、需修改、确认和重新送审。
- 焦点、滚动、窄屏布局和控制台错误。
- GitHub Pages 构建与公开实页。
- 两个公网通道的四个本轮核心文件哈希与 66feaf6 一致。

## 仍需真实用户观察

- 用户本人是否理解“复制到 Codex、再把三行反馈带回网页”的往返。
- 三行回执是否足以支持真实语义审核，还是需要更结构化的反馈模板。
- 长期学习后 localStorage 容量和保存失败提示的健壮性。
- 真机触控、系统字体缩放和不同移动浏览器下的长期体验。

这些不是当前部署失败；它们是下一轮产品验证问题。

## 发布与数据边界

- GitHub Pages 与 Cloudflare Pages 当前核心版本相同，但属于不同域名和独立发布通道。
- file://、127.0.0.1、GitHub Pages、Cloudflare Pages 是不同 origin。
- 浏览器进度不会自动同步，本交接包不含用户 localStorage。
- 推广中的“连续 3 次达到 85 分”是产品训练门槛，不是任何发证机构的报名或考试规则。
