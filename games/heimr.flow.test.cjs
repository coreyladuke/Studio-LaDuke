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
const ctx=new Proxy({},{get(t,k){
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
class FakeImage{constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.src=''}}
const source=match[1].replace(/\}\)\(\);\s*$/, 'window.__probe={player,dragon,finn,inventory,get phase(){return phase},get dialog(){return dialog},get completed(){return completed},get bridgeFixed(){return bridgeFixed},get foodFound(){return foodFound},get flightStage(){return flightStage},interact,closeDialog,save};})();');
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
act('Talk Dad',318,725,'gear');
act('Hatchet',475,710,'meetFinn');
act('Meet Finn',418,738,'search');
act('First sign',610,620,'search');
act('Second sign',930,405,'search');
act('Take wedge',720,485,'search');
act('Bridge repair',820,460,'search');
assert.ok(g.bridgeFixed,'crossing now solid');
act('Find dragon',1265,188,'shard');next();g.interact();g.closeDialog();check('Make connection','return');
act('Home again',390,730,'careprep');
act('Blanket',225,492,'careprep');
act('Bowl',578,368,'careprep');
act('Extinguisher',880,770,'careprep');
act('Make bed',210,685,'careprep');g.closeDialog();check('Care prepared','food');
act('Herring eggs',1300,250,'food');
g.closeDialog();check('Fed Heimr','food');
g.closeDialog();check('First night completed','done');
g.closeDialog();check('Start lamp','lamp');
act('Coffee tin',990,650,'lamp');
act('Headlamp',1225,650,'lamp');
act('Dad builds starlight',1080,710,'wonder');
g.closeDialog();g.closeDialog();check('Move to flight','flight');
act('First flight',g.dragon.x,g.dragon.y,'flight');
act('Shadow appears',g.dragon.x,g.dragon.y,'attack');
act('Cross back to safety',820,460,'runend');
g.closeDialog();check('Open next chapter','run');
const saved=JSON.parse(store.get('heimr-save-slot-1'));
assert.equal(saved.foodFound,true,'serving state must persist');
assert.equal(saved.flightStage,2,'flight attempt must persist');
assert.equal(saved.phase,'run','chapter progress must persist');
console.log('HEIMR scripted opening-to-run progression: '+milestones+' milestones OK (DOM simulation, not device input testing)');