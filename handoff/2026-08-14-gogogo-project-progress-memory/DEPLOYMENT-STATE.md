# 部署状态

核验时间：2026-08-14 15:29 CST  
发布提交：66feaf6e6aa5c29a1e9f496a55bbc726be5791a3

## GitHub

- 仓库：https://github.com/sam-rylynn/gogogo-ai-learning-quest
- 分支：main
- 远端 refs/heads/main：66feaf6e6aa5c29a1e9f496a55bbc726be5791a3
- 本地与 origin/main 左右差异：0 / 0
- 提交说明：feat: replace key notes with evidence-based review

## GitHub Pages

- 公开根页：https://sam-rylynn.github.io/gogogo-ai-learning-quest/
- 课程页：https://sam-rylynn.github.io/gogogo-ai-learning-quest/AI%E4%BB%8E%E4%B8%9A%E8%80%85%E9%97%AF%E5%85%B3%E4%B9%8B%E8%B7%AF.html
- 动态工作流：pages build and deployment
- 运行编号：#12
- 运行 ID：31779834346
- 运行地址：https://github.com/sam-rylynn/gogogo-ai-learning-quest/actions/runs/31779834346
- 构建 SHA：66feaf6e6aa5c29a1e9f496a55bbc726be5791a3
- 结论：success
- deployment ID：5902255096
- build、deploy、report-build-status：全部 success

公开浏览器验证：

- 页面标题：GOGO GO · AI 从业者闯关之路 v2
- 页面加载 pixel-guild-upgrade.js?v=20260812-review3
- 页面加载 unified-learning-upgrade.js?v=20260812-review3
- 页面加载 unified-learning-upgrade.css?v=20260812-review3
- 首页可见“我的复盘”。
- “我的复盘”对话框可打开，空状态、Codex 交接说明和 14 个关卡可见。
- 控制台 warn/error：0。

## Cloudflare Pages

- 项目：gogogo-ai-quest
- 根页：https://gogogo-ai-quest.pages.dev/
- 课程页：https://gogogo-ai-quest.pages.dev/course
- 来源方式：2026-08-13 的静态文件上传，不是 GitHub 自动构建。
- 历史上传记录：18 个文件，使用 ASCII 路径 course.html。
- 当前公开状态：HTTP 200。

2026-08-14 对以下四个公开响应做了逐字节比较，均与 66feaf6 本地文件完全一致：

- course 响应 ↔ AI从业者闯关之路.html
- pixel-guild-upgrade.js
- unified-learning-upgrade.css
- unified-learning-upgrade.js

这证明本轮关键页面与三个改动资源一致；没有保存历史上传 ZIP，因此不把“完整 18 文件历史清单逐项可追溯”描述为已证明。

## 核心文件 SHA-256

    e9d0f40a5436d39e5817909c204b85840ff7201f4092c3ef4b0c362fb5fdaf7d  AI从业者闯关之路.html
    cf4d7dda63e5cd2af7882923debd33ae84d57f179b33552ada22d6853b1bccb2  pixel-guild-upgrade.js
    5f53ddefc56886191c7d365327c6f90043c98b5cfd50a35c47440d30a94fbdb9  unified-learning-upgrade.css
    3cbd9fc5c503cc9fcb038b3f8fc85d8e9418a80540e97e135be78db7455925de  unified-learning-upgrade.js

GitHub Pages 与 Cloudflare Pages 返回的上述文件均匹配这些值。

## 本地与数据边界

- 本地预览入口曾使用 http://127.0.0.1:4173/，临时服务器已停止。
- GitHub Pages、Cloudflare Pages、本地预览是三个独立 origin。
- localStorage 学习进度不会自动迁移。
- 本交接包不包含浏览器 cookie、凭据或 localStorage。

## 运维提醒

本机 gh CLI 的 sam-rylynn 令牌已失效；本次 Git push 使用可用的 Git 凭据成功完成，公开 API 与线上验证也已完成。未来如需用 gh 管理需认证的设置，应先执行 gh auth login。
