const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'heimr.html'),'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,'game script should exist');
const nodes=new Map();
function node(id){
  if(!nodes.has(id))nodes.set(id,{id,hidden:true,style:{},dataset:{},
    classList:{add(){},remove(){}},textContent:'',innerHTML:'',
    addEventListener(){},setAttribute(){},focus(){},setPointerCapture(){},
    getBoundingClientRect(){return{left:0,top:0,width:170,height:170}},
    querySelector(q){return node(id+q)}});
  return nodes.get(id);
}
const buttons=['w','a','s','d'].map(k=>{const b=node('move'+k);b.dataset.hold=k;return b});
const actions=['e','f','m'].map(k=>{const b=node('act'+k);b.dataset.press=k;return b});
const drawSources=[];
const ctx=new Proxy({drawImage(image){drawSources.push(path.basename(image.src))}},{get(t,k){
  if(k==='measureText')return txt=>({width:String(txt).length*7});
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});
  return t[k]||(()=>{});
},set(t,k,v){t[k]=v;return true}});
const canvas=node('game');canvas.getContext=()=>ctx;
const document={querySelector:q=>q==='#game'?canvas:node(q),
  querySelectorAll:q=>q==='[data-hold]'?buttons:q==='[data-press]'?actions:[],
  getElementById:node,addEventListener(){}};
const store=new Map(),localStorage={getItem:k=>store.get(k)||null,
  setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const window={PointerEvent:function(){},addEventListener(){}};
class FakeImage{constructor(){this.complete=true;this.naturalWidth=1536;this.naturalHeight=1024;this.src=''}}
const source=match[1].replace(/\}\)\(\);\s*$/, 'window.__probe={player,dragon,dad,finn,inventory,get phase(){return phase},get dialog(){return dialog},get completed(){return completed},get bridgeFixed(){return bridgeFixed},get trailClues(){return trailClues},get foodFound(){return foodFound},get flightStage(){return flightStage},get shadowHits(){return shadowHits},get shadowRepelled(){return shadowRepelled},testReadyLamp(){lampCooldown=0},interact,closeDialog,useStarLamp,save,blocked,draw};})();');
assert.ok(source.includes('window.__probe'),'game test instrumentation should attach');
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (window,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
const g=window.__probe;
let milestones=0;
const check=(label,phase)=>{assert.equal(g.phase,phase,label);milestones++};
const next=()=>{if(g.dialog)g.closeDialog()};
const act=(label,x,y,phase)=>{next();g.player.x=x;g.player.y=y;g.interact();check(label,phase)};
check('New save', 'briefing');
node('playButton').onclick();check('Start intro','intro');
g.interact();check('Egg handoff','briefing');
for (const [x,y] of [[360,730],[540,605]]) {
  // Both positions are walkable but overlap the old opaque foreground crops.
  Object.assign(g.player,{x,y});
  assert.equal(g.blocked(x,y),false,'regression position must be walkable');
  drawSources.length=0;
  g.draw();
  const playerIndex=drawSources.indexOf('maverick-walk.png');
  assert.ok(playerIndex>drawSources.lastIndexOf('forest-master-v1.webp'),
    'all opaque scenery must render before Maverick');
}
act('Talk Dad',318,725,'gear');
act('Hatchet',475,710,'meetFinn');
act('Meet Finn',418,738,'search');
act('First sign',610,620,'search');
const openingResumeWindow={PointerEvent:function(){},addEventListener(){}};
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (openingResumeWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
assert.equal(openingResumeWindow.__probe.phase,'search','layered opening checkpoint must reload on the trail');
assert.deepEqual([openingResumeWindow.__probe.player.x,openingResumeWindow.__probe.player.y],[610,620],'opening checkpoint must restore the exact trail position');
assert.equal(openingResumeWindow.__probe.trailClues[0],true,'opening checkpoint must restore the first sign');
act('Second sign',930,405,'search');
act('Take wedge',720,485,'search');
act('Bridge repair',820,460,'search');
assert.ok(g.bridgeFixed,'crossing now solid');
act('Find dragon',1265,188,'shard');next();g.interact();g.closeDialog();check('Make connection','return');
act('Home again',390,730,'careprep');
for(const [x,y] of [[300,315],[700,412],[1260,630],[790,713],[69,630]]){
  assert.ok(g.blocked(x,y),'painted furniture, walls and trim must block cabin movement');
}
const paths=[[g.player.x,g.player.y]];
const reachable=new Set([paths[0].join(',')]);
for(const [x,y] of paths){
  for(const [dx,dy] of [[5,0],[-5,0],[0,5],[0,-5]]){
    const next=[x+dx,y+dy];
    const key=next.join(',');
    if(!reachable.has(key)&&!g.blocked(...next)){
      reachable.add(key);
      paths.push(next);
    }
  }
}
const cabinAct=(label,x,y,phase)=>{
  assert.ok(reachable.has([x,y].join(',')),label+' must be reachable from the cabin entrance');
  act(label,x,y,phase);
};
cabinAct('Blanket',360,525,'careprep');
cabinAct('Bowl',550,445,'careprep');
cabinAct('Extinguisher',875,665,'careprep');
cabinAct('Make bed',345,675,'careprep');g.closeDialog();check('Care prepared','food');
cabinAct('Herring eggs',1265,410,'food');
g.closeDialog();check('Fed Heimr','food');
g.closeDialog();check('First night completed','done');
assert.equal(g.completed,false,'dinner is a midpoint, not chapter completion');
g.closeDialog();check('Start lamp','lamp');
cabinAct('Coffee tin',1145,555,'lamp');
cabinAct('Headlamp',1145,625,'lamp');
cabinAct('Dad builds starlight',1050,630,'wonder');
g.closeDialog();g.closeDialog();check('Move to flight','flight');
act('First flight',g.dragon.x,g.dragon.y,'flight');
const flightResumeWindow={PointerEvent:function(){},addEventListener(){}};
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (flightResumeWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
assert.equal(flightResumeWindow.__probe.phase,'flight','first-flight checkpoint must reload in the yard');
assert.deepEqual([flightResumeWindow.__probe.dragon.x,flightResumeWindow.__probe.dragon.y],[500,685],'Heimr must reload beside the porch');
assert.deepEqual([flightResumeWindow.__probe.dad.x,flightResumeWindow.__probe.dad.y],[390,730],'Dad must reload beside the flight lesson');
act('Shadow appears',g.dragon.x,g.dragon.y,'attack');
next();g.player.x=820;g.player.y=460;g.interact();check('Crossing blocked before lamp','attack');
g.player.x=g.dragon.x;g.player.y=g.dragon.y;
g.useStarLamp();
assert.equal(g.shadowHits,1,'first star-lamp pulse must stagger, not finish, the shadow');
assert.equal(g.shadowRepelled,false,'one pulse must not clear the crossing');
g.testReadyLamp();g.useStarLamp();
assert.equal(g.shadowHits,2,'second star-lamp pulse must advance the encounter');
assert.equal(g.shadowRepelled,false,'two pulses must not clear the crossing');
g.testReadyLamp();g.useStarLamp();
assert.equal(g.shadowHits,3,'third star-lamp pulse must complete the encounter');
assert.equal(g.shadowRepelled,true,'three star-lamp pulses must repel the shadow before escape');
act('Cross back to safety',820,460,'runend');
assert.equal(g.completed,false,'the chapter remains incomplete until the closing scene is acknowledged');
const resumedWindow={PointerEvent:function(){},addEventListener(){}};
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (resumedWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
const resumed=resumedWindow.__probe;
assert.equal(resumed.phase,'runend','final checkpoint must reload at the closing scene');
assert.equal(resumed.dialog?.kind,'end','final checkpoint must restore its closing dialogue');
resumed.closeDialog();
assert.equal(resumed.phase,'run','closing the restored scene must finish the chapter');
assert.equal(resumed.completed,true,'chapter completion must be recorded only after the escape');
g.closeDialog();check('Open next chapter','run');
assert.equal(g.completed,true,'chapter completion must be recorded after the escape');
const saved=JSON.parse(store.get('heimr-save-v8-slot-1'));
assert.equal(saved.foodFound,true,'serving state must persist');
assert.equal(saved.flightStage,2,'flight attempt must persist');
assert.equal(saved.phase,'run','chapter progress must persist');
assert.equal(store.has('heimr-save-slot-1'),false,'a fresh v8 adventure must not overwrite a legacy slot');
const legacy={version:6,phase:'search',objective:'Legacy trail objective',inventory:{campHatchet:true},x:610,y:620,finnX:640,finnY:610,trailClues:[true,false,false],bridgeFixed:false};
store.set('heimr-active-slot','2');
store.set('heimr-save-slot-2',JSON.stringify(legacy));
const migrationWindow={PointerEvent:function(){},addEventListener(){}};
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (migrationWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
assert.equal(migrationWindow.__probe.phase,'search','a v6 slot must open in the richer game');
assert.equal(migrationWindow.__probe.player.x,610,'legacy player position must migrate');
migrationWindow.__probe.save();
assert.deepEqual(JSON.parse(store.get('heimr-save-slot-2')),legacy,'migration must leave the rollback save untouched');
assert.equal(JSON.parse(store.get('heimr-save-v8-slot-2')).version,8,'continued progress must write to the new v8 slot');
const cabinSave={version:8,last:'home',phase:'careprep',x:700,y:412,inventory:{blanket:true}};
store.set('heimr-active-slot','3');
store.set('heimr-save-v8-slot-3',JSON.stringify(cabinSave));
const cabinResumeWindow={PointerEvent:function(){},addEventListener(){}};
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm',source)
  (cabinResumeWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true);
const cabinResume=cabinResumeWindow.__probe;
assert.ok(!cabinResume.blocked(cabinResume.player.x,cabinResume.player.y),'old cabin saves inside furniture must resume on nearby walkable floor');
assert.ok(cabinResume.inventory.blanket,'relocating a cabin save must preserve its objectives and inventory');
const cabinVisitWindow={PointerEvent:function(){},addEventListener(){}};
const beforeVisit=new Map(store);
new Function('window','document','Image','localStorage','performance','requestAnimationFrame','setTimeout','clearTimeout','confirm','location',source)
  (cabinVisitWindow,document,FakeImage,localStorage,{now:()=>1000},()=>{},()=>0,()=>{},()=>true,{search:'?scene=cabin'});
const cabinVisit=cabinVisitWindow.__probe;
assert.equal(cabinVisit.phase,'careprep','the direct cabin link must start at the cabin visit');
cabinVisit.save();
assert.deepEqual(store,beforeVisit,'a cabin visit must leave all chapter saves alone');
console.log('HEIMR scripted opening-to-run progression: '+milestones+' milestones OK (DOM simulation, not device input testing)');
