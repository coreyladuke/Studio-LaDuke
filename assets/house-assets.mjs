import {shared,sharedRecord,sharedSave} from './world-sync.mjs';
import { rooms, viewpoints } from './house-layout.mjs';

export const slots = ['primary','reverse','foreground','background','depth','occlusion','environment','lighting','object-textures','ambient'];
const approved = {
 'ENT-01/primary/primary': {desktop:'assets/front-room-wide.webp',mobile:'assets/front-room-phone.webp'},
 'ENT-01/reverse/reverse': {desktop:'assets/front-room-doors.webp'},
 'GF-MHL/primary/primary': {desktop:'assets/house-plates/main-hall-cedar.webp'}
};
const sound = {desktop:'audio/front-room-rain.mp3'};
export const defaults = {x:0,y:0,scale:100,perspective:0};
export const boundsDefault = {x:39,y:26,width:22,height:54};
export function assetKey(room,view,slot) {
 if(!Object.hasOwn(rooms,room) || !viewpoints(room).some(camera=>camera.id===view) || !slots.includes(slot))
  throw new Error('Unknown room, viewpoint, or slot.');
 return [room,view,slot].join('/');
}
export function baseline(key) {
 const asset=approved[key] || (key.endsWith('/ambient')?sound:null);
 return asset ? {id:'baseline',name:asset.desktop.split('/').at(-1),status:'approved',...asset,alignment:defaults} : null;
}
let database;
function connect() {
 if(!database) database=new Promise((resolve,reject)=>{
  const request=indexedDB.open('studio-laduke-room-assets',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('assets');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
 return database;
}
const empty=()=>({active:'baseline',versions:[]});
export async function record(key) {
 if(shared())return (await sharedRecord(key)).state;
 const db=await connect();
 return new Promise((resolve,reject)=>{
  const request=db.transaction('assets').objectStore('assets').get(key);
  request.onsuccess=()=>resolve(request.result||empty());
  request.onerror=()=>reject(request.error);
 });
}
export async function change(key,apply) {
 if(shared()){
  const {state,etag}=await sharedRecord(key,true);
  apply(state);
  return sharedSave(key,state,etag);
 }
 const db=await connect();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction('assets','readwrite');
  const store=transaction.objectStore('assets');
  const request=store.get(key);
  let state;
  request.onsuccess=()=>{
   state=request.result||empty();
   apply(state);
   store.put(state,key);
  };
  transaction.oncomplete=()=>resolve(state);
  transaction.onabort=()=>reject(transaction.error||new Error('Asset update failed.'));
 });
}
export function active(key,state) {
 return state.versions.find(item=>item.id===state.active&&['approved','published'].includes(item.status))||baseline(key);
}
export function source(asset,mobile) {
 const value=(mobile&&asset?.mobile)||asset?.desktop||asset?.mobile;
 if(value instanceof Blob) return {url:URL.createObjectURL(value),release:true};
 return {url:value,release:false};
}
