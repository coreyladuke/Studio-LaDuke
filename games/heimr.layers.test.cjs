const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'heimr.html'),'utf8');
const system=JSON.parse(fs.readFileSync(path.join(__dirname,'assets','heimr','visual-system.json'),'utf8'));
const sceneMatch=html.match(/const openingScene=(\[[\s\S]*?\n\]);\nfunction segmentDistance/);
assert.ok(sceneMatch,'layered opening scene data must be declared independently of rendering');
const scene=Function(`return ${sceneMatch[1]}`)();

assert.deepEqual(system.runtimeLayers,['ground','terrain','structure','interactive','actors','foreground','atmosphere','ui'],
  'visual system must lock the complete runtime layer order');
assert.match(html,/const SCENE_LAYER_ORDER=\['ground','terrain','structure','interactive','actors','foreground','atmosphere','ui'\]/,
  'game must use the authoritative runtime layer order');

const required=['cabin-porch','woodpile-side-path','muddy-trail','spruce-cluster-a','spruce-cluster-b',
  'alder-brush-barrier','rock-root-gate','creek-bank','cedar-log-crossing','shore-dock-edge',
  'fern-salmonberry','trail-sign-clearing','blue-light-discovery'];
for(const id of required){
  const motif=scene.find(m=>m.id===id);
  assert.ok(motif,`${id} must be a playable runtime motif`);
  assert.ok(Array.isArray(motif.source)&&motif.source.length===4,`${id} needs a source crop`);
  assert.ok(Array.isArray(motif.dest)&&motif.dest.length===4,`${id} needs world dimensions`);
  assert.ok(Array.isArray(motif.anchor)&&motif.anchor.length===2,`${id} needs an anchor`);
  assert.equal(typeof motif.occlusion,'string',`${id} needs depth behavior`);
  assert.equal(typeof motif.state,'string',`${id} needs a state`);
}

const collisionOwners=new Set(scene.flatMap(m=>m.collision.map(()=>m.id)));
for(const id of ['cabin-porch','woodpile-side-path','spruce-cluster-a','spruce-cluster-b',
  'alder-brush-barrier','rock-root-gate','creek-bank','cedar-log-crossing'])
  assert.ok(collisionOwners.has(id),`${id} must own visible collision geometry`);

const alder=scene.find(m=>m.id==='alder-brush-barrier');
assert.equal(alder.collision[0].gate,'brush','alder collision must be removed by its cut state');
const crossing=scene.find(m=>m.id==='cedar-log-crossing');
assert.equal(crossing.collision[0].gate,'bridge','crossing collision must be removed by its wedged state');
const creek=scene.find(m=>m.id==='creek-bank');
assert.equal(creek.collision[0].type,'line','visible creek water must use its authored line geometry');

assert.match(html,/openingScene\.filter\(m=>m\.layer==='foreground'\).*actors\.push/,
  'foreground motifs must join actor Y sorting');
assert.match(html,/function drawDebugCollision\(\).*sceneCollisions/s,
  'debug view must expose collision ownership and scene layers');
assert.match(html,/k==='q'.*debugCollision=!debugCollision/,
  'debug collision view must have a non-persistent keyboard toggle');
assert.match(html,/function drawLoadingState\(\)/,
  'asset loading must use an intentional visual handoff');
assert.match(html,/criticalAssetsReady\(\).*drawLoadingState\(\)/,
  'the scene must not flash fallback art while critical assets load');
assert.match(html,/const kp=\[\[1072,535\]/,
  'the hidden blue bead must render at the same alder-cache position used by interaction');

console.log('HEIMR layered scene graph, visible collision, loading, occlusion, and debug view: OK');
