import {rooms,exits,viewpoints} from './house-layout.mjs';
import {slots,assetKey,baseline,record,change,active,defaults,boundsDefault,source} from './house-assets.mjs';
import {renderScene} from './house-scene.mjs';
const $=id=>document.getElementById(id);
const fill=(element,items)=>element.replaceChildren(...items.map(([value,label])=>new Option(label,value)));
const status=message=>$('status').textContent=message;
const room=$('room'),view=$('view'),slot=$('slot'),variant=$('variant'),history=$('history'),portal=$('portal');
let state,key,draft,selected,epoch=0,dispose=()=>{},audioURL;
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
  materialize();draft.alignment={...draft.alignment,[name]:value};paint();
 });
 const edge=portal.value;
 const edit=draft||state.versions.find(item=>item.id===selected);
 fields('boundaries',edit?.boundaries?.[edge]||boundsDefault,{x:[0,99],y:[0,99],width:[1,100],height:[1,100]},(name,value)=>{
  if(!edge)return;
  materialize();
  draft.boundaries={...draft.boundaries,[edge]:{...boundsDefault,...draft.boundaries?.[edge],[name]:value}};
  paint();
 });
}
function materialize(){
 if(!draft){
  const old=state.versions.find(item=>item.id===selected)||active(key,state);
  draft={desktop:old?.desktop,mobile:old?.mobile,name:old?.name||'Alignment only',alignment:{...defaults,...old?.alignment},boundaries:{...old?.boundaries}};
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
 const clean1=display('current',old,false),clean2=display('candidate',candidate,true);
 dispose=()=>{clean1();clean2();};
 $('comparison-label').textContent=draft||!candidate?'Replacement':'Selected version';
 $('save').disabled=!draft;
 $('approve').disabled=!draft&&candidate?.status!=='draft';
 $('reject').disabled=!candidate;
 $('restore').disabled=!selected||selected===state.active||selected!=='baseline'&&candidate?.status!=='approved';
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
 key=next;state=result;draft=null;selected=state.active;
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
$('file').onchange=safe(async()=>{
 const file=$('file').files[0],token=epoch,selectedVariant=variant.value;
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
 materialize();draft={...draft,[selectedVariant]:file,name:file.name};
 refreshFields();paint();status('Replacement ready to compare.');
});
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
  if(action==='approved')entry.active=id;
  if(action==='rejected'&&entry.active===id)entry.active='baseline';
 });
 if(epoch!==currentEpoch)return;
 state=next;selected=id;draft=null;
 historyList();refreshFields();paint();status({draft:'Draft saved.',approved:'Approved for this browser’s walk.',rejected:'Version rejected.'}[action]);
 await inventory();
}
$('save').onclick=safe(()=>save('draft'));
$('approve').onclick=safe(()=>save('approved'));
$('reject').onclick=safe(()=>save('rejected'));
$('restore').onclick=safe(async()=>{
 const target=selected,token=epoch;
 const next=await change(key,entry=>{
  if(target==='baseline'||entry.versions.some(v=>v.id===target&&v.status==='approved'))entry.active=target;
 });
 if(token!==epoch)return;
 state=next;draft=null;historyList();refreshFields();paint();status('Version restored.');await inventory();
});
await safe(async()=>{room.value='UP-LAN';await roomChanged();await inventory();})();
