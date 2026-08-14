# 验证状态

## 发布前静态检查

通过：

- git diff --check
- git diff --cached --check
- 全部顶层 JavaScript 的 node --check
- index.html 内联脚本编译
- AI从业者闯关之路.html 内联脚本编译
- 精确暂存文件检查：只有 4 个目标源码文件
- 提交后已跟踪工作树与暂存区干净

## 本地 HTTP 检查

临时服务器绑定 127.0.0.1:4173 后：

- 主页面：200 text/html
- unified-learning-upgrade.css：200 text/css
- unified-learning-upgrade.js：200 text/javascript
- pixel-guild-upgrade.js：200 text/javascript

服务器在验证后已停止。

## 浏览器功能回归

本轮浏览器 QA 已覆盖：

- 无表达用户看到真正空状态，不自动生成整关待办。
- 空状态可直接进入训练。
- 个人表达和疑问进行 HTML 转义，不作为标签执行。
- 单课卡审核包包含课程、当前回答和当前疑问。
- 含糊回执被拒绝。
- 需要修改回执可保存。
- 修改回答会让旧回执失效。
- 修改疑问会让旧回执失效。
- 未重新复制当前版本时不能保存旧反馈。
- 重新复制并保存通过回执后计为确认。
- 刷新后状态持续存在。
- 不同关卡数据相互隔离。
- 1170、390、320 像素宽度无页面级横向溢出。
- 焦点陷阱、Escape 关闭和关闭后焦点归还。
- 筛选重绘保持焦点与滚动。
- 高关卡标签保持当前项可见并带当前位置语义。
- 控制台无错误。

## 线上发布检查

GitHub Pages：

- 运行 #12 对 66feaf6 构建成功。
- 根页与课程页 HTTP 200。
- 线上主 HTML 和 unified-learning-upgrade.js 与本地逐字节一致。
- 实页加载 review3 资源。
- 首页“我的复盘”可见。
- 对话框打开后内容正确。
- warn/error 日志为空。

Cloudflare Pages：

- /course HTTP 200。
- 本轮四个核心响应与本地 66feaf6 逐字节一致。

## 未覆盖或仍需观察

- 用户本人尚未在本次交接中完成一轮真实 Codex 对话往返并评价摩擦。
- 没有迁移或读取任何真实用户 localStorage。
- 没有把模拟窄屏等同于所有真实手机浏览器。
- localStorage quota 失败时的成功提示健壮性仍是低概率改进项。
- 旧 pixel-guild-upgrade.js 的 execCommand 复制回退未检查返回值，是既有低优先级问题。

## 结论

代码、构建、发布和线上实页均通过，可以称为已部署。真实用户学习质量与跨域进度迁移不在这次“已部署”结论内。
