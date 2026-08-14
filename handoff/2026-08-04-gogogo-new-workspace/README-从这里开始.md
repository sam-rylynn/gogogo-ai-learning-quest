# GOGO GO 新工作区交接入口

更新时间：2026-08-04  
原工作区：`/Users/hao/Claude/Artifacts/gogogo-ai-coach-review`  
远端仓库：`https://github.com/sam-rylynn/gogogo-ai-learning-quest.git`

## 先确认三层状态

1. 线上已发布：`main@af0c6e3ef9c4131ac661b23f555d3d0daa0305fb`。
2. 当前本地：在该提交之上有 5 个文件的未提交修改，已放入 `working-tree-after-af0c6e3.patch`。
3. 最新本地修改：未做浏览器验证、未提交、未推送、未部署，不得描述为线上版本。

公开入口：<https://sam-rylynn.github.io/gogogo-ai-learning-quest/AI%E4%BB%8E%E4%B8%9A%E8%80%85%E9%97%AF%E5%85%B3%E4%B9%8B%E8%B7%AF.html>

## 推荐恢复方式：保留 Git 历史

```bash
PACKAGE="/Users/hao/Claude/Artifacts/gogogo-ai-coach-review/handoff/2026-08-04-gogogo-new-workspace"
NEW_WORKSPACE="/你选择的新目录/gogogo-ai-coach-review"

git clone "$PACKAGE/gogogo-repository-af0c6e3.bundle" "$NEW_WORKSPACE"
cd "$NEW_WORKSPACE"
git remote set-url origin https://github.com/sam-rylynn/gogogo-ai-learning-quest.git
git apply --check "$PACKAGE/working-tree-after-af0c6e3.patch"
git apply "$PACKAGE/working-tree-after-af0c6e3.patch"
git status --short
```

预期 `git status --short` 只出现以下 5 个修改文件：

```text
AI从业者闯关之路.html
pixel-guild-upgrade.css
pixel-guild-upgrade.js
unified-learning-upgrade.css
unified-learning-upgrade.js
```

## 快速恢复方式：不保留 Git 历史

```bash
mkdir -p "/你选择的新目录/gogogo-ai-coach-review"
tar -xzf "/Users/hao/Claude/Artifacts/gogogo-ai-coach-review/handoff/2026-08-04-gogogo-new-workspace/gogogo-working-tree-source-20260804.tar.gz" \
  -C "/你选择的新目录/gogogo-ai-coach-review"
```

## 新任务读取顺序

1. 本文件。
2. `PROJECT-STATE.md`。
3. `MEMORY-CONTEXT.md`。
4. `GIT-STATUS.txt`、`DIFF-STAT.txt`、`BASELINE.env`。
5. 再检查新工作区实时 Git 状态，不要只相信交接快照。

## 禁止动作

- 不要在未读交接前执行 `git reset --hard`、`git checkout --` 或 `git clean -fd`。
- 不要用 `git pull` 覆盖补丁恢复出的本地改动。
- 不要把“代码存在”描述为“已验证”或“已部署”。
- 不要假设浏览器学习进度会随源码自动迁移。

## 下一步建议

先在本地浏览器验证最新 5 个文件的视觉和学习流程，再决定是否修正、提交及发布。
