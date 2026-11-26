import {createHash,timingSafeEqual,createHmac} from 'node:crypto';
import {assetKey} from '../assets/house-assets.mjs';

export const chunkLimit=768*1024;
export const maxChunks=160;
const sha=/^[a-f0-9]{64}$/;
const hash=value=>createHash('sha256').update(value).digest('hex');
const seal=(value,secret)=>createHmac('sha256',secret).update(value).digest('hex');
const same=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&
 timingSafeEqual(Buffer.from(hash(a),'hex'),Buffer.from(hash(b),'hex'));
function validKey(key){
 if(typeof key!=='string')return false;
 try{return assetKey(...key.split('/'))===key;}catch{return false;}
}
const json=(body,status=200,headers={})=>Response.json(body,{
 status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff',...headers}
});
function cookie(headers){
 return (headers.get('cookie')||'').split(';').map(p=>p.trim()).find(p=>p.startsWith('__Host-world='))?.slice(13);
}
export function createWorldHandler({store,secret,now=Date.now}){
 return async request=>{
  if(!store||typeof secret!=='string'||secret.length<32)return json({error:'Shared storage is not configured.'},503);
  const url=new URL(request.url),op=url.searchParams.get('op'),key=url.searchParams.get('key');
  if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return json({error:'Origin rejected.'},403);
  try{
   if(request.method==='POST'&&op==='login'){
    if(Number(request.headers.get('content-length'))>1024)return json({error:'Request too large.'},413);
    const body=await request.text();
    if(body.length>1024||!same(JSON.parse(body).password,secret))return json({error:'Invalid owner passphrase.'},401);
    const until=String(now()+8*60*60*1000);
    return json({ready:true},200,{'set-cookie':'__Host-world='+until+'.'+seal(until,secret)+'; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800'});
   }
   const [until,signature]=(cookie(request.headers)||'').split('.');
   if(!/^\d{13}$/.test(until)||Number(until)<now()||!same(signature,seal(until,secret)))
    return json({error:'Owner sign-in required.'},401);
   if(request.method==='GET'&&op==='status')return json({ready:true});
   if(request.method==='POST'&&op==='logout')return json({ready:false},200,{
    'set-cookie':'__Host-world=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});
   if(op==='index'&&request.method==='GET'){
    const keys=await store.keys('heads/');
    return json({keys:keys.filter(k=>k.endsWith('.json')).map(k=>k.slice(6,-5))});
   }
   if(op==='chunk'){
    const id=url.searchParams.get('id');
    if(!sha.test(id||''))return json({error:'Invalid chunk digest.'},400);
    const path='chunks/'+id;
    if(request.method==='GET'){
     const item=await store.read(path);
     return item?new Response(item.bytes,{headers:{'cache-control':'private, no-store','content-type':'application/octet-stream','x-content-type-options':'nosniff'}}):json({error:'Missing chunk.'},404);
    }
    if(request.method==='POST'){
     if(Number(request.headers.get('content-length'))>chunkLimit)return json({error:'Chunk too large.'},413);
     const bytes=Buffer.from(await request.arrayBuffer());
     if(!bytes.length||bytes.length>chunkLimit||hash(bytes)!==id)return json({error:'Invalid chunk.'},400);
     if(!await store.read(path))await store.write(path,bytes,null).catch(async error=>{if(!await store.read(path))throw error;});
     return json({id});
    }
   }
   if(op==='slot'&&validKey(key)){
    const path='heads/'+key+'.json', current=await store.read(path);
    if(request.method==='GET')return json(current?{...JSON.parse(current.bytes),etag:current.etag}:{chunks:[],etag:null});
    if(request.method==='POST'){
     const body=await request.text();
     if(body.length>15000)return json({error:'Manifest too large.'},413);
     const {etag,chunks}=JSON.parse(body);
     if(!Array.isArray(chunks)||chunks.length<1||chunks.length>maxChunks||chunks.some(id=>!sha.test(id)))
      return json({error:'Invalid manifest.'},400);
     if(etag!==(current?.etag??null))return json({error:'Another device updated this asset. Reload before retrying.'},409);
     for(const id of new Set(chunks))if(!await store.read('chunks/'+id))return json({error:'Upload is incomplete.'},409);
     const bytes=Buffer.from(JSON.stringify({chunks,updated:now()}));
     try{await store.write(path,bytes,etag);}
     catch(error){if(error.code==='conflict')return json({error:'Another device updated this asset. Reload before retrying.'},409);throw error;}
     return json({saved:true});
    }
   }
   return json({error:'Unsupported operation.'},400);
  }catch(error){
   if(error instanceof SyntaxError)return json({error:'Invalid request data.'},400);
   return json({error:'Shared storage request failed.'},502);
  }
 };
}
