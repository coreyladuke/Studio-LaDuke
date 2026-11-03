const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'heimr.html'), 'utf8');

for (const direction of ['w', 'a', 's', 'd']) {
  assert.match(html, new RegExp(`data-hold="${direction}"`), `missing ${direction} D-pad control`);
}

assert.doesNotMatch(html, /\.dpad\{display:none!important\}/, 'mobile D-pad must stay visible');
assert.match(html, /height:100dvh/, 'mobile game should fill the viewport');
assert.match(html, /if\(phase==='briefing'&&!introSeen\)enterWoodline\(\)/, 'fresh launch must enter the top-down Woodline directly');
assert.doesNotMatch(html, /play\.onclick=.*phase='intro'/, 'launch must not return to the side-view intro');
assert.match(html, /function bindTap\(/, 'touch actions need pointer and click fallback');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.ok(scripts.length, 'expected an inline game script');
for (const source of scripts) new Function(source);

console.log('HEIMR launch, controls, fullscreen layout, and script syntax: OK');
