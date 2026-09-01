const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

test("both public course entries ship the same safe-area mobile build", () => {
  const index = read("index.html");
  const legacy = read("AI从业者闯关之路.html");

  assert.equal(index, legacy);
  assert.match(index, /width=device-width, initial-scale=1\.0, viewport-fit=cover/);
  assert.match(index, /unified-learning-upgrade\.css\?v=20260901-mobile1/);
});

test("portrait home uses an independent centered board and touch-sized actions", () => {
  const css = read("unified-learning-upgrade.css");
  const start = css.indexOf("@media (max-width: 760px) and (orientation: portrait)");
  const end = css.indexOf("@media (max-width: 340px) and (orientation: portrait)");
  const portrait = css.slice(start, end);

  assert.ok(start > 0 && end > start);
  assert.match(portrait, /--camera-x: 0px !important/);
  assert.match(portrait, /height: calc\(60px \+ env\(safe-area-inset-top\)\)/);
  assert.match(portrait, /padding: calc\(5px \+ env\(safe-area-inset-top\)\)/);
  assert.match(portrait, /pixel-quest-board\.webp/);
  assert.match(portrait, /transform: translate\(-50%, -50%\)/);
  assert.match(portrait, /\.pg-foreground-actors[\s\S]*display: none/);
  assert.match(portrait, /\.pg-board-link[\s\S]*min-height: 44px/);
  assert.match(portrait, /\.pg-primary\[data-home-progress\][\s\S]*min-height: 48px/);
  assert.match(portrait, /grid-template-columns: repeat\(7, minmax\(44px, 1fr\)\)/);
  assert.doesNotMatch(portrait, /translate\(calc\([^)]*camera-x/);
});

test("short landscape phones get a dedicated unclipped composition", () => {
  const css = read("unified-learning-upgrade.css");
  const marker = "@media (orientation: landscape) and (min-width: 480px) and (max-width: 960px) and (max-height: 520px)";
  const start = css.indexOf(marker);
  const landscape = css.slice(start);

  assert.ok(start > 0);
  assert.match(landscape, /--camera-x: 0px !important/);
  assert.match(landscape, /top: 41%/);
  assert.match(landscape, /150dvh - 200px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)/);
  assert.match(landscape, /width: min\(620px,/);
  assert.match(landscape, /grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);
  assert.match(landscape, /height: 48px/);
  assert.match(landscape, /\.pg-location-strip button[\s\S]*min-height: 44px/);
  assert.match(landscape, /\.pg-board-link[\s\S]*min-height: 44px/);
  assert.match(landscape, /\.pg-primary\[data-home-progress\][\s\S]*min-height: 48px/);
});

test("mobile viewport height and safe areas are explicitly supported", () => {
  const css = read("unified-learning-upgrade.css");

  assert.match(css, /@supports \(height: 100dvh\)/);
  assert.match(css, /height: 100dvh/);
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /env\(safe-area-inset-right\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});
