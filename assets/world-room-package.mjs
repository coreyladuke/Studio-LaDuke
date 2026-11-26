import {assetKey,baseline,record,slots,batchLocal,readRoomConfig} from './house-assets.mjs';
import {rooms,exits,viewpoints} from './house-layout.mjs';
import {encodeState,decodeState} from './world-portability.mjs';

export function productionBrief(room){
 const spec=rooms[room],portals=exits(room);
 const views=viewpoints(room).map(view=>{
  const edge=portals.find(edge=>edge.id===view.id);
  return {
   id:view.id,name:view.name,
   camera:{position:[0,spec.elevation+1.58,-spec.depth*.30],target:edge?rooms[edge.destination].name:view.name,
    yawDegrees:view.id==='reverse'?180:view.id==='primary'?0:null,verticalFovDegrees:65,calibration:'Provisional'},
   artwork:{master:[2440,1464],desktop:[1600,960],mobile:[900,1200],
    filenames:slots.map(slot=>room+'-'+view.id+'-'+slot+(slot==='ambient'?'.mp3':'.webp'))},
   approved:slots.flatMap(slot=>{const item=baseline(assetKey(room,view.id,slot));return item&&slot!=='ambient'?[item.desktop]:[];}),
   layers:['Foreground cutout','Background','Grayscale depth','Occlusion mask','Window or weather layer','Light overlay'],
   prompt:'Photographic interior of '+spec.name+' in a lived-in Southeast Alaska cedar house, '+view.name.toLowerCase()+
    ' viewpoint. Keep the documented openings and camera alignment. Match cool exterior daylight, warm wood and realistic perspective. Use the approved adjoining views as visual references.'
  };
 });
 return {room:spec,approvedAdjoiningReferences:portals.flatMap(edge=>{const asset=baseline(assetKey(edge.destination,'primary','primary'));return asset?[{room:rooms[edge.destination].name,path:asset.desktop}]:[];}),connections:portals.map(edge=>({id:edge.id,name:edge.label,to:rooms[edge.destination].name,kind:edge.kind,width:edge.width,height:edge.height})),views};
}
function placeholder(room){
 const label=rooms[room].name.replaceAll('&','&amp;').replaceAll('<','&lt;');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#504638"/><path d="M0 0L300 165H700L1000 0M0 600L300 415H700L1000 600" fill="none" stroke="#c8b58c" stroke-width="5"/><rect x="300" y="165" width="400" height="250" fill="#7d765e" stroke="#c8b58c"/><text x="500" y="300" text-anchor="middle" fill="white" font-size="24">'+label+'</text></svg>';
}
export async function exportRoom(room){
 const entries=[];
 for(const view of viewpoints(room))for(const slot of slots){
  const key=assetKey(room,view.id,slot),state=await record(key);
  if(state.versions.length)entries.push({key,state:await encodeState(state)});
 }
 return {format:'studio-laduke-world-room',version:1,room,brief:productionBrief(room),placeholder:{filename:room+'-placeholder.svg',svg:placeholder(room)},config:await readRoomConfig(room),entries};
}
export async function importRoom(backup){
 if(backup?.format!=='studio-laduke-world-room'||backup.version!==1||!rooms[backup.room]||
  !Array.isArray(backup.entries)||backup.entries.length>260)throw new Error('Invalid room package.');
 const unique=new Set();
 const entries=backup.entries.map(({key,state})=>{
  if(typeof key!=='string'||!key.startsWith(backup.room+'/')||assetKey(...key.split('/'))!==key||unique.has(key))
   throw new Error('Invalid or duplicate slot in room package.');
  unique.add(key);
  return {key,state:decodeState(state)};
 });
 await batchLocal(entries.map(({key,state})=>({key,apply(current){
  const existing=new Set(current.versions.map(version=>version.id));
  current.versions.push(...state.versions.filter(version=>!existing.has(version.id)));
  current.active=state.active;
 }})),backup.config?{room:backup.room,value:validateConfig(backup.config)}:undefined);
 return {room:backup.room,count:entries.length};
}
export function downloadRoom(value){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=value.room+'.world-room.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function validateConfig(value){
 const config={};
 if(value.warmth!==undefined){
  if(!Number.isFinite(value.warmth)||value.warmth<.35||value.warmth>1.2)throw new Error('Invalid room lighting.');
  config.warmth=value.warmth;
 }
 if(value.rainVolume!==undefined){
  if(!Number.isFinite(value.rainVolume)||value.rainVolume<0||value.rainVolume>1)throw new Error('Invalid rain level.');
  config.rainVolume=value.rainVolume;
 }
 if(value.objects){
  config.objects={};
  for(const id of ['salmon-picture','house-book','record-player']){
   const object=value.objects[id];
   if(!object)continue;
   if(!Number.isFinite(object.x)||object.x<-4||object.x>-1.5||!Number.isFinite(object.y)||object.y<.1||object.y>2.35||
    !Number.isFinite(object.z)||object.z<-1.4||object.z>1.58||!Number.isFinite(object.radius)||object.radius<.06||object.radius>.6)
    throw new Error('Object placement is outside the Front Hall.');
   config.objects[id]={x:object.x,y:object.y,z:object.z,radius:object.radius};
  }
 }
 if(value.layerOrder){
  const allowed=['background','primary','reverse','object-textures','environment','lighting','foreground'];
  if(!Array.isArray(value.layerOrder)||value.layerOrder.length!==allowed.length||
   new Set(value.layerOrder).size!==allowed.length||value.layerOrder.some(slot=>!allowed.includes(slot)))throw new Error('Invalid layer order.');
  config.layerOrder=[...value.layerOrder];
 }
 return config;
}
