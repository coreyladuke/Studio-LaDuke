const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'heimr.html'), 'utf8');

for (const direction of ['w', 'a', 's', 'd']) {
  assert.match(html, new RegExp(`data-hold="${direction}"`), `missing ${direction} D-pad control`);
}

assert.doesNotMatch(html, /\.dpad\{display:none!important\}/, 'mobile D-pad must stay visible');
assert.match(html, /height:100dvh/, 'mobile game should fill the viewport');
assert.match(html, /if\(phase==='briefing'&&!introSeen\)enterWoodline\(\)/, 'fresh launch must begin the egg cinematic');
assert.match(html, /function enterWoodline\(\)\{phase='intro';introStep=0;introFrame=0;introStartedAt=performance\.now\(\)\}/, 'fresh launch must reset the cinematic clock');
assert.match(html, /drawTopDownIntroScene\(\)/, 'egg cinematic must use the top-down renderer');
assert.match(html, /elapsed>4800\|\|pressed\.e\|\|pressed\.enter/, 'egg cinematic must auto-finish by elapsed time and remain skippable');
assert.match(html, /function bindTap\(/, 'touch actions need pointer and click fallback');
assert.match(html, /phase,objective,inventory/, 'save data must include the current objective');
assert.match(html, /saved\.objective\|\|resumeObjective\(phase\)/, 'older saves must rebuild the correct objective');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.ok(scripts.length, 'expected an inline game script');
for (const source of scripts) new Function(source);

console.log('HEIMR launch, controls, fullscreen layout, and script syntax: OK');
