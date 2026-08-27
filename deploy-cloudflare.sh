#!/bin/bash
# 一键部署 gogogo-ai-quest 到 Cloudflare Pages（直接上传模式）
# 用法: ./deploy-cloudflare.sh
set -euo pipefail
cd "$(dirname "$0")"

STAGE=".cf-upload"
rm -rf "$STAGE"
mkdir -p "$STAGE"

# 与线上一致的 18 个文件
cp advanced-certificate-expansion.js \
   curriculum-beginner-reading.js \
   curriculum-depth-upgrade.js \
   curriculum-detail-expansion.js \
   curriculum-reflection-prompts.js \
   glossary-cards.css glossary-cards.js \
   pixel-guild-upgrade.css pixel-guild-upgrade.js \
   unified-learning-upgrade.css unified-learning-upgrade.js \
   "$STAGE/"
cp "AI从业者闯关之路.html" "$STAGE/course.html"
cp "AI从业者闯关之路.html" "$STAGE/index.html"
cp -R assets "$STAGE/assets"

npx --yes wrangler@latest pages deploy "$STAGE" \
  --project-name=gogogo-ai-quest \
  --branch=main \
  --commit-dirty=true

rm -rf "$STAGE"
echo "部署完成: https://gogogo-ai-quest.pages.dev/course"
