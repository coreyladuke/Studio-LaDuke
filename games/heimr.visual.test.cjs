const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const html=fs.readFileSync(path.join(root,'heimr.html'),'utf8');
const systemPath=path.join(root,'assets','heimr','visual-system.json');
const visualPage=fs.readFileSync(path.join(root,'heimr-visual-system.html'),'utf8');
const system=JSON.parse(fs.readFileSync(systemPath,'utf8'));

assert.equal(system.camera.projection,'three-quarter overhead','visual system must lock the gameplay projection');
assert.deepEqual(system.camera.spriteCell,[72,72],'every playable actor must share one sprite cell');
assert.equal(system.characters.maverick.renderHeight,60,'Maverick runtime scale must be authoritative');
assert.equal(system.characters.dad.renderHeight,74,'Dad must stay taller than Maverick');
assert.ok(system.characters.dad.renderHeight/system.characters.maverick.renderHeight>1.2,'adult-child scale needs a visible difference');
assert.equal(system.characters.maverick.proportionRule.includes('giant-headed'),true,'the rejected proportion must be explicitly prohibited');
assert.ok(system.environmentMotifs.length>=12,'the first reusable environment library must cover outdoor and indoor motifs');

const required=[
  'world/forest-master-v1.webp','world/home-master-v1.webp',
  'reference/chapter-one-character-master-v1.png',
  'reference/heimr-promotional-master-v1.webp',
  'reference/gameplay-camera-target-v1.webp',
  'reference/environment-scenes-v1.webp',
  'reference/shadow-0.webp','reference/shadow-1.webp','reference/shadow-2.webp','reference/shadow-3.webp'
];
for(const file of required){
  const full=path.join(root,'assets','heimr',file);
  assert.ok(fs.existsSync(full),`${file} must ship with the visual system`);
  assert.ok(fs.statSync(full).size>1000,`${file} must contain a real image asset`);
}

assert.ok(html.includes("art.forest.src='assets/heimr/world/forest-master-v1.webp'"),'game must load the reusable forest master');
assert.ok(html.includes("art.home.src='assets/heimr/world/home-master-v1.webp'"),'game must load the reusable home master');
assert.ok(html.includes("'assets/heimr/reference/shadow-0.webp'"),'shadow frames must be external reusable assets');
assert.ok(!html.includes("art.forest.src='data:image"),'forest painting must not remain trapped in the HTML payload');
assert.ok(!html.includes("art.home.src='data:image"),'home painting must not remain trapped in the HTML payload');
assert.ok(html.length<150000,'external assets must keep the playable document lightweight');
assert.ok(visualPage.includes('environmentMotifs'),'visual reference must render the named motif library');
assert.ok(visualPage.includes('chapter-one-character-master-v1.png'),'visual reference must show the exact playable character master');

console.log('HEIMR master character, world, motif, reference, and external-asset system: OK');
