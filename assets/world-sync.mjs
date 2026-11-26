import {encodeState,decodeState} from './world-portability.mjs';

const endpoint='/api/world';
let ready=false,keys=new Set(),subscriber;
const query=(op,params={})=>endpoint+'?'+new URLSearchParams({op,...params});
async function request(op,{params,method='GET',body,raw=false}={}){
 const response=await fetch(query(op,params),{credentials:'same-origin',cache:'no-store',method,body});
 if(!response.ok){
  const problem=await response.json().catch(()=>({}));
  throw Object.assign(new Error(problem.error||'Shared storage unavailable.'),{status:response.status});
 }
 return raw?new Uint8Array(await response.arrayBuffer()):response.json();
}
export async function initialize({catalog=true}={}){
 let status;
 try{
  await request('status');
  keys=new Set(catalog?(await request('index')).keys:[]);
  ready=true;status='connected';
 }catch(error){ready=false;status=error.status===401?'locked':'unconfigured';}
 subscriber?.(status);
 return status;
}
export const onStatus=callback=>{subscriber=callback;};
export const shared=()=>ready;
export async function signIn(password){
 await request('login',{method:'POST',body:JSON.stringify({password})});
 return initialize();
}
export async function signOut(){
 await request('logout',{method:'POST'});
 return initialize();
}
export async function sharedRecord(key,fresh=false){
 if(!fresh&&!keys.has(key))return {state:{active:'baseline',versions:[]},etag:null};
 const manifest=await request('slot',{params:{key}});
 if(!manifest.chunks.length)return {state:{active:'baseline',versions:[]},etag:null};
 const pieces=[];
 for(let i=0;i<manifest.chunks.length;i+=4){
  pieces.push(...await Promise.all(manifest.chunks.slice(i,i+4).map(id=>request('chunk',{params:{id},raw:true}))));
 }
 const json=await new Blob(pieces).text();
 return {state:decodeState(JSON.parse(json)),etag:manifest.etag};
}
const size=768*1024;
export async function sharedSave(key,state,etag){
 const bytes=new TextEncoder().encode(JSON.stringify(await encodeState(state)));
 if(bytes.length>160*size)throw new Error('This slot exceeds its shared storage limit. Export a backup before creating more revisions.');
 const chunks=[];
 for(let i=0;i<bytes.length;i+=size){
  const piece=bytes.subarray(i,i+size);
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',piece));
  const id=[...digest].map(n=>n.toString(16).padStart(2,'0')).join('');
  await request('chunk',{params:{id},method:'POST',body:piece});
  chunks.push(id);
 }
 await request('slot',{params:{key},method:'POST',body:JSON.stringify({etag,chunks})});
 keys.add(key);
 return state;
}

export const sharedRoomConfig=room=>request('config',{params:{room}});
export const saveSharedRoomConfig=(room,value,etag)=>request('config',{
 params:{room},method:'POST',body:JSON.stringify({value,etag})
});
