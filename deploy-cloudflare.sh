#!/bin/bash
# 一键部署 gogogo-ai-quest 到 Cloudflare Pages（直接上传模式）
# 用法: ./deploy-cloudflare.sh
set -euo pipefail
cd "$(dirname "$0")"

STAGE=".cf-upload"
rm -rf "$STAGE"
mkdir -p "$STAGE"

# 显式白名单：课程文件 + 独立证书导航 + AI应用站
if ! cmp -s "AI从业者闯关之路.html" index.html; then
  echo "发布中止：index.html 与主课程 HTML 不一致，请先同步两个入口文件。" >&2
  exit 1
fi

cp advanced-certificate-expansion.js \
   ai-tools.css ai-tools-data.js ai-tools.js ai-tools.html \
   ai-station-data.js ai-station.js aihot-snapshot.js \
   certificate-library.css certificate-library-data.js certificate-library.js certificates.html \
   curriculum-beginner-reading.js \
   curriculum-depth-upgrade.js \
   curriculum-detail-expansion.js \
   curriculum-reflection-prompts.js \
   glossary-cards.css glossary-cards.js \
   pixel-guild-upgrade.css pixel-guild-upgrade.js progress-backup.js \
   unified-learning-upgrade.css unified-learning-upgrade.js \
   "$STAGE/"
cp index.html "$STAGE/course.html"
cp index.html "$STAGE/index.html"
mkdir -p "$STAGE/assets/fonts"
cp assets/pixel-guild-hall.webp \
   assets/pixel-learner-portrait.webp \
   assets/pixel-quest-board.webp \
   "$STAGE/assets/"
cp assets/fonts/fusion-pixel-12px-proportional-zh-hans.woff2 \
   assets/fonts/LICENSE-OFL.txt \
   "$STAGE/assets/fonts/"

npx --yes wrangler@latest pages deploy "$STAGE" \
  --project-name=gogogo-ai-quest \
  --branch=main \
  --commit-dirty=true

rm -rf "$STAGE"
echo "部署完成: https://gogogo-ai-quest.pages.dev/course"
