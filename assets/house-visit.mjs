import {initialize} from './world-sync.mjs';
import {readRoomConfig} from './house-assets.mjs';
import {defaultFlight,start,stoopStart,objects,hallLocation,entryOccupied,moveCamera,visible,objectPose,objectAction,renderer,project} from './house-dimensional.mjs';
const $=id=>document.getElementById(id);
const canvas=$('world'),dialog=$('visit-inspect'),audio=$('ambient-rain'),status=$('visit-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const state={},animated={},keys=new Set();
const saved=['entry-door','console-switch','console-drawer','rain-window'];
try{
 const prior=JSON.parse(sessionStorage.getItem('studio-house-fixtures')||'{}');
 for(const id of saved)if(typeof prior[id]==='boolean')state[id]=prior[id];
}catch{}
function persistFixtures(){
 try{sessionStorage.setItem('studio-house-fixtures',JSON.stringify(Object.fromEntries(saved.map(id=>[id,Boolean(state[id])]))));}catch{}
}
await initialize({catalog:false});
const config=await readRoomConfig("ENT-01").catch(()=>({}));
const flight=config.stairs||defaultFlight;
const placed=objects.map(object=>{
 const placement=config.objects?.[object.id];
 return {...object,...placement,radius:(placement?.radius??object.radius)*(placement?.scale??1)};
});
const entryFraction=()=>animated['entry-door']||0;
const fixturePose=object=>objectPose(object,entryFraction(),animated['console-drawer']||0);
const entryFromStoop=new URLSearchParams(location.search).get('entry')==='stoop';
let camera={...(entryFromStoop?stoopStart:start)}, graphics,gesture,move=0,turn=0,selected,last=0,active=true,nearbyKey='',lastDraw=0,audioContext,melody=[];
function fallback(){
 active=false;canvas.hidden=true;$('fallback').hidden=false;
 for(const id of ['objects','interact','look-target'])$(id).hidden=true;
 document.querySelector('.visit-movement').hidden=true;
}
try{graphics=renderer(canvas);}catch(error){console.error(error);}
if(!graphics)fallback();
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
function message(value){status.textContent=value;}
function rainLevel(){
 const multiplier=hallLocation(camera.x,camera.z,flight)==='Front Stoop'?2.05:1+.55*entryFraction();
 return Math.min(1,(config.rainVolume??.15)*multiplier);
}
function fixtureSound(kind){
 if(audio.paused||!['door','drawer','light','window'].includes(kind))return;
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio)return;
 try{
  audioContext ||= new Audio();
  audioContext.resume().catch(()=>{});
  const now=audioContext.currentTime;
  const click=audioContext.createOscillator(),volume=audioContext.createGain();
  click.type='triangle';
  click.frequency.setValueAtTime(kind==='light'?280:92,now);
  click.frequency.exponentialRampToValueAtTime(kind==='light'?145:47,now+.055);
  volume.gain.setValueAtTime(.023,now);
  volume.gain.exponentialRampToValueAtTime(.0001,now+.09);
  click.connect(volume).connect(audioContext.destination);
  click.start(now);click.stop(now+.10);
 }catch{}
}
function startMusic(){
 if(melody.length)return;
 audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
 audioContext.resume().catch(()=>{});
 const t=audioContext.currentTime+.05;
 const notes=[196,246.94,293.66,329.63,293.66,246.94,220,196];
 const buffer=audioContext.createBuffer(1,Math.round(audioContext.sampleRate*6),audioContext.sampleRate);
 const data=buffer.getChannelData(0),rate=audioContext.sampleRate;
 for(let i=0;i<notes.length;i++){
  for(let k=0;k<Math.round(.66*rate);k++){
   const at=Math.round(i*.75*rate)+k,seconds=k/rate;
   const envelope=Math.min(1,seconds*48)*Math.exp(-seconds*6);
   data[at]+=.035*envelope*(Math.sin(2*Math.PI*notes[i]*seconds)+.18*Math.sin(4*Math.PI*notes[i]*seconds));
  }
 }
 const node=audioContext.createBufferSource();node.buffer=buffer;node.loop=true;
 const gain=audioContext.createGain();gain.gain.value=.8;node.connect(gain).connect(audioContext.destination);
 node.start(t);melody=[node,gain];
}
function stopMusic(){
 const [node,gain]=melody;
 if(node){node.stop();gain.disconnect();}
 melody=[];
}
function showInspection(object){
 const content=$('inspect-content');
 $('inspect-title').textContent=object.name;content.replaceChildren();
 if(object.kind==='art'){
  const img=document.createElement('img');img.src=object.src;img.alt='King salmon artwork from Studio LaDuke';content.append(img);
  const link=document.createElement('a');link.href='https://studioladuke.com/gallery.html';link.textContent='Visit the artwork collection';content.append(link);
 }else{
  const p=document.createElement('p');
  p.textContent=object.kind==='book'?'House notebook, November. Rain in the yard again. Leave the lamp on if someone is still upstairs.':
   'A folded note, tucked in the cedar drawer. “The rain sounds different on the upstairs glass.”';
  if(object.kind==='book'){
   const spread=document.createElement('div');spread.className='book-spread';
   const previous=document.createElement('span');previous.textContent='Studio LaDuke';
   spread.append(previous,p);content.append(spread);
  }else content.append(p);
 }
 if(!dialog.open)dialog.showModal();
}
function interact(object){
 if(!object||!visible(camera,fixturePose(object),entryFraction())||dialog.open||document.hidden)return;
 if(object.id==='entry-door'&&state['entry-door']&&entryOccupied(camera.x)){
  message('Step clear of the doorway before closing it.');return;
 }
 const result=objectAction(state,object);
 if(saved.includes(object.id))persistFixtures();
 fixtureSound(result.type);
 switch(result.type){
 case 'door':message(result.on?'Front door opened.':'Front door closed.');break;
 case 'light':message(result.on?'Lamp off.':'Lamp on.');break;
 case 'drawer':message(result.on?'Drawer opened.':'Drawer closed.');break;
 case 'window':message(result.on?'Window ajar.':'Window closed.');break;
 case 'music':if(result.on)startMusic();else stopMusic();message(result.on?'Record player on.':'Record player off.');break;
 case 'art':case 'book':case 'discovery':showInspection(object);break;
 case 'stairs':message('Walk between the rails to go upstairs.');break;
 }
}
function targetAt(x,y){
 return placed.filter(o=>!o.requires||state[o.requires]).map(o=>[o,fixturePose(o)])
 .filter(([,pose])=>visible(camera,pose,entryFraction())).map(([o,pose])=>[o,project(camera,pose,canvas.clientWidth,canvas.clientHeight)])
 .filter(([,point])=>point&&Math.hypot(point.x-x,point.y-y)<Math.max(19,Math.min(110,point.r)))
 .sort((a,b)=>a[1].z-b[1].z)[0]?.[0];
}
function updateObjects(){
 const next=targetAt(canvas.clientWidth/2,canvas.clientHeight/2);
 if(next!==selected){selected=next;$('interact').hidden=!next;$('interact').textContent=next?.name||'';}
 const candidates=placed.filter(o=>(!o.requires||state[o.requires])&&visible(camera,fixturePose(o),entryFraction()));
 const key=candidates.map(o=>o.id).join();
 if(nearbyKey!==key){nearbyKey=key;$('nearby').replaceChildren(...candidates.map(o=>{
  const button=document.createElement('button');button.type='button';button.textContent=o.name;
  button.onclick=()=>interact(o);return button;
 }));}
}
$('interact').onclick=()=>interact(selected);
canvas.addEventListener('pointerdown',event=>{
 if(!event.isPrimary||event.button!==0||dialog.open)return;
 gesture={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:camera.yaw,pitch:camera.pitch,drag:false};
 canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
 if(gesture?.id!==event.pointerId)return;
 const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
 gesture.drag ||= Math.hypot(dx,dy)>8;
 if(gesture.drag){
  camera.yaw=gesture.yaw-dx*.006;
  camera.pitch=Math.max(-.75,Math.min(.75,gesture.pitch+dy*.004));
 }
});
canvas.addEventListener('pointerup',event=>{
 if(gesture?.id!==event.pointerId)return;
 const tap=!gesture.drag&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<=8;gesture=null;
 if(tap){const box=canvas.getBoundingClientRect();interact(targetAt(event.clientX-box.left,event.clientY-box.top));}
});
canvas.addEventListener('pointercancel',()=>gesture=null);
document.addEventListener('keydown',event=>{
 if(dialog.open||!active||event.target.matches('input,button,a,summary'))return;
 const key=event.key.toLowerCase();
 if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(key)){keys.add(key);event.preventDefault();}
 if(key==='enter'){interact(selected);event.preventDefault();}
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();move=turn=0;});
function hold(id,set,value){
 const button=$(id);
 button.onpointerdown=event=>{button.setPointerCapture(event.pointerId);set(value);};
 button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>set(0);
 button.onclick=event=>{
  if(event.detail===0){
   if(id.includes('look'))camera.yaw+=value*.18;
   else camera=moveCamera(camera,Math.sin(camera.yaw)*value*.23,Math.cos(camera.yaw)*value*.23,entryFraction(),flight);
  }
 };
}
hold('advance',value=>move=value,1);hold('recede',value=>move=value,-1);
hold('left-look',value=>turn=value,-1);hold('right-look',value=>turn=value,1);
$('rain').onclick=async()=>{
 if(!audio.paused)audio.pause();
 else try{audio.volume=rainLevel();await audio.play();}catch{message('Rain audio is unavailable.');}
 $('rain').setAttribute('aria-pressed',String(!audio.paused));
};
window.addEventListener('pagehide',()=>{audio.pause();stopMusic();state['record-player']=false;});
let quality=1, paceSamples=0, paceTotal=0;
function frame(time){
 if(!active)return;
 const elapsed=time-(last||time);last=time;
 const dt=Math.min(.05,elapsed/1000);
 if(!document.hidden&&elapsed>0&&elapsed<100){
  paceSamples++;paceTotal+=elapsed;
  if(paceSamples===45){
   if(paceTotal/paceSamples>19&&quality>.70)quality=Math.max(.70,quality*.86);
   paceSamples=paceTotal=0;
  }
 }
 if(!document.hidden&&!dialog.open){
  const forward=move+Number(keys.has('w'))-Number(keys.has('s')),side=Number(keys.has('d'))-Number(keys.has('a'));
  camera.yaw+=(turn+Number(keys.has('arrowright'))-Number(keys.has('arrowleft')))*dt*1.66;
  camera.pitch=Math.max(-.75,Math.min(.75,camera.pitch+(Number(keys.has('arrowup'))-Number(keys.has('arrowdown')))*dt*.7));
  const speed=1.12*dt/Math.max(1,Math.hypot(forward,side));
  if(forward||side)camera=moveCamera(camera,(Math.sin(camera.yaw)*forward+Math.cos(camera.yaw)*side)*speed,
   (Math.cos(camera.yaw)*forward-Math.sin(camera.yaw)*side)*speed,entryFraction(),flight);
  for(const key of ['entry-door','console-drawer']){
   const value=state[key]?1:0;
   const previous=animated[key]||0;
   animated[key]=reduced.matches||Math.abs(value-previous)<.001?value:previous+(value-previous)*Math.min(1,dt*9);
  }
  const drawInterval=1000/30;
  if(!lastDraw||time-lastDraw>=drawInterval-.65){
   lastDraw=time-Math.min(17,Math.max(0,time-lastDraw-drawInterval));
   graphics.render(camera,{...state,...animated},reduced.matches?0:time,config,quality);
   const room=hallLocation(camera.x,camera.z,flight);
   if($('room-title').textContent!==room)$('room-title').textContent=room;
   if(!audio.paused)audio.volume+=(rainLevel()-audio.volume)*.18;
   updateObjects();
   canvas.dataset.bearing=camera.yaw.toFixed(3);canvas.dataset.room=room;canvas.dataset.coords=[camera.x,camera.z].map(n=>n.toFixed(3)).join(',');canvas.dataset.eye=camera.y.toFixed(3);
  }
 }
 requestAnimationFrame(frame);
}
if(graphics)requestAnimationFrame(frame);
