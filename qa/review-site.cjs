/* Loopback-only, clean-session visual QA for the existing House Guide route. */
'use strict';
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {createServer}=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const dest=path.resolve(process.env.STUDIO_REVIEW_OUTPUT||root);
const output=path.join(dest,'STUDIO_LADUKE_REVIEW');
const archive=output+'.zip';
const marker='.studio-review-generated';
const stage=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'studio-qa-'));
const bundle=path.join(stage,'STUDIO_LADUKE_REVIEW');
const folder=name=>{const p=path.join(bundle,name);fs.mkdirSync(p,{recursive:true});return p;};
const screenshots=folder('screenshots'),videos=folder('videos');
const profiles=[
 {id:'desktop', viewport:{width:1440,height:900}, deviceScaleFactor:1},
 {id:'chromebook', viewport:{width:1366,height:768}, deviceScaleFactor:1},
 {id:'mobile', viewport:{width:390,height:844}, deviceScaleFactor:2,isMobile:true,hasTouch:true},
];
const directions=['00-forward','01-forward-right','02-right','03-back-right','04-back','05-back-left','06-left','07-forward-left','08-up','09-down'];
const areas=['front-stoop','front-hall','main-hall','main-stairs','upstairs-landing'];
const photos=['entrance','living-room-entry','approved-front-hall','approved-main-hall','photographic-landing-arrival','photographic-landing-return','photographic-return'];
const getGit=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trimEnd();
const snapshot={branch:getGit('branch','--show-current'),commit:getGit('rev-parse','HEAD'),changes:getGit('status','--short','--untracked-files=normal')};
const protectedUrl=process.env.STUDIO_PROTECTED_PREVIEW||'https://studio-laduke-house-walk-review-o6fdd5kv6-coreyladuke-5408.vercel.app/house-visit.html?entry=stoop';
const appRoot=process.env.STUDIO_LOCAL_PREVIEW||'http://localhost:8780/house-visit.html?entry=stoop';
function publicUrl(raw){
 const url=new URL(raw);
 if(url.username||url.password||!['http:','https:'].includes(url.protocol))throw Error('Expected a credential-free preview URL.');
 const query=url.searchParams.get('entry')==='stoop'?'?entry=stoop':'';
 return url.origin+url.pathname+query;
}
const meta={...snapshot,time:new Date().toISOString(),protectedPreview:publicUrl(protectedUrl),localPreview:publicUrl(appRoot)};
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
 '.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
 '.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/world'){
   res.writeHead(503,{'content-type':'application/json'}).end('{"error":"Shared storage is not configured in the local visual review."}');
   return;
  }
  const parts=decodeURIComponent(url.pathname).split('/').filter(Boolean);
  if(parts.some(p=>p.startsWith('.')||p.includes('\\')||p==='node_modules')){
   res.writeHead(404).end();return;
  }
  const file=path.resolve(root,...(parts.length?parts:['index.html']));
  const stat=fs.statSync(file,{throwIfNoEntry:false});
  if(!file.startsWith(root+path.sep)||!stat?.isFile()||!fs.realpathSync(file).startsWith(root+path.sep)){
   res.writeHead(404).end();return;
  }
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream',
   'content-length':stat.size,'cache-control':'no-store'});
  if(req.method==='HEAD')res.end();
  else fs.createReadStream(file).pipe(res);
 }catch {res.writeHead(400).end();}
});
const clean=value=>String(value)
 .replace(/(?:data:|blob:)\S+/g,'[embedded resource]')
 .replace(/https?:\/\/[^\s"')]+/g,raw=>{try{const u=new URL(raw);return u.origin+u.pathname;}catch{return '[url]';}})
 .replace(/(authorization|password|token|cookie|credential|secret)\s*[:=]\s*\S+/gi,'$1=[redacted]')
 .slice(0,320);
function captureDiagnostics(page){
 const diag={console:[],exceptions:[],requests:[],cancelledRequests:[],httpErrors:[],expectedUnavailable:[],assets:[]};
 page.on('console',msg=>{
  if(!['error','warning'].includes(msg.type()))return;
  diag.console.push({type:msg.type(),text:clean(msg.text())});
 });
 page.on('pageerror',e=>diag.exceptions.push(clean(e.message)));
 page.on('requestfailed',r=>{
  const failure=r.failure()?.errorText, event={url:clean(r.url()),type:r.resourceType(),error:clean(failure)};
  if(/(?:ABORTED|cancelled)/i.test(failure))diag.cancelledRequests.push(event);
  else diag.requests.push(event);
 });
 page.on('response',r=>{
  const request=r.request(),url=new URL(r.url());
  const event={url:clean(r.url()),type:request.resourceType(),status:r.status()};
  if(r.status()>=400){
   if(url.pathname==='/api/world'&&url.searchParams.get('op')==='status'&&r.status()===503)
    diag.expectedUnavailable.push(event);
   else diag.httpErrors.push(event);
  }
  if(event.type==='image'||event.type==='media')diag.assets.push(event);
 });
 return diag;
}
const relative=name=>path.relative(bundle,name).split(path.sep).join('/');
const delay=(page,ms)=>page.waitForTimeout(ms);
const tau=Math.PI*2;
const difference=(from,to)=>((to-from+Math.PI)%tau+tau)%tau-Math.PI;
function markdownTable(rows){return rows.map(row=>'| '+row.join(' | ')+' |').join('\n');}

async function contextFor(browser,profile,record=false){
 const {id,...device}=profile;
 return browser.newContext({...device,reducedMotion:'no-preference',
  ...(record?{recordVideo:{dir:videos,size:id==='mobile'?{width:390,height:844}:{width:1120,height:700}}}:{})});
}
function instrument(){
 window.__reviewFrames={drawn:0,drawTimes:[]};
 for(const proto of [window.WebGLRenderingContext?.prototype,window.WebGL2RenderingContext?.prototype]){
  if(!proto)continue;
  const original=proto.drawArrays;
  proto.drawArrays=function(...args){
   const result=original.apply(this,args);
   if(this.canvas.id==='world'){
    if(!window.__reviewFrames.renderer){
     const info=this.getExtension('WEBGL_debug_renderer_info');
     window.__reviewFrames.renderer=this.getParameter(info?.UNMASKED_RENDERER_WEBGL??this.RENDERER);
    }
    window.__reviewFrames.drawn++;
    window.__reviewFrames.drawTimes.push(performance.now());
   }
   return result;
  };
 }
}
async function navTime(page){
 return page.evaluate(()=>{
  const n=performance.getEntriesByType('navigation').at(-1);
  const p=performance.getEntriesByType('paint');
  const ms=n=>Number.isFinite(n)?Math.round(n):null;
  return n&&{responseStart:ms(n.responseStart),domContentLoaded:ms(n.domContentLoadedEventEnd),
   load:ms(n.loadEventEnd),firstContentfulPaint:ms(p.find(x=>x.name==='first-contentful-paint')?.startTime),
   transferredBytes:n.transferSize,resources:performance.getEntriesByType('resource').length};
 });
}
async function pacing(page){
 return page.evaluate(async()=>{
  const frames=[];
  let last=await new Promise(requestAnimationFrame);
  const start=last;
  const baseline=window.__reviewFrames?.drawTimes.length||0;
  for(let i=0;i<45;i++){
   const now=await new Promise(requestAnimationFrame);
   frames.push(now-last);last=now;
  }
  const draws=(window.__reviewFrames?.drawTimes||[]).slice(baseline);
  function describe(samples){
   const sorted=[...samples].sort((a,b)=>a-b);
   return {medianMs:+sorted[Math.floor(sorted.length*.5)].toFixed(1),
    p95Ms:+sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)].toFixed(1),
    maxMs:+sorted.at(-1).toFixed(1),over50ms:sorted.filter(t=>t>50).length};
  }
  const elapsed=(last-start)/1000;
  return {seconds:+elapsed.toFixed(2),renderer:window.__reviewFrames?.renderer??null,rafFps:+(frames.length/elapsed).toFixed(1),raf:describe(frames),
   webglDraws:draws.length,renderedFps:+(draws.length/elapsed).toFixed(1),
   renderGaps:draws.length>1?describe(draws.slice(1).map((t,i)=>t-draws[i])):null,
   backingStore:[document.querySelector('#world')?.width,document.querySelector('#world')?.height]};
 });
}

async function runJourney(browser,profile,base,{record=false,capture=true,throttle=1}={}){
 const context=await contextFor(browser,profile,record);
 await context.addInitScript(instrument);
 const page=await context.newPage();
 page.setDefaultTimeout(10000);
 const diag=captureDiagnostics(page);
 const result={profile:profile.id,viewport:profile.viewport,deviceScaleFactor:profile.deviceScaleFactor,
  mobileEmulation:!!profile.isMobile,recording:record,checks:{},loads:{},pacing:{},angles:{},observed:{},diag};
 const shotPaths={};
 const world=page.locator('#world');
 const button=name=>page.getByRole('button',{name,exact:true});
 const visible=()=>world.waitFor({state:'visible'});
 const shot=async(name,reference=false)=>{
  if(!capture)return;
  const dir=path.join(screenshots,profile.id);
  fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,name+'.jpg');
  cdp ||= await context.newCDPSession(page);
  const {data}=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:94,fromSurface:true});
  fs.writeFileSync(file,Buffer.from(data,'base64'));
  shotPaths[name]=relative(file);
  if(!reference)result.angles[name]=shotPaths[name];
 };
 const state=()=>world.evaluate(el=>({
  room:el.dataset.room, bearing:Number(el.dataset.bearing),
  eye:Number(el.dataset.eye), position:(el.dataset.coords||',').split(',').map(Number)
 }));
 const wait=(criteria,timeout)=>page.waitForFunction(criteria=> {
  const el=document.querySelector('#world');
  if(!el?.dataset.coords)return false;
  const [x,z]=el.dataset.coords.split(',').map(Number);
  const {room,bearing}=el.dataset;
  return (!criteria.room||criteria.room===room)&&
   (criteria.xMin===undefined||x>criteria.xMin)&&(criteria.xMax===undefined||x<criteria.xMax)&&
   (criteria.zMin===undefined||z>criteria.zMin)&&(criteria.zMax===undefined||z<criteria.zMax)&&
   (criteria.bearing===undefined||Math.abs(Number(bearing)-criteria.bearing)<.014);
 },criteria,{timeout});
 const desktopAction=profile.hasTouch?'tap':'click';
 const activate=locator=>locator[desktopAction]();
 const closeDetails=async()=>{
  if(await page.locator('#objects').getAttribute('open')!==null)await activate(page.locator('#objects summary'));
 };
 const nearby=async name=>{
  if(await page.locator('#objects').getAttribute('open')===null)await activate(page.locator('#objects summary'));
  const target=page.locator('#nearby').getByRole('button',{name,exact:true});
  await activate(target);
 };
 let cdp;
 const touchscreenMove=async(key,criteria)=>{
  const rect=await page.locator(key==='w'?'#advance':'#recede').boundingBox();
  assert.ok(rect);
  const x=Math.round(rect.x+rect.width/2),y=Math.round(rect.y+rect.height/2);
  await touch('touchStart',x,y);
  try{if(typeof criteria==='number')await delay(page,criteria);else await wait(criteria,30000);}
  finally{await touch('touchEnd');}
  await delay(page,65);
 };
 const hold=async(key,criteria)=>{
  if(profile.hasTouch&&(key==='w'||key==='s'))return touchscreenMove(key,criteria);
  await world.focus();
  await page.keyboard.down(key);
  try{if(typeof criteria==='number')await delay(page,criteria);else await wait(criteria,30000);}
  finally{await page.keyboard.up(key);}
  await delay(page,65);
 };
 const touch=async(type,x,y)=>{
  cdp ||= await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 };
 const drag=async(dx,dy,withTouch=false)=>{
  const rect=await world.boundingBox();
  assert.ok(rect);
  let remainingX=dx,remainingY=dy;
  while(Math.abs(remainingX)+Math.abs(remainingY)>1){
   const xDelta=Math.max(-rect.width*.39,Math.min(rect.width*.39,remainingX));
   const yDelta=Math.max(-rect.height*.36,Math.min(rect.height*.36,remainingY));
   const x=Math.round(rect.x+rect.width*.50-xDelta/2),y=Math.round(rect.y+rect.height*.43-yDelta/2);
   if(withTouch){
    await touch('touchStart',x,y);
    for(const fraction of [.25,.5,.75,1])await touch('touchMove',Math.round(x+xDelta*fraction),Math.round(y+yDelta*fraction));
    await touch('touchEnd');
   }else{
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(Math.round(x+xDelta),Math.round(y+yDelta),{steps:record?5:1});await page.mouse.up();
   }
   remainingX-=xDelta;remainingY-=yDelta;
  }
  await delay(page,70);
 };
 const face=async angle=>{
  const initial=await state(),delta=difference(initial.bearing,angle);
  if(Math.abs(delta)>.035)await drag(-delta/.006,0);
  const actual=await state();
  assert.ok(Math.abs(difference(actual.bearing,angle))<.075,'Heading missed the requested view');
 };
 const inspectAngles=async (area,heading)=>{
  if(!capture)return;
  const initial=await state();
  await face(heading);
  for(let i=0;i<8;i++){
   await face(heading+i*Math.PI/4);
   await shot(area+'--'+directions[i]);
  }
  await face(heading);
  await drag(0,174);await shot(area+'--08-up');await drag(0,-174);
  await drag(0,-174);await shot(area+'--09-down');await drag(0,174);
  await face(initial.bearing);
  const at=await state();
  assert.deepEqual(at.position,initial.position,'Looking around must leave the camera in place');
 };
 const check=async(name,action)=>{
  try{await action();result.checks[name]={pass:true};}
  catch(e){result.checks[name]={pass:false,error:clean(e.message)};throw e;}
 };
 const attempt=async(name,action)=>{
  try{await check(name,action);}catch{}
 };
 const photoRoom=label=>page.waitForFunction(label=>
  document.querySelector('#floorName')?.textContent===label&&!document.querySelector('#camera')?.hasAttribute('data-crossing'),label);
 try {
  await check('websiteEntrance',async()=>{
   await page.goto(base+'index.html');
   await page.locator('body').waitFor();
   result.loads.entrance=await navTime(page);
   await shot('entrance',true);
   await activate(page.getByRole('link',{name:'Enter the house and living room'}));
   await photoRoom('Living Room');await shot('living-room-entry',true);
   await activate(button('Open house floor plan'));
   await activate(page.getByRole('link',{name:'Explore the dimensional halls'}));
   await wait({room:'Front Hall'});await visible();
   result.loads.dimensional=await navTime(page);
  });
  // The public stoop start URL is documented but the site's map links to an inside start.
  await page.goto(base+'house-visit.html?entry=stoop');
  await wait({room:'Front Stoop'});
  const stoopAnchor=await state();
  await check('closedDoorCollision',async()=>{
   await hold('w',850);
   const blocked=await state();
   assert.equal(blocked.room,'Front Stoop');
   assert.ok(blocked.position[0]<-4.10);
   result.observed.closedDoor={start:stoopAnchor,end:blocked};
   await hold('s',{xMax:stoopAnchor.position[0]+.04});
  });
  await inspectAngles('front-stoop',Math.PI/2);
  if(capture){
   result.pacing['front-stoop']=await pacing(page);
   if(result.pacing['front-stoop'].renderer)meta.renderer=clean(result.pacing['front-stoop'].renderer);
   if(throttle>1){
    cdp ||= await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
    result.pacing['front-stoop-throttled']={cpuThrottle:throttle,...await pacing(page)};
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
   }
  }
  await check('doorAndThreshold',async()=>{
   await nearby('Front door');
   assert.match(await page.locator('#visit-status').textContent(),/opened/i);
   await closeDetails();
   await shot('front-door-open',true);
   await hold('w',{xMin:-3.50});
   await wait({room:'Front Hall'});
  });
  await inspectAngles('front-hall',Math.PI/2);
  if(capture)result.pacing['front-hall']=await pacing(page);
  await attempt('physicalObjects',async()=>{
   for(const name of ['Console lamp','Cedar drawer'])await nearby(name);
   assert.match(await page.locator('#visit-status').textContent(),/drawer opened/i);
   await nearby('Folded note');await page.getByRole('dialog').waitFor();
   await shot('object-drawer-note',true);await activate(button('Close inspection'));
   await nearby('King salmon painting');await page.getByRole('dialog').getByRole('img').waitFor();
   await shot('object-original-painting',true);await activate(button('Close inspection'));
   await nearby('House notebook');await page.getByRole('dialog').waitFor();
   await activate(button('Close inspection'));
   await nearby('Record player');assert.match(await page.locator('#visit-status').textContent(),/on/i);
   await nearby('Record player');assert.match(await page.locator('#visit-status').textContent(),/off/i);
   await nearby('Console lamp');await nearby('Cedar drawer');
  });
  if(await page.locator('dialog').isVisible())await page.keyboard.press('Escape');
  await closeDetails();
  await attempt('audioOptIn',async()=>{
   assert.equal(await button('Rain sound').getAttribute('aria-pressed'),'false');
   await activate(button('Rain sound'));
   await page.waitForFunction(()=>!document.querySelector('#ambient-rain').paused,undefined,{timeout:5000});
   await activate(button('Rain sound'));
   assert.equal(await button('Rain sound').getAttribute('aria-pressed'),'false');
  });
  if(capture)await attempt(profile.hasTouch?'touchDragIsNotTap':'mouseDragIsNotClick',async()=>{
   const before=await state();
   await drag(78,10,profile.hasTouch);
   const after=await state();
   assert.deepEqual(after.position,before.position);
   assert.ok(Math.abs(difference(before.bearing,after.bearing))>.20);
   assert.equal(await page.locator('dialog').isVisible(),false);
   await drag(0,-10);
  });
  await face(Math.PI/2);
  await check('mainHallOpening',async()=>{await hold('w',{xMin:-.095});await wait({room:'Main Hall'});});
  await inspectAngles('main-hall',0);
  if(capture)result.pacing['main-hall']=await pacing(page);
  await face(0);
  await check('ascentAndEyeHeight',async()=>{
   const at=await state();
   await hold('w',{zMin:1.32});
   const stair=await state();
   assert.equal(stair.room,'Main Stairs');
   assert.ok(stair.eye>at.eye+.5);
   assert.ok(Math.abs(difference(at.bearing,stair.bearing))<.075);
   result.observed.ascent={from:at,to:stair};
  });
  await inspectAngles('main-stairs',0);
  if(capture)result.pacing['main-stairs']=await pacing(page);
  await check('stairSideCollision',async()=>{
   await hold('d',700);
   const side=await state();
   assert.ok(Math.abs(side.position[0])<.54);
   await hold('a',{xMax:.075});
  });
  await check('upperThreshold',async()=>{
   await hold('w',{zMin:3.88});
   const landing=await state();
   assert.equal(landing.room,'Upstairs Landing');
   assert.ok(landing.eye>3.7);
  });
  await inspectAngles('upstairs-landing',0);
  if(capture)result.pacing['upstairs-landing']=await pacing(page);
  await face(Math.PI);
  await check('continuousDescent',async()=>{
   await hold('w',{zMax:-.70});
   const at=await state();
   assert.equal(at.room,'Main Hall');
   assert.ok(Math.abs(at.eye-1.58)<.025);
   result.observed.descent=at;
  });
  await face(Math.PI*1.5);
  await check('returnToStoop',async()=>{await hold('w',{xMax:-4.30});await wait({room:'Front Stoop'});});
  if(!record)await check('photographicReferenceAndReturn',async()=>{
   await activate(page.getByRole('link',{name:'Photographic walk'}));
   await photoRoom('Front Hall');await shot('approved-front-hall',true);
   await activate(button('Main Hall Opening'));await photoRoom('Main Hall');await shot('approved-main-hall',true);
   await activate(button('Main Stairs'));await photoRoom('Upstairs Landing');await shot('photographic-landing-arrival',true);
   await activate(button('Turn around'));await photoRoom('Upstairs Landing');await shot('photographic-landing-return',true);
   await activate(button('Main Stairs'));await photoRoom('Main Hall');
   await activate(button('Main Hall Opening'));await photoRoom('Front Hall');await shot('photographic-return',true);
  });
  result.observed.imageFailures=await page.locator('img').evaluateAll(imgs=>
   imgs.filter(img=>img.complete&&!img.naturalWidth).map(img=>img.getAttribute('src')?.split('?')[0]).filter(Boolean));
 }catch(e){result.failure=clean(e.message);}
 finally{
  result.screenshots=shotPaths;
  const video=page.video();
  await context.close();
  if(video){
   const recorded=await video.path();
   const final=path.join(videos,profile.id+'-walkthrough.webm');
   fs.renameSync(recorded,final);
   result.video=relative(final);
  }
 }
 return result;
}

const sceneLabels={
 'front-stoop':'Front stoop','front-hall':'Front Hall','main-hall':'Main Hall',
 'main-stairs':'Main Stairs','upstairs-landing':'Upstairs Landing',
};
function renderSheets(journeys){
 const rows=folder('contact-sheets');
 const n=process.env.STUDIO_MONTAGE||'montage';
 const command=(prog,args)=>execFileSync(prog,args,{stdio:['ignore','ignore','pipe']});
 const sheet=(args,out)=>{
  command(n,['-font','DejaVu-Sans','-pointsize','13','-background','#161c18','-fill','#f1eadd',
   ...args,out]);
 };
 const append=(files,out)=>command('convert',[...files,'-background','#161c18','-gravity','center','-append','-quality','91',out]);
 for(const j of journeys){
  const group=j.profile,panels=[];
  for(const area of areas){
   const inputs=directions.flatMap((direction,i)=>{
    const file=j.screenshots[area+'--'+direction];
    return file?['-label',group+' | '+sceneLabels[area]+' | '+directions[i].slice(3).replaceAll('-',' '),path.join(bundle,file)]:[];
   });
   if(!inputs.length)continue;
   const row=path.join(rows,group+'--'+area+'.jpg');
   sheet([...inputs,'-geometry','242x162+5+6','-tile','5x2','-quality','90'],row);
   panels.push(row);
  }
  const actualPhotos=photos.flatMap(name=>{
   const file=j.screenshots[name];
   return file?['-label',group+' | '+name.replaceAll('-',' '),path.join(bundle,file)]:[];
  });
  if(actualPhotos.length){
   const comparison=path.join(rows,group+'--photographic-reference.jpg');
   sheet([...actualPhotos,'-geometry','291x182+5+6','-tile','4x2','-quality','91'],comparison);
   panels.push(comparison);
  }
  if(panels.length){
   const file=path.join(rows,group+'.jpg');
   append(panels,file);
   if(group==='desktop')fs.copyFileSync(file,path.join(bundle,'CONTACT_SHEET.jpg'));
  }
 }
}
function getManualNotes(){
 const input=process.env.STUDIO_REVIEW_NOTES;
 if(!input)return '';
 const note=fs.readFileSync(input,'utf8').trim();
 if(note.length>24*1024)throw Error('Visual assessment is too large.');
 return note;
}
function createReport(journeys,recordings,manual,base){
 const completed=journeys.map(j=>[j.profile,j.viewport.width+' × '+j.viewport.height,
  Object.values(j.checks).filter(x=>x.pass).length+'/'+Object.keys(j.checks).length,
  Object.keys(j.angles).length,j.diag.exceptions.length,j.diag.httpErrors.length,
  j.failure?j.failure.replaceAll('|','/'):Object.values(j.checks).some(c=>!c.pass)?'Some checks failed':'Completed']);
 const perf=journeys.flatMap(j=>Object.entries(j.pacing).map(([scene,p])=>[
  j.profile,scene.replaceAll('-',' '),p.renderedFps,p.rafFps,p.raf.p95Ms,p.renderGaps?.p95Ms??'—',
  p.backingStore.join(' × ')
 ]));
 const loading=journeys.flatMap(j=>Object.entries(j.loads).map(([name,t])=>[
  j.profile,name,t.responseStart??'—',t.domContentLoaded??'—',t.firstContentfulPaint??'—',t.load??'—'
 ]));
 const issues=journeys.flatMap(j=>[
  ...Object.entries(j.checks).filter(([,v])=>!v.pass).map(([key,v])=>'- '+j.profile+' · '+key+' — '+v.error),
  ...j.diag.console.map(e=>'- '+j.profile+' · Browser console — '+JSON.stringify(e)),
  ...j.diag.exceptions.map(t=>'- '+j.profile+' · JavaScript — '+t),
  ...j.diag.httpErrors.map(e=>'- '+j.profile+' · HTTP '+e.status+' — '+e.url),
  ...j.diag.requests.map(e=>'- '+j.profile+' · '+e.error+' — '+e.url),
 ]);
 return `# Studio LaDuke visual review

Captured ${meta.time}. Chromium ${meta.browserVersion}, ${meta.renderer}.

- Branch \`${meta.branch}\`
- Commit \`${meta.commit}\`
- Local preview ${meta.localPreview}
- Protected review URL ${meta.protectedPreview}
- This run used the checkout on a temporary loopback server at ${base}. The two URLs above are review entry points and the protected site was excluded from browser automation. Code can differ by deployment.
- Desktop, Chromebook-sized and mobile are software-rendered Playwright profiles. Chromebook-sized refers to viewport dimensions. Touch was emulated in Chromium. Physical device and Safari validation are outside these measurements.
- The map opens the dimensional view from inside. The suite opens the published stoop start URL separately, then uses the same visitor-facing controls for the route. Native clicks, touch input, key holds and drag gestures drive the page. DOM state is observed to checkpoint the route. The camera pose is never set by the harness.

## Working tree at capture

\`\`\`text
${meta.changes?meta.changes.split('\n').map(clean).join('\n'):'Clean'}
\`\`\`

## Coverage and results

${markdownTable([['Profile','CSS viewport','Checks passed','Dimensional views','Page exceptions','Unexpected HTTP failures','Status'],
 ['---','---','---','---','---','---','---'],...completed])}

The exterior door closed-state collision check attempts to walk forward before opening. The stair wall check tries lateral movement mid-flight. The ascent checkpoint validates eye height and heading. The suite also verifies descent, optical drag without an accidental activation, rain opt-in, the lamp, drawer, note, original painting, notebook and record player, and the return route via the photographic walk.

${issues.length?issues.join('\n'):'No failed checks, page exceptions, unexpected HTTP failures or transport errors were logged in the completed profiles.'}

${recordings.map(r=>'- '+r.profile+' video · \`'+(r.video||'unavailable')+'\`'+(r.failure?' · '+r.failure:'')).join('\n')}

The local storage feature probe intentionally returns HTTP 503 because cloud storage is outside this run. Navigation-aborted requests are logged separately. The result JSON includes request failures, console warnings, image responses and decoded image failures. Renderer texture HTTP responses are checked through the asset log. No HAR, trace, cookies, browser storage, request headers or auth state are included.

## Measured rendering and loading

Rendering samples count actual WebGL draw calls for the dimensional canvas and animation callbacks separately. This renderer draws one batch per rendered frame. Idle samples run for 45 animation intervals per stop. Throttled phone emulation applies a 4× CPU slowdown for one stoop sample. These are short local samples and vary with machine load.

${markdownTable([['Profile','Stop','Draw fps','rAF fps','rAF p95 ms','Draw p95 ms','Canvas px'],
 ['---','---','---','---','---','---','---'],...perf])}

${markdownTable([['Profile','Page','First byte ms','DOM-ready ms','First contentful paint ms','Load ms'],
 ['---','---','---','---','---','---'],...loading])}

Blank timings mean the browser had yet to publish an entry at capture. The complete clocks and samples by profile are in \`PERFORMANCE.json\`.

## Visual assessment and next implementation prompts

${manual||'A fresh manual visual assessment was not supplied for this capture. Inspect each contact sheet and compare the full-resolution imagery to the approved Front Hall and Main Hall references before marking anything visually acceptable. Use the defect source links in the accompanying QA runbook as starting points.'}

## Review files

- \`CONTACT_SHEET.jpg\` covers the desktop route. \`contact-sheets/\` contains separate sheets by viewport and space.
- \`screenshots/\` contains full-resolution JPEGs. For each dimensional stop, 00–07 are 45° horizontal steps relative to the labeled forward facing. 08 and 09 look up and down.
- \`videos/\` contains independent route recordings without contact-sheet pauses. WebM video has no audio.
- \`PLAYWRIGHT_RESULTS.json\` includes the checked states, route diagnostics and capture inventory.
- \`PERFORMANCE.json\` contains the performance samples and navigation timings. \`BUILD.json\` records Git and preview provenance.
`;
}
function publish(){
 fs.mkdirSync(dest,{recursive:true});
 if(fs.existsSync(output)&&!fs.existsSync(path.join(output,marker)))
  throw Error('Existing output folder lacks the generated marker. Move it before running again.');
 if(fs.existsSync(archive)&&!fs.existsSync(path.join(output,marker)))
  throw Error('Existing ZIP has no matching generated folder. Move it before running again.');
 fs.writeFileSync(path.join(bundle,marker),'Generated by npm run review:site\n');
 const stagedArchive=path.join(stage,'STUDIO_LADUKE_REVIEW.zip');
 execFileSync('zip',['-q','-r',stagedArchive,path.basename(bundle),'-x','*/'+marker],{cwd:stage});
 execFileSync('unzip',['-tq',stagedArchive]);
 if(fs.existsSync(output))fs.rmSync(output,{recursive:true});
 fs.cpSync(bundle,output,{recursive:true});
 fs.copyFileSync(stagedArchive,archive);
}
async function main(){
 server.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const journeys=[],recordings=[];
 try{
  meta.browserVersion=browser.version();
  meta.auditOrigin=base;
  meta.renderer='Chromium with ANGLE SwiftShader requested';
  const quick=process.env.STUDIO_REVIEW_QUICK==='1';
  for(const profile of quick?[profiles[0]]:profiles){
   const result=await runJourney(browser,profile,base,{throttle:profile.hasTouch?4:1});
   journeys.push(result);
   console.log(profile.id,Object.keys(result.angles).length+' angles',result.failure||'route complete');
  }
  if(!quick){
   for(const profile of [profiles[0],profiles[2]])recordings.push(await runJourney(browser,profile,base,{record:true,capture:false}));
  }
  if(journeys.some(j=>Object.keys(j.angles).length))renderSheets(journeys);
  const write=(name,data)=>fs.writeFileSync(path.join(bundle,name),JSON.stringify(data,null,2)+'\n');
  const manual=getManualNotes();
  fs.copyFileSync(path.join(__dirname,'REVIEW.md'),path.join(bundle,'RUNBOOK.md'));
  write('BUILD.json',meta);
  write('PLAYWRIGHT_RESULTS.json',{journeys,recordings});
  write('PERFORMANCE.json',journeys.map(({profile,pacing,loads})=>({profile,pacing,loads})));
  fs.writeFileSync(path.join(bundle,'REVIEW.md'),createReport(journeys,recordings,manual,base));
  publish();
  console.log(archive);
  if([...journeys,...recordings].some(j=>j.failure||Object.values(j.checks).some(c=>!c.pass)||
   j.diag.exceptions.length||j.diag.httpErrors.length||j.diag.requests.length))process.exitCode=1;
 }finally{await browser.close();}
}
main().catch(e=>{console.error(clean(e.message));process.exitCode=1;})
 .finally(()=>{server.close();fs.rmSync(stage,{recursive:true,force:true});});
