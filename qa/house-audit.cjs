/* Studio LaDuke full-house audit.
   Run from repository root after: npm install --no-save playwright
   Start local server separately: python3 -m http.server 8765
   node qa/house-audit.cjs
   Generates QA JSON plus per-room screenshots in /tmp/studio-laduke-house-qa.
*/
const fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=process.cwd(),html=fs.readFileSync("house.html","utf8");
const raw=html.split("const R={")[1].split("};\nconst floors")[0];
const rooms=[...raw.matchAll(/^\s*(\w+):\{n:"([^"]+)",f:(\d+)/gm)].map(x=>({id:x[1],name:x[2],floor:+x[3]}));
const pages=fs.readdirSync(root).filter(x=>x.endsWith(".html")).sort();
const out="/tmp/studio-laduke-house-qa",base="http://127.0.0.1:8765/";
fs.mkdirSync(out,{recursive:true});
async function main(){
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const result={date:new Date().toISOString(),head:process.env.GIT_SHA||"",rooms:[],pages:[]};
 for(const room of rooms){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  page.setDefaultTimeout(3500);
  const errors=[],badAssets=[];
  page.on("pageerror",e=>errors.push(e.message.slice(0,220)));
  page.on("response",r=>{if(r.status()>=400)badAssets.push(r.status()+" "+r.url().slice(0,170))});
  try{
   await page.goto(base+"house.html?room="+room.id,{waitUntil:"domcontentloaded",timeout:22000});
   await page.waitForTimeout(270);
   const details=await page.evaluate(()=>({
    heading:document.querySelector("#roomName")?.textContent||"",
    photo:!!document.querySelector("#painting svg.house-photo"),
    generic:!!document.querySelector("#painting svg:not(.house-photo):not(.house-scene)"),
    imageSrcs:[...document.querySelectorAll("#painting image")].map(e=>e.getAttribute("href")),
    doors:[...document.querySelectorAll(".door")].map(e=>e.getAttribute("aria-label")),
    props:[...document.querySelectorAll(".prop")].map(e=>e.getAttribute("aria-label")),
    floor:document.querySelector("#floorName")?.textContent||"",
    hasMap:!!document.querySelector("#mapOpen"),
    roomSignHidden:!!document.querySelector(".room-sign")&&getComputedStyle(document.querySelector(".room-sign")).display==="none",
    toast:document.querySelector("#toast")?.classList.contains("show")||false
   }));
   let popups=0,interactions=0,clickFailures=0;
   for(const label of details.props){
    try{
     let btn=page.getByRole("button",{name:label,exact:true}).first();
     for(let look=0;look<6;look++){
      const rect=await btn.boundingBox();if(!rect)break;
      if(rect.x<14){const left=page.locator("#left");if(await left.isDisabled())break;await left.click({force:true});}
      else if(rect.x+rect.width>390){const right=page.locator("#right");if(await right.isDisabled())break;await right.click({force:true});}
      else break;
     }
     await btn.click({force:true,timeout:2200});
     interactions++;
     if(await page.locator("#dialog").isVisible()){
      if(label!=="The brass keypad")popups++;
      await page.locator("#closeDialog").click({force:true,timeout:2000});
     }
     if(!page.url().includes("house.html?room="+room.id))await page.goto(base+"house.html?room="+room.id,{waitUntil:"domcontentloaded",timeout:22000});
    }catch(e){clickFailures++;errors.push("Interaction "+label+": "+e.message.slice(0,80));}
   }
   await page.goto(base+"house.html?room="+room.id,{waitUntil:"domcontentloaded",timeout:22000});
   await page.screenshot({path:path.join(out,room.id+"-mobile.jpg"),type:"jpeg",quality:30});
   result.rooms.push({...room,...details,popups,interactions,clickFailures,errors,badAssets});
  }catch(e){result.rooms.push({...room,error:e.message.slice(0,180),errors,badAssets});}
  await page.close();
 }
 for(const file of pages){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[],badAssets=[];
  page.on("pageerror",e=>errors.push(e.message.slice(0,180)));
  page.on("response",r=>{if(r.status()>=400)badAssets.push(r.status()+" "+r.url().slice(0,100))});
  try{
   const response=await page.goto(base+file,{waitUntil:"domcontentloaded",timeout:22000});
   await page.waitForTimeout(170);
   const title=await page.title(),buttons=await page.locator("button").count();
   const bodyLength=await page.locator("body").evaluate(e=>(e.innerText||"").length);
   await page.screenshot({path:path.join(out,"page-"+file+".jpg"),type:"jpeg",quality:24,timeout:12000});
   result.pages.push({file,title,status:response.status(),bodyLength,buttons,errors,badAssets});
  }catch(e){result.pages.push({file,error:e.message.slice(0,180),errors,badAssets});}
  await page.close();
 }
 await browser.close();
 fs.writeFileSync(path.join(out,"report.json"),JSON.stringify(result,null,2));
 const summary={rooms:result.rooms.length,photoScenes:result.rooms.filter(r=>r.photo).length,genericScenes:result.rooms.filter(r=>!r.photo).map(r=>r.id),nonPuzzlePopups:result.rooms.filter(r=>r.popups>0).map(r=>r.id),roomErrors:result.rooms.filter(r=>r.error||r.errors.length||r.badAssets.length).map(r=>({room:r.id,errors:r.errors.slice(0,2),badAssets:r.badAssets.slice(0,2)})),pages:result.pages.length,pageErrors:result.pages.filter(r=>r.error||r.status!==200||r.errors.length||r.badAssets.length).map(r=>({file:r.file,errors:r.errors.slice(0,2),badAssets:r.badAssets.slice(0,2)}))};
 console.log("SUMMARY "+JSON.stringify(summary));
 console.log("ROOMS "+JSON.stringify(result.rooms.map(r=>({room:r.id,photo:r.photo,interactions:r.interactions,popups:r.popups,clickFailures:r.clickFailures}))));
 console.log("PAGES "+JSON.stringify(result.pages.map(p=>({file:p.file,status:p.status,errors:p.errors?.length,assets:p.badAssets?.length}))));
 if(summary.genericScenes.length||summary.nonPuzzlePopups.length||summary.roomErrors.length||summary.pageErrors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=2});