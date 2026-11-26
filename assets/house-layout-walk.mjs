import {venues} from './house-venues.mjs';
import {initialize} from './world-sync.mjs';
import {rooms,exits,viewpoints} from './house-layout.mjs';
import {assetKey,active,record,baseline,source,readRoomConfig} from './house-assets.mjs';
import {renderScene} from './house-scene.mjs';
const $=id=>document.getElementById(id);
const fill=(element,items)=>element.replaceChildren(...items.map(([value,label])=>new Option(label,value)));
const stage=$('walk-stage'),ambient=$('ambient'),pending=new Map();
const params=new URLSearchParams(location.search);
let room=rooms[params.get('room')]?.id||'ENT-01',view=params.get('view')||'primary';
let dispose=()=>{},drawId=0,lastAudio,audioURL,soundOn=false,gesture,ignoreClick=false,activatedTouchDoor=false,moving=false,animation;
const settings=new Map();
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 650px)');
fill($('room'),Object.values(rooms).map(r=>[r.id,r.name]));
function getAsset(room,view,slot){
 const key=assetKey(room,view,slot);
 return record(key).then(state=>active(key,state)).catch(()=>baseline(key));
}
function preload(){
 for(const {destination} of exits(room)){
  if(pending.has(destination))continue;
  if(pending.size>=8)pending.delete(pending.keys().next().value);
  pending.set(destination,getAsset(destination,'primary','primary').then(asset=>{
   const path=mobile.matches?asset?.mobile||asset?.desktop:asset?.desktop||asset?.mobile;
   if(typeof path==='string'){const image=new Image();image.src=path;return image.decode().catch(()=>{});}
  }));
 }
}
function updateAudio(asset){
 const identity=asset?.id==='baseline' ? asset.desktop:asset?.id;
 if(identity===lastAudio)return;
 lastAudio=identity;
 if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null;}
 const resource=source(asset,mobile.matches);
 if(resource.release)audioURL=resource.url;
 if(resource.url)ambient.src=resource.url;
 else{ambient.removeAttribute('src');ambient.load();}
 if(soundOn&&resource.url)ambient.play().catch(()=>{});
}
async function draw(focus=false){
 const token=++drawId;
 const options=viewpoints(room);
 if(!options.some(item=>item.id===view))view='primary';
 const slots=['primary','reverse','background','foreground','environment','lighting','object-textures','ambient'];
 const assets=await Promise.all(slots.map(slot=>getAsset(room,view,slot)));
 const config=await readRoomConfig(room).catch(()=>({}));
 if(token!==drawId)return;
 const layers=Object.fromEntries(slots.map((slot,i)=>[slot,assets[i]]));
 if(view==='reverse'&&layers.reverse)layers.primary=null;
 const art=layers.reverse||layers.primary;
 const spec=rooms[room];
 dispose();
 const roomSettings=settings.get(room)||{};
 stage.classList.toggle('dimmed',Boolean(roomSettings.dimmed));
 stage.classList.toggle('window-open',Boolean(roomSettings.window));
 dispose=renderScene(stage,{room,view,layers,boundaries:art?.boundaries,layerOrder:config.layerOrder,onCross:cross,onObject:interact,
  mark:art?'Artwork · approved':'Dimensional placeholder'});
 stage.querySelector('.fixture.light')?.setAttribute('aria-pressed',String(Boolean(roomSettings.dimmed)));
 stage.querySelector('.fixture.window')?.setAttribute('aria-pressed',String(Boolean(roomSettings.window)));
 $('room-name').textContent=spec.name;
 $('venues').replaceChildren(...(venues[room]||[]).map(entry=>{
  const link=document.createElement('a');link.href=entry.url;link.textContent=entry.label;return link;
 }));
 $('elevation').textContent='Elevation '+spec.elevation.toFixed(2)+' m · provisional layout';
 $('room').value=room;fill($('view'),options.map(item=>[item.id,item.name]));$('view').value=view;
 $('turn').textContent=view==='reverse'?'Face forward':'Turn around';
 updateAudio(layers.ambient);preload();
 if(focus)$('room-name').focus({preventScroll:true});
}
function interact(kind,button){
 const state=settings.get(room)||{};
 if(kind==='light'){state.dimmed=!state.dimmed;stage.classList.toggle('dimmed',state.dimmed);button.setAttribute('aria-pressed',String(state.dimmed));}
 if(kind==='window'){state.window=!state.window;stage.classList.toggle('window-open',state.window);button.setAttribute('aria-pressed',String(state.window));}
 if(kind==='object')$('message').textContent='Object inspected in '+rooms[room].name+'.';
 settings.set(room,state);
}
function updateHistory(){
 history.pushState({room,view},'', '?room='+encodeURIComponent(room)+'&view='+encodeURIComponent(view));
}
async function cross(edge){
 if(moving||ignoreClick)return;
 moving=true;
 const id=++drawId;
 $('message').textContent=edge.provisional?'Provisional connection.':'';
 if(!motion.matches&&stage.animate){
  animation=stage.animate([{opacity:1},{opacity:.32,transform:'translateY('+(edge.kind==='stairs'?(edge.rise>0?12:-12):0)+'px)'}],{duration:145,fill:'forwards'});
  try{await animation.finished;}catch{return;}
 }
 if(id!==drawId)return;
 room=edge.destination;view=edge.id;updateHistory();
 await draw(true);
 animation?.cancel();animation=null;moving=false;
}
function select(nextRoom,nextView){
 animation?.cancel();animation=null;moving=false;
 room=nextRoom;view=nextView;updateHistory();draw();
}
$('room').onchange=event=>select(event.target.value,'primary');
$('view').onchange=event=>select(room,event.target.value);
$('turn').onclick=()=>select(room,view==='reverse'?'primary':'reverse');
$('sound').onclick=async()=>{
 soundOn=!soundOn;
 if(soundOn&&ambient.getAttribute('src'))try{await ambient.play();}catch{soundOn=false;}
 else ambient.pause();
 $('sound').setAttribute('aria-pressed',String(soundOn));
};
stage.addEventListener('pointerdown',event=>{
 if(!event.isPrimary||event.button!==0||moving)return;
 ignoreClick=false;activatedTouchDoor=false;
 gesture={id:event.pointerId,x:event.clientX,y:event.clientY,door:event.pointerType==="touch"?event.target.closest("[data-portal]"):null};
});
stage.addEventListener('pointerup',event=>{
 if(gesture?.id!==event.pointerId)return;
 const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,door=gesture.door;
 gesture=null;
 if(Math.hypot(dx,dy)>12)ignoreClick=true;
 if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)){
  const options=viewpoints(room),at=options.findIndex(item=>item.id===view);
  select(room,options[(at+options.length+(dx<0?1:-1))%options.length].id);
 }else if(!ignoreClick&&door&&door===event.target.closest("[data-portal]")){activatedTouchDoor=true;door.click();}
});
stage.addEventListener('pointercancel',()=>{gesture=null;ignoreClick=true;});
stage.addEventListener('click',event=>{
 if((ignoreClick||activatedTouchDoor)&&event.detail){activatedTouchDoor=false;event.stopImmediatePropagation();event.preventDefault();}
 if(event.detail===0)ignoreClick=false;
},true);
document.addEventListener('keydown',event=>{
 if(event.target.matches('input,select,button')||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 const options=viewpoints(room),at=options.findIndex(item=>item.id===view);
 select(room,options[(at+options.length+(event.key==='ArrowRight'?1:-1))%options.length].id);
});
window.addEventListener('popstate',()=>{
 animation?.cancel();animation=null;moving=false;
 const query=new URLSearchParams(location.search);
 room=rooms[query.get('room')]?.id||'ENT-01';view=query.get('view')||'primary';draw();
});
mobile.addEventListener('change',()=>draw());
window.addEventListener('pageshow',()=>draw());
await initialize();
await draw();
