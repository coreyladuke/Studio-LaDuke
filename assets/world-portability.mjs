const types=/^(image\/(jpeg|png|webp|avif)|audio\/(mpeg|wav|x-wav|ogg|mp4))$/;
const knownPaths=new Set(['assets/front-room-wide.webp','assets/front-room-phone.webp','assets/front-room-doors.webp',
 'assets/house-plates/main-hall-cedar.webp','audio/front-room-rain.mp3']);
function dataURL(blob){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(reader.error);
  reader.readAsDataURL(blob);
 });
}
export async function encodeState(state){
 return {active:state.active,versions:await Promise.all(state.versions.map(async revision=>{
  const result={...revision};
  for(const variant of ['master','desktop','mobile']){
   if(result[variant] instanceof Blob)result[variant]={data:await dataURL(result[variant])};
  }
  return result;
 }))};
}
function source(value){
 if(value===undefined||knownPaths.has(value))return value;
 if(typeof value?.data!=='string'||value.data.length>34*1024*1024)throw new Error('Invalid artwork in backup.');
 const match=/^data:([^;,]+);base64,([a-zA-Z0-9+/=\s]+)$/.exec(value.data);
 if(!match||!types.test(match[1]))throw new Error('Unsupported backup file.');
 const decoded=atob(match[2]),bytes=Uint8Array.from(decoded,character=>character.charCodeAt(0));
 return new Blob([bytes],{type:match[1]});
}
function numbers(value,limits){
 if(!value)return undefined;
 return Object.fromEntries(Object.entries(limits).map(([key,[minimum,maximum]])=>{
  const n=value[key];
  if(!Number.isFinite(n)||n<minimum||n>maximum)throw new Error('Invalid alignment or boundary in backup.');
  return [key,n];
 }));
}
export function decodeState(state){
 if(!Array.isArray(state?.versions)||state.versions.length>512)throw new Error('Invalid version history.');
 const ids=new Set();
 const versions=state.versions.map(revision=>{
  const {id,name,status,created,alignment,boundaries,master,desktop,mobile}=revision;
  if(typeof id!=='string'||!id||ids.has(id)||typeof name!=='string'||name.length>400||
   !['draft','approved','rejected','published'].includes(status)||!Number.isFinite(created))
   throw new Error('Invalid revision in backup.');
  ids.add(id);
  return {id,name,status,created,master:source(master),desktop:source(desktop),mobile:source(mobile),
   alignment:numbers(alignment,{x:[-100,100],y:[-100,100],scale:[25,300],perspective:[-70,70]}),
   boundaries:Object.fromEntries(Object.entries(boundaries||{}).map(([key,box])=>
    [key,numbers(box,{x:[0,99],y:[0,99],width:[1,100],height:[1,100]})]))};
 });
 if(state.active!=='baseline'&&!versions.some(version=>version.id===state.active&&['approved','published'].includes(version.status)))
  throw new Error('Invalid active revision.');
 return {active:state.active,versions};
}
