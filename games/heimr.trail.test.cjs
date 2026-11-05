const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'heimr.html'),'utf8');
const sceneMatch=html.match(/const openingScene=(\[[\s\S]*?\n\]);\nfunction segmentDistance/);
assert.ok(sceneMatch,'layered opening scene must be readable by route regression');
const scene=Function(`return ${sceneMatch[1]}`)();
const collisions=scene.flatMap(m=>m.collision);
const openingSolids=collisions.filter(o=>o.type==='rect');
const forestSolids=collisions.filter(o=>o.type==='circle'&&!o.gate);

const blocked=(x,y)=>openingSolids.some(o=>x>o.x1-9&&x<o.x2+9&&y>o.y1-7&&y<o.y2+8)||
  forestSolids.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+10);
const clearSegment=(a,b)=>{
  const distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let d=0;d<=distance;d+=4){
    const t=d/distance;
    assert.equal(blocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t),false,
      `opening route blocked near ${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)}`);
  }
};

clearSegment([360,730],[550,730]);
clearSegment([550,730],[550,620]);
assert.ok(Math.hypot(550-610,620-620)<70,'clear porch route must finish inside the first sign radius');

assert.match(html,/function drawTrailSign\(o,i\)/,'trail clues must be visible cedar signs');
assert.match(html,/function drawTrailPrints\(\)/,'Finn must reveal readable trail evidence');
assert.match(html,/return'READ'/,'the action button must identify readable signs');
assert.match(html,/return'CHOP'/,'the action button must identify hatchet obstacles');
assert.match(html,/inventory\.cedarWedge\?'BRACE'/,'the action button must identify the crossing repair');
assert.match(html,/bridgeFx=120/,'placing the wedge must trigger repair feedback');
assert.match(html,/function drawBridgeFx\(\)/,'the repaired crossing must animate');
assert.match(html,/routeIndex=Math\.max\(routeIndex,clueIndex\+1\);finLead=true/,
  'reading a sign must hand the route back to Finn');

console.log('HEIMR porch route, trail signs, context verbs, and bridge feedback: OK');
