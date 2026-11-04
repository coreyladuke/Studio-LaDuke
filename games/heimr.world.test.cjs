const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'heimr.html'),'utf8');
const start=html.indexOf('const trailLine='),end=html.indexOf('function update(){',start);
assert.ok(start>=0&&end>start,'world collision source should be present');
const collisionSource=html.slice(start,end);
const makeWorld=(bridgeFixed)=>new Function('bridgeFixed','brushCleared','cacheOpened','last','world',collisionSource+'\nreturn blocked;')(bridgeFixed,false,false,'forest',{w:3072,h:2048});
function reachable(blocked,target,radius=65){
  const step=8,seen=new Set(['360,730']),queue=[[360,730]],dirs=[[8,0],[-8,0],[0,8],[0,-8]];
  let i=0;
  while(i<queue.length){
    const [x,y]=queue[i++];
    if(Math.hypot(x-target[0],y-target[1])<radius)return true;
    for(const [dx,dy] of dirs){
      const nx=x+dx,ny=y+dy,key=nx+','+ny;
      if(nx<0||ny<0||nx>1536||ny>1024||seen.has(key)||blocked(nx,ny))continue;
      seen.add(key);queue.push([nx,ny]);
    }
  }
  return false;
}
const before=makeWorld(false),after=makeWorld(true);
assert.ok(reachable(before,[610,620]),'first trail sign must remain reachable');
assert.ok(reachable(before,[930,405]),'second trail sign must remain reachable');
assert.ok(reachable(before,[720,485]),'cedar wedge must remain reachable');
assert.ok(!reachable(before,[1265,188],20),'upper clearing must remain inaccessible across the creek before repair');
assert.ok(reachable(after,[1265,188],20),'clearing must become reachable after bracing the crossing');
assert.ok(before(820,460),'unbraced log should physically block crossing');
assert.ok(!html.includes('winged-sword-combat'),'retain original non-sword combat');
assert.match(html,/foodFound=!!saved\.foodFound/,'food progress must survive reload');
assert.match(html,/flightStage=Number\(saved\.flightStage\)\|\|0/,'flight progress must survive reload');
assert.match(html,/wonderTalk,foodFound,flightStage,shadowRepelled,introSeen/,'progress fields must be written to saves');
console.log('HEIMR terrain gating, item access, and progress persistence: OK');