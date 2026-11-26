import {initialize,onStatus,signIn,signOut} from './world-sync.mjs';
import {exportRoom,importRoom,downloadRoom} from './world-room-package.mjs';
import {rooms,exits,viewpoints} from './house-layout.mjs';
import {slots,assetKey,baseline,record,change,active,defaults,boundsDefault,source} from './house-assets.mjs';
import {renderScene} from './house-scene.mjs';
const $=id=>document.getElementById(id);
const fill=(element,items)=>element.replaceChildren(...items.map(([value,label])=>new Option(label,value)));
const status=message=>$('status').textContent=message;
const room=$('room'),view=$('view'),slot=$('slot'),variant=$('variant'),history=$('history'),portal=$('portal');
let state,key,draft,selected,epoch=0,dispose=()=>{},audioURL;
let undo=[],redo=[],drag;
fill(room,Object.values(rooms).map(r=>[r.id,r.name]));
fill(slot,slots.map(s=>[s,s.charAt(0).toUpperCase()+s.slice(1).replaceAll('-',' ')]));
function fields(id,values,ranges,update){
 const group=$(id);
 group.replaceChildren(...Object.entries(values).map(([name,value])=>{
  const label=document.createElement('label'),input=document.createElement('input');
  label.textContent=name.charAt(0).toUpperCase()+name.slice(1);
  input.type='number';input.value=value;input.min=ranges[name][0];input.max=ranges[name][1];
  input.oninput=()=>{
   if(!input.value||!input.validity.valid)return;
   update(name,Number(input.value));
  };
  label.append(input);
  return label;
 }));
}
function refreshFields(){
 fields('alignment',(draft||state.versions.find(item=>item.id===selected))?.alignment||defaults,{x:[-100,100],y:[-100,100],scale:[25,300],perspective:[-70,70]},(name,value)=>{
  materialize();checkpoint();draft.alignment={...draft.alignment,[name]:value};paint();
 });
 const edge=portal.value;
 const edit=draft||state.versions.find(item=>item.id===selected);
 fields('boundaries',edit?.boundaries?.[edge]||boundsDefault,{x:[0,99],y:[0,99],width:[1,100],height:[1,100]},(name,value)=>{
  if(!edge)return;
  materialize();checkpoint();
  draft.boundaries={...draft.boundaries,[edge]:{...boundsDefault,...draft.boundaries?.[edge],[name]:value}};
  paint();
 });
}
function materialize(){
 if(!draft){
  const old=state.versions.find(item=>item.id===selected)||active(key,state);
  draft={desktop:old?.desktop,mobile:old?.mobile,master:old?.master,name:old?.name||'Alignment only',alignment:{...defaults,...old?.alignment},boundaries:{...old?.boundaries}};
 }
}
function paint(){
 dispose();
 const old=active(key,state),candidate=draft||state.versions.find(v=>v.id===selected);
 const display=(stage,asset,preview)=>{
  const assetSlot=['depth','occlusion'].includes(slot.value)?'primary':slot.value;
  // Comparison uses the selected device asset even on a desktop screen.
  const visual=asset&&slot.value!=='ambient'?{...asset,desktop:asset[variant.value]||asset.desktop||asset.mobile,mobile:null}:null;
  return renderScene($(stage),{room:room.value,view:view.value,layers:visual?{[assetSlot]:visual}:{},
   boundaries:asset?.boundaries,mark:asset?(preview?'Candidate · '+(asset.status||'draft'):asset.status):'Dimensional placeholder'});
 };
 $('candidate').classList.toggle('editing',Boolean(draft&&slot.value!=='ambient'));
 $('undo-art').disabled=!undo.length;$('redo-art').disabled=!redo.length;
 const clean1=display('current',old,false),clean2=display('candidate',candidate,true);
 dispose=()=>{clean1();clean2();};
 $('comparison-label').textContent=draft||!candidate?'Replacement':'Selected version';
 $('save').disabled=!draft;
 $('approve').disabled=!draft&&candidate?.status!=='draft';
 $('reject').disabled=!candidate;
 $('publish').disabled=Boolean(draft)||candidate?.status!=='approved';
 $('restore').disabled=!selected||selected===state.active||selected!=='baseline'&&!['approved','published'].includes(candidate?.status);
 const audio=$('audio-preview');
 if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null;}
 audio.hidden=slot.value!=='ambient'||!(candidate||old);
 if(audio.hidden){audio.removeAttribute('src');audio.load();}
 else {
  const resource=source(candidate||old,variant.value==='mobile');
  if(resource.release)audioURL=resource.url;
  if(resource.url)audio.src=resource.url;
 }
}
function historyList(){
 fill(history,[['baseline','Original / placeholder'],...state.versions.map(v=>[v.id,v.name+' · '+v.status+' · '+new Date(v.created).toLocaleString()])]);
 history.value=selected;
}
async function load(){
 const token=++epoch;
 const next=assetKey(room.value,view.value,slot.value);
 status('');
 const result=await record(next);
 if(token!==epoch)return;
 key=next;state=result;draft=null;selected=state.active;undo=[];redo=[];
 for(const button of $('floor-plan').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.room===room.value));
 $('file').value='';
 $('file').accept=slot.value==='ambient'?'audio/mpeg,audio/wav,audio/ogg,audio/mp4':'image/jpeg,image/png,image/webp,image/avif';
 $('see-walk').href='house-layout.html?room='+encodeURIComponent(room.value)+'&view='+encodeURIComponent(view.value);
 historyList();refreshFields();paint();
}
function roomChanged(){
 fill(view,viewpoints(room.value).map(v=>[v.id,v.name]));
 fill(portal,exits(room.value).map(edge=>[edge.id,edge.label]));
 return load();
}
async function inventory(){
 const checks=await Promise.all(Object.values(rooms).flatMap(r=>viewpoints(r.id).map(async v=>{
  const key=assetKey(r.id,v.id,v.id==='reverse'?'reverse':'primary');
  const asset=active(key,await record(key));
  return asset&&(asset.desktop||asset.mobile)?null:r.name+' · '+v.name;
 })));
 const missing=checks.filter(Boolean);
 $('missing-count').textContent=missing.length+' scenery slots need artwork';
 $('missing').replaceChildren(...missing.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}
const safe=fn=>async event=>{try{await fn(event);}catch(error){status(error.message||'An asset operation failed.');}};
room.onchange=safe(roomChanged);view.onchange=slot.onchange=safe(load);
variant.onchange=paint;portal.onchange=refreshFields;
history.onchange=()=>{draft=null;selected=history.value;refreshFields();paint();};
async function importArtwork(file){
 const token=epoch,selectedVariant=variant.value;
 if(!file)return;
 if(file.size>24*1024*1024)throw new Error('Choose a file smaller than 24 MB.');
 const allowed=slot.value==='ambient'?/^audio\/(mpeg|wav|x-wav|ogg|mp4)$/:/^image\/(jpeg|png|webp|avif)$/;
 if(!allowed.test(file.type))throw new Error('Choose a supported file for this slot.');
 if(slot.value!=='ambient'){
  const temp=URL.createObjectURL(file);
  try{const image=new Image();image.src=temp;await image.decode();}
  finally{URL.revokeObjectURL(temp);}
 }
 if(token!==epoch)return;
 materialize();checkpoint();
 if(selectedVariant==='master'&&slot.value!=='ambient'){
  const pictureURL=URL.createObjectURL(file);
  try{
   const image=new Image();image.src=pictureURL;await image.decode();
   const variants=await Promise.all([1600,900].map(async width=>{
    const scale=Math.min(1,width/image.naturalWidth),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    return new Promise(resolve=>canvas.toBlob(blob=>resolve(blob||file),'image/webp',.84));
   }));
   if(token!==epoch)return;
   draft={...draft,master:file,desktop:variants[0],mobile:variants[1],name:file.name};
  }finally{URL.revokeObjectURL(pictureURL);}
 }else draft={...draft,[selectedVariant==='master'?'desktop':selectedVariant]:file,name:file.name};
 refreshFields();paint();status('Replacement ready to compare.');
}
$('file').onchange=safe(()=>importArtwork($('file').files[0]));
async function save(action){
 const currentKey=key;
 const currentEpoch=epoch;
 const revision=draft?{...draft,id:crypto.randomUUID(),created:Date.now(),status:action}:null;
 const id=revision?.id||selected;
 const next=await change(currentKey,entry=>{
  if(revision)entry.versions.push(revision);
  else {
   const item=entry.versions.find(version=>version.id===id);
   if(item)item.status=action;
  }
  if(['approved','published'].includes(action))entry.active=id;
  if(action==='rejected'&&entry.active===id)entry.active='baseline';
 });
 if(epoch!==currentEpoch)return;
 state=next;selected=id;draft=null;undo=[];redo=[];
 historyList();refreshFields();paint();status({draft:'Draft saved.',approved:'Approved for this browser’s walk.',rejected:'Version rejected.',published:'Published to this review storage.'}[action]);
 await inventory();
}
$('save').onclick=safe(()=>save('draft'));
$('approve').onclick=safe(()=>save('approved'));
$('reject').onclick=safe(()=>save('rejected'));
$('publish').onclick=safe(()=>save('published'));
$('restore').onclick=safe(async()=>{
 const target=selected,token=epoch;
 const next=await change(key,entry=>{
  if(target==='baseline'||entry.versions.some(v=>v.id===target&&['approved','published'].includes(v.status)))entry.active=target;
 });
 if(token!==epoch)return;
 state=next;draft=null;historyList();refreshFields();paint();status('Version restored.');await inventory();
});
function checkpoint(){undo.push(structuredClone(draft));redo=[];}
function step(from,to){if(!from.length)return;to.push(structuredClone(draft));draft=from.pop();refreshFields();paint();}
$('undo-art').onclick=()=>step(undo,redo);
$('redo-art').onclick=()=>step(redo,undo);
const candidate=$('candidate');
candidate.addEventListener('dragover',event=>{event.preventDefault();candidate.classList.add('drag-over');});
candidate.addEventListener('dragleave',()=>candidate.classList.remove('drag-over'));
candidate.addEventListener('drop',safe(async event=>{
 event.preventDefault();candidate.classList.remove('drag-over');
 await importArtwork(event.dataTransfer.files[0]);
}));
candidate.addEventListener('pointerdown',event=>{
 if(!draft||slot.value==='ambient'||event.button!==0)return;
 checkpoint();
 const boundary=event.target.closest('[data-portal]')?.dataset.portal;
 drag={x:event.clientX,y:event.clientY,alignment:{...draft.alignment},boundary,
  box:{...boundsDefault,...draft.boundaries?.[boundary]}};
 candidate.setPointerCapture(event.pointerId);
});
candidate.addEventListener('pointermove',event=>{
 if(!drag)return;
 const rect=candidate.getBoundingClientRect(),dx=(event.clientX-drag.x)*100/rect.width,dy=(event.clientY-drag.y)*100/rect.height;
 const limit=(value,min,max)=>Math.round(Math.max(min,Math.min(max,value)));
 if(drag.boundary)draft.boundaries={...draft.boundaries,[drag.boundary]:{...drag.box,
  x:limit(drag.box.x+dx,0,99),y:limit(drag.box.y+dy,0,99)}};
 else draft.alignment={...drag.alignment,x:limit(drag.alignment.x+dx,-100,100),y:limit(drag.alignment.y+dy,-100,100)};
 paint();
});
function endDrag(){if(drag){drag=null;refreshFields();}}
candidate.addEventListener('pointerup',endDrag);candidate.addEventListener('pointercancel',endDrag);
$('export-room').onclick=safe(async()=>{downloadRoom(await exportRoom(room.value));status('Room package exported.');});
$('import-room').onchange=safe(async()=>{
 const file=$('import-room').files[0];
 if(!file)return;
 if(file.size>125*1024*1024)throw new Error('Room package is too large.');
 const result=await importRoom(JSON.parse(await file.text()));
 room.value=result.room;await roomChanged();await inventory();status(result.count+' asset slots restored.');
 $('import-room').value='';
});
for(const [height,label] of [[0,'Ground'],[2.72,'Upstairs'],[5.2,'Attic'],[-2.72,'Basement']]){
 const section=document.createElement('section'),heading=document.createElement('h2');
 heading.textContent=label;section.append(heading);
 for(const entry of Object.values(rooms).filter(item=>item.elevation===height)){
  const button=document.createElement('button');
  button.textContent=entry.name;button.dataset.room=entry.id;
  button.onclick=safe(async()=>{room.value=entry.id;await roomChanged();});
  section.append(button);
 }
 $('floor-plan').append(section);
}
onStatus(value=>{
 $('storage-status').textContent=value==='connected'?'Shared storage connected. Changes are available across devices.':
  value==='locked'?'Shared storage is locked. Unlock it to load shared revisions.':
  'Browser-local review. Export room packages to back up or move your work. Shared storage is not configured.';
 $('owner-login').hidden=value!=='locked';
 $('owner-logout').hidden=value!=='connected';
});
$('owner-login').onsubmit=safe(async event=>{
 event.preventDefault();
 const password=$('owner-password');const value=password.value;password.value='';
 await signIn(value);await roomChanged();await inventory();
});
$('owner-logout').onclick=safe(async()=>{await signOut();await roomChanged();await inventory();});
await safe(async()=>{await initialize();room.value='UP-LAN';await roomChanged();await inventory();})();
