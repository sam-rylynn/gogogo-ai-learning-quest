# GOGO GO 项目进度与记忆交接入口

快照时间：2026-08-14 15:29 CST  
原工作区：/Users/hao/Claude/Artifacts/gogogo-ai-coach-review  
远端仓库：https://github.com/sam-rylynn/gogogo-ai-learning-quest.git

## 先确认状态边界

1. Git 基线：main@66feaf6e6aa5c29a1e9f496a55bbc726be5791a3。
2. GitHub 远端：refs/heads/main 已实时核对为同一提交。
3. GitHub Pages：运行 #12 成功，公开页面已实测加载 20260812-review3。
4. Cloudflare Pages：公开 course 页面与三个本轮改动资源逐字节匹配 66feaf6。
5. 当前跟踪工作树干净；推广文案目录仍是未跟踪产品产物，没有进入 Git。
6. 浏览器学习进度属于 localStorage，不在 Git、源码归档或本交接包中。

公开入口：

- GitHub Pages：https://sam-rylynn.github.io/gogogo-ai-learning-quest/AI%E4%BB%8E%E4%B8%9A%E8%80%85%E9%97%AF%E5%85%B3%E4%B9%8B%E8%B7%AF.html
- Cloudflare Pages：https://gogogo-ai-quest.pages.dev/course

## 交接包先校验

在 ZIP 所在目录执行：

    shasum -a 256 -c GOGOGO-project-progress-memory-handoff-20260814.zip.sha256
    unzip -t GOGOGO-project-progress-memory-handoff-20260814.zip

解压后执行：

    cd 2026-08-14-gogogo-project-progress-memory
    shasum -a 256 -c SHA256SUMS
    PACKAGE="$PWD"
    BUNDLE_VERIFY_DIR="$(mktemp -d)/verify.git"
    git init --bare "$BUNDLE_VERIFY_DIR"
    git -C "$BUNDLE_VERIFY_DIR" bundle verify "$PACKAGE/gogogo-repository-66feaf6.bundle"

## 推荐恢复：保留 Git 历史

    PACKAGE="/交接包解压目录/2026-08-14-gogogo-project-progress-memory"
    NEW_WORKSPACE="/你选择的新目录/gogogo-ai-coach-review"

    git clone "$PACKAGE/gogogo-repository-66feaf6.bundle" "$NEW_WORKSPACE"
    cd "$NEW_WORKSPACE"
    git remote set-url origin https://github.com/sam-rylynn/gogogo-ai-learning-quest.git
    tar -xzf "$PACKAGE/workspace-untracked-and-ignored-20260814.tar.gz" -C "$NEW_WORKSPACE"
    git status --short --branch

预期结果：

- 分支 main 位于 66feaf6。
- 无已跟踪修改。
- Git 可见的未跟踪项目产物只有 推广文案/。
- QA 截图、设计记录和旧学习资料会恢复，但因 .gitignore 规则保持忽略。

本快照没有 working-tree patch，因为提交后已跟踪工作树为干净状态；恢复时不应凭空应用补丁。

## 快速恢复：不保留 Git 历史

    mkdir -p "/你选择的新目录/gogogo-ai-coach-review"
    tar -xzf "/交接包解压目录/2026-08-14-gogogo-project-progress-memory/gogogo-working-tree-source-20260814.tar.gz" \
      -C "/你选择的新目录/gogogo-ai-coach-review"

该源码归档包含当前工作区内有价值的源码、推广文案、学习资料与 QA 证据；排除 .git、handoff、.DS_Store 和浏览器 localStorage。

## 新任务读取顺序

1. 本文件。
2. PROJECT-STATE.md。
3. MEMORY-CONTEXT.md。
4. DECISIONS-SINCE-20260804.md。
5. DEPLOYMENT-STATE.md 与 VALIDATION-STATE.md。
6. BASELINE.env、GIT-STATUS.txt、PRODUCT-WORKTREE-STATUS.txt。
7. 再检查恢复工作区的实时 Git 和线上状态，不要只相信快照。

## 保护规则

- 不要执行 git reset --hard、git checkout -- 或 git clean -fd 来“整理”恢复目录。
- 不要把 推广文案/ 静默加入网站源码提交。
- 不要把 Cloudflare 已上线等同于由 GitHub 自动部署；两者是独立发布通道。
- 不要把“代码存在”“工作流成功”“用户已验收”混为同一状态。
- 不要假设 localStorage 会随源码或域名迁移。

## 当前最有价值的下一步

让真实学习者手动走一遍：完成一张课卡表达 → 复制审核包到 Codex → 带回三行反馈 → 修改表达 → 再次送审。代码和自动化浏览器链路已通过，但真实用户的理解质量与操作摩擦仍需观察。
