import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,readdir,mkdir,rm} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {test} from 'node:test';
import {createWorldHandler} from '../lib/world-repository.mjs';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const secret='test-'+'only-'.repeat(8),origin='https://review.example';
function filesystem(root){
 const read=async path=>{
  try{const bytes=await readFile(join(root,path));return {bytes,etag:digest(bytes)};}
  catch(e){if(e.code==='ENOENT')return null;throw e;}
 };
 return {
  read,
  async write(path,bytes,expected){
   const file=join(root,path);
   if(((await read(path))?.etag??null)!==expected)throw Object.assign(new Error('Conflict'),{code:'conflict'});
   await mkdir(dirname(file),{recursive:true});
   await writeFile(file,bytes,{flag:expected===null?'wx':'w'});
  },
  async keys(prefix){
   try{return (await readdir(join(root,prefix),{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile())
    .map(entry=>join(entry.parentPath,entry.name).slice(root.length+1));}
   catch(e){if(e.code==='ENOENT')return [];throw e;}
  }
 };
}
const key='UP-LAN/primary/primary';
function request(op,{method='GET',body,cookie,params={},from=origin}={}){
 return new Request(origin+'/api/world?'+new URLSearchParams({op,...params}),{method,body,
  headers:{...(cookie?{cookie}:{}),...(method==='POST'?{origin:from}:{})}});
}
async function login(handler){
 const response=await handler(request('login',{method:'POST',body:JSON.stringify({password:secret})}));
 assert.equal(response.status,200);
 const set=response.headers.get('set-cookie');
 assert.match(set,/; Secure; HttpOnly; SameSite=Strict/);
 return set.split(';')[0];
}
test('owner authorization, durable versions across instances, restore, and stale write rejection',async()=>{
 const root=await mkdtemp(join(tmpdir(),'world-test-'));
 try{
  let handler=createWorldHandler({store:filesystem(root),secret});
  assert.equal((await handler(request('index'))).status,401);
  assert.equal((await handler(request('slot',{params:{key}}))).status,401);
  assert.equal((await handler(request('login',{method:'POST',body:'{"password":"wrong"}'}))).status,401);
  const owner=await login(handler);
  assert.equal((await handler(request('slot',{method:'POST',cookie:owner,from:'https://other.example',params:{key},body:'{}'}))).status,403);
  assert.equal((await handler(request('slot',{cookie:owner,params:{key:'../../not-a-slot'}}))).status,400);
  const one={active:'first',versions:[{id:'first',name:'Previous',status:'approved',created:1}]};
  const two={active:'second',versions:[...one.versions,{id:'second',name:'Current',status:'approved',created:2}]};
  async function commit(state,etag,cookie=owner){
   const data=Buffer.from(JSON.stringify(state)),id=digest(data);
   assert.equal((await handler(request('chunk',{method:'POST',body:data,cookie,params:{id}}))).status,200);
   return handler(request('slot',{method:'POST',body:JSON.stringify({etag,chunks:[id]}),cookie,params:{key}}));
  }
  async function load(cookie){
   const head=await (await handler(request('slot',{cookie,params:{key}}))).json();
   const data=await handler(request('chunk',{cookie,params:{id:head.chunks[0]}}));
   return {head,value:await data.json()};
  }
  assert.equal((await commit(one,null)).status,200);
  const first=await load(owner);
  assert.equal((await commit(two,first.head.etag)).status,200);
  assert.equal((await commit(one,first.head.etag)).status,409);
  handler=createWorldHandler({store:filesystem(root),secret});
  const secondDevice=await login(handler);
  const second=await load(secondDevice);
  assert.deepEqual(second.value,two);
  assert.equal((await handler(request('chunk',{params:{id:second.head.chunks[0]}}))).status,401);
  assert.equal((await commit({...two,active:'first'},second.head.etag,secondDevice)).status,200);
  assert.deepEqual((await load(secondDevice)).value,{...two,active:'first'});
  assert.deepEqual(await(await handler(request('index',{cookie:secondDevice}))).json(),{keys:[key]});
 }finally{await rm(root,{recursive:true,force:true});}
});
test('missing service and expired or forged cookies fail closed',async()=>{
 assert.equal((await createWorldHandler({})(request('index'))).status,503);
 const handlers={store:{},secret};
 const now=Date.now();
 const cookie=await login(createWorldHandler({...handlers,now:()=>now}));
 const future=createWorldHandler({...handlers,now:()=>now+9*60*60*1000});
 assert.equal((await future(request('status',{cookie}))).status,401);
 assert.equal((await createWorldHandler(handlers)(request('status',{cookie:cookie+'0'}))).status,401);
});

test('shared room settings survive fresh sessions and reject unauthorized or outdated changes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'world-config-test-'));
 const params={room:'ENT-01'};
 const original={warmth:.82,rainVolume:.22,objects:{'house-book':{x:-2.75,y:1,z:1.2,radius:.12}}};
 const updated={...original,warmth:.93};
 try{
  let handler=createWorldHandler({store:filesystem(root),secret});
  assert.equal((await handler(request('config',{params}))).status,401);
  const first=await login(handler);
  const write=(value,etag,cookie)=>handler(request('config',{
   method:'POST',params,cookie,body:JSON.stringify({value,etag})
  }));
  assert.equal((await write({warmth:12},null,first)).status,400);
  assert.equal((await write(original,null,first)).status,200);
  const snapshot=await (await handler(request('config',{cookie:first,params}))).json();
  assert.deepEqual(snapshot.value,original);
  handler=createWorldHandler({store:filesystem(root),secret});
  const second=await login(handler);
  assert.deepEqual(await (await handler(request('config',{cookie:second,params}))).json(),snapshot);
  assert.equal((await write(updated,snapshot.etag,second)).status,200);
  assert.equal((await write(original,snapshot.etag,first)).status,409);
  assert.equal((await handler(request('config',{cookie:second,params:{room:'../ENT-01'}}))).status,400);
  assert.deepEqual((await (await handler(request('config',{cookie:second,params}))).json()).value,updated);
 }finally{await rm(root,{recursive:true,force:true});}
});
