const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const html=fs.readFileSync(path.join(root,'heimr.html'),'utf8');
const assets=['maverick-walk.png','dad-walk.png','finn-trot.png','heimr-walk.png'];

for(const file of assets){
  const full=path.join(root,'assets','heimr',file);
  assert.ok(fs.existsSync(full),`${file} must ship with the game`);
  const png=fs.readFileSync(full);
  assert.equal(png.toString('ascii',1,4),'PNG',`${file} must be PNG`);
  assert.equal(png.readUInt32BE(16),216,`${file} must use three 72px columns`);
  assert.equal(png.readUInt32BE(20),288,`${file} must use four 72px direction rows`);
}

assert.match(html,/const SPRITE_CELL=72/, 'walk sheets must use a shared pixel grid');
assert.match(html,/\[0,1,2,1\]\[Math\.floor\(walk\*2\)%4\]/, 'walk animation must use two contact poses and a passing pose');
assert.match(html,/row=directionFrame\(dir\),col=walkColumn/, 'all actors must select a directional row and gait column');
assert.match(html,/player\.moving=true/, 'Maverick movement must drive the gait');
assert.match(html,/finn\.walk\+=\.12;finn\.moving=true/, 'Finn must visibly trot while following');
assert.match(html,/dad\.dir=Math\.atan2\(player\.y-dad\.y,player\.x-dad\.x\)/, 'Dad must turn toward Maverick');

assert.match(html,/const openingSolids=/, 'opening art needs authored solid geometry');
assert.match(html,/sceneCollisions\.some\(o=>sceneBlocksPoint/, 'opening solids must participate in collision');
assert.match(html,/const SCENE_LAYER_ORDER=/, 'opening art needs an explicit layer order');
assert.match(html,/openingScene\.filter\(m=>m\.layer==='foreground'\)/, 'foreground motifs must share the actor depth sort');

assert.match(html,/canvas\.addEventListener\('pointerdown'.*if\(!dialog\)return/s, 'dialogue panel must be tappable');
assert.match(html,/return dialog\.choices\?'CHOOSE':dialog\.kind==='comic'\?'PAGE':'NEXT'/, 'dialogue must expose a clear forward action');
for(const verb of ['TALK','TAKE','USE','ACT'])assert.ok(html.includes(`return'${verb}'`)||html.includes(`:'${verb}'`),`A button must support ${verb}`);
assert.ok(html.includes("if(phase==='gear')return Math.hypot(player.x-475,player.y-710)<90?'TAKE':'ACT'"),'hatchet label must use the same pickup radius as the interaction');
assert.match(html,/pickupFx=90/, 'hatchet pickup must trigger visible feedback');
assert.match(html,/CAMP HATCHET  \+1/, 'hatchet pickup must identify the obtained item');

assert.match(html,/@media\(max-width:600px\) and \(orientation:portrait\).*canvas\{height:58%;width:100%;object-fit:cover;object-position:center top\}/s, 'portrait layout must devote more of the phone to a readable playfield');
assert.match(html,/bottom:max\(8%,calc\(env\(safe-area-inset-bottom\) \+ 10px\)\)/, 'portrait controls must use the lower deck while respecting the safe area');
assert.match(html,/function drawPortraitHud\(\)/, 'portrait crop must have a dedicated readable HUD composition');
assert.match(html,/function portraitDialogPanel\(\)/, 'portrait crop must keep dialogue and its button in view');
assert.match(html,/function drawIntroCaption\(text,prompt\).*x=portrait\?222:42/s, 'egg-cinematic captions must fit the same portrait crop as gameplay');
assert.match(html,/function mapPanel\(\).*x=portrait\?222:175/s, 'trail notes must fit the portrait-safe camera bounds');
assert.match(html,/function pausePanel\(\).*x=portrait\?222:205/s, 'pause panel must fit the portrait-safe camera bounds');
assert.match(html,/storageKey=key=>qaRun\?/, 'published fresh-save verification must be isolated from player saves');
assert.match(html,/localStorage\.setItem\(storageKey\('heimr-active-slot'\),String\(n\)\)/, 'save-slot selection must remain isolated during published QA runs');
assert.match(html,/localStorage\.setItem\(slotKey\(activeSlot\)/, 'normal save slots must remain persistent');

console.log('HEIMR opening sprite, depth, dialogue, pickup, mobile, and save regressions: OK');
