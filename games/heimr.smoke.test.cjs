const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'heimr.html'), 'utf8');

for (const direction of ['w', 'a', 's', 'd']) {
  assert.match(html, new RegExp(`data-hold="${direction}"`), `missing ${direction} D-pad control`);
}

assert.ok(html.includes('class="joystick" id="moveJoystick"'), 'floating joystick markup must exist');
assert.ok(html.includes('.touch-controls.joystick-ready .dpad{display:none!important}'), 'D-pad should hide only when joystick is ready');
assert.ok(html.includes('joyArea.setPointerCapture'), 'thumb movement must stay captured');
assert.ok(html.includes('if(analog.pointer!==null){dx=analog.x;dy=analog.y}'), 'analog axes must drive world motion');
assert.ok(html.includes('let speed=1.75*strength'), 'continuous analog speed required');
assert.ok(html.includes("document.addEventListener('visibilitychange'"), 'reset when app hidden');
assert.match(html, /height:100dvh/, 'mobile game should fill the viewport');
assert.match(html, /if\(phase==='briefing'&&!introSeen\)enterWoodline\(\)/, 'fresh launch must begin the egg cinematic');
assert.match(html, /function enterWoodline\(\)\{phase='intro';introStep=0;introFrame=0;introStartedAt=performance\.now\(\)\}/, 'fresh launch must reset the cinematic clock');
assert.match(html, /drawTopDownIntroScene\(\)/, 'egg cinematic must use the top-down renderer');
assert.match(html, /drawDetailedIntroScene\(\)/, 'egg cinematic must share the detailed forest renderer when art is ready');
assert.match(html, /elapsed>4800\|\|pressed\.e\|\|pressed\.enter/, 'egg cinematic must auto-finish by elapsed time and remain skippable');
assert.match(html, /function bindTap\(/, 'touch actions need pointer and click fallback');
assert.match(html, /phase,objective,inventory/, 'save data must include the current objective');
assert.match(html, /saved\.objective\|\|resumeObjective\(phase\)/, 'older saves must rebuild the correct objective');

assert.ok(html.includes('function drawContextAction(){'), 'nearby objectives must show a contextual action cue');
assert.ok(html.includes("if(phase==='flight')return[dragon.x,dragon.y,'HEIMR']"), 'first-flight interaction must have a visible mission marker');
assert.ok(html.includes("['shard','return','careprep','food','done','lamp','wonder','flight','attack','runend','run'].includes(phase))actors.push"), 'Heimr must remain visible through discovery, flight, and escape');
assert.ok(html.includes("['briefing','gear','meetFinn','search','return','flight','attack','runend'].includes(phase)"), 'Dad must remain visible during yard and escape scenes');
assert.match(html, /drawSceneLayer\('ground',\.[0-9]+\)/, 'the detailed forest must be assembled through the layered runtime');
assert.ok(html.includes("openingScene.filter(m=>m.layer==='foreground')"), 'forest canopies must share the actor depth sort');
assert.ok(html.includes("y:dragon.y,f:()=>dragonSprite"), 'Heimr must share the actor depth sort');
assert.ok(html.includes("canvas.addEventListener('pointerdown'"), 'the dialogue panel must advance directly when tapped');
assert.ok(html.includes("eb.className=next?'primary dialog-next':'primary'"), 'the mobile action button must clearly change during dialogue');
assert.ok(html.includes("drawWalkSheet('maverick',0,0,60"), 'Maverick must remain readable while staying child-sized beside Dad');
assert.ok(html.includes('function groundShadow('), 'characters need contact shadows that anchor their feet to the terrain');
assert.ok(html.includes("if(!shadowRepelled){toastMsg('The shadow blocks the crossing."), 'escape must require the star lamp milestone');
assert.ok(html.includes('id="gameStatus" role="status"'), 'runtime phase and objective need an accessible live status');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.ok(scripts.length, 'expected an inline game script');
for (const source of scripts) new Function(source);

console.log('HEIMR launch, controls, fullscreen layout, and script syntax: OK');
