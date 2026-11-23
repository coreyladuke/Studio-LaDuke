/* Studio LaDuke optional discovery pocketbook. No tracking.
   Stores only local IDs and never accesses private owner resources. */
(function(){
"use strict";
const KEY="studioladuke.house.discovery.v1";
const THREAD_KEY="studioladuke.house.thread.enabled.v1";
let threadOn=false;
try{threadOn=localStorage.getItem(THREAD_KEY)==="true"}catch(_){}
const threadHints=["An unusual star sits near the beginning. Look for five notes.","Something interesting got lost where people sit and listen.","Check the little things that get left in pockets.","An ordinary library can hide an extraordinary route.","One instrument has been part of this house for years.","Some of the best worlds in the house belong to someone else.","Three clues open a place you were not supposed to find.","Look inside the vault. The smallest things still matter."];
const entries=[
 {id:"foyer:star",room:"foyer",label:"Five notes, one star",media:{kind:"ticket",ticket:"FIVE NOTES",caption:"THE SKYLIGHT IS STILL BEING MADE"},detail:"The star hangs over the way in. Upstairs, the instruments have stories of their own."},
 {id:"living:sofa",room:"living",label:"Something between the cushions",media:{kind:"ticket",ticket:"STUDIO LADUKE",caption:"A LITTLE SOMETHING FROM THE RECORD CRATE"},detail:"There is always something left behind where people used to sit and listen."},
 {id:"coat:chest",room:"coat",label:"The forgotten pocket",media:{kind:"ticket",ticket:"ADMIT ONE",caption:"AN IMAGINARY KEEPSAKE"},detail:"A ticket, a pick, an ordinary day that became a keepsake."},
 {id:"library:shelf",room:"library",label:"Not all shelves are shelves",media:{kind:"image",src:"assets/everybody-home-cover.webp",alt:"Everybody Deserves to Go Home book cover artwork"},detail:"The bookcase hides a way upward into a smaller kingdom."},
 {id:"music:yellow",room:"music",label:"Sixteen",media:{kind:"destination",to:"music.html",action:"Enter the Music Room"},detail:"The yellow guitar came into this story a long time ago."},
 {id:"attic:board",room:"attic",label:"A world inside a world",media:{kind:"image",src:"assets/cartridge-maverick.webp",alt:"Super Maverick cartridge artwork"},detail:"The adventures upstairs aren't all the owner's. Some belong to Maverick."},
 {id:"escape:solved",room:"escape",label:"Three clues. One door.",media:{kind:"ticket",ticket:"4 · 7 · 2",caption:"A DOOR OPENED"},detail:"You found the way through. Something unusual waits on the other side."},
 {id:"vault:chest",room:"vault",label:"Keep the unusual",media:{kind:"destination",to:"forgotten-works.html",action:"Browse forgotten works"},detail:"A secret doesn't need to be expensive to be worth keeping."}
];
let found=new Set();
try{const raw=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(raw))found=new Set(raw.filter(x=>entries.some(e=>e.id===x)))}catch(_){}
const announce=document.createElement("span");announce.id="housePocketAnnouncement";announce.setAttribute("role","status");announce.setAttribute("aria-live","polite");
const toggle=document.createElement("button");toggle.type="button";toggle.id="housePocketToggle";
toggle.setAttribute("aria-label","Open your discoveries pocketbook");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-controls","housePocketPanel");
const shade=document.createElement("div");shade.id="housePocketShade";shade.hidden=true;
const panel=document.createElement("section");panel.id="housePocketPanel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Your discoveries pocketbook");
panel.innerHTML='<button type="button" id="housePocketClose" aria-label="Close pocketbook">×</button><h2>Loose Threads</h2><p class="sub">Little pieces of a much bigger story. No checklist to finish. Just things worth noticing.</p><section id="houseThread" aria-label="Optional hidden story"><button type="button" id="houseThreadToggle" aria-pressed="false">Follow a hidden thread</button><p id="houseThreadHint" hidden></p></section><ul id="housePocketList"></ul><div class="privacy">Saved only on this device. <button id="housePocketReset" type="button">Start a fresh pocketbook</button></div>';
function redraw(){
 toggle.innerHTML='✦ Pocketbook <span class="count">'+(found.size?found.size+" finds":"")+"</span>";
 const list=panel.querySelector("#housePocketList");list.replaceChildren();
 const switcher=panel.querySelector("#houseThreadToggle"),hint=panel.querySelector("#houseThreadHint");
 switcher.setAttribute("aria-pressed",String(threadOn));
 switcher.textContent=threadOn?"Pause the hidden thread":"Follow a hidden thread";
 hint.hidden=!threadOn;
 if(threadOn){
  const nextIndex=entries.findIndex(e=>!found.has(e.id));
  hint.textContent=nextIndex===-1?"The thread was never a finish line. Another song, another strange object, another room can always be made.":threadHints[nextIndex];
 }
 for(const entry of entries.filter(e=>found.has(e.id))){
  const li=document.createElement("li"),title=document.createElement("strong"),p=document.createElement("p"),btn=document.createElement("button");
  title.textContent=entry.label;p.textContent=entry.detail;btn.textContent="Return to this place";
  btn.type="button";btn.addEventListener("click",()=>{close();if(typeof window.StudioHouseGo==="function")window.StudioHouseGo(entry.room);else location.href="house.html?room="+encodeURIComponent(entry.room)});
  li.append(title);
  if(entry.media){
   if(entry.media.kind==="image"||entry.media.kind==="symbol"){
    const img=document.createElement("img");img.src=entry.media.src;img.alt=entry.media.alt;img.loading="lazy";img.className="house-pocket-image";li.append(img);
   }else if(entry.media.kind==="ticket"){
    const ticket=document.createElement("div"),main=document.createElement("strong"),small=document.createElement("span");
    ticket.className="house-pocket-ticket";main.textContent=entry.media.ticket;small.textContent=entry.media.caption;ticket.append(main,small);li.append(ticket);
   }else if(entry.media.kind==="destination"){
    const destination=document.createElement("a");destination.href=entry.media.to;destination.textContent=entry.media.action;destination.className="house-pocket-destination";li.append(destination);
   }
  }
  li.append(p,btn);list.append(li);
 }
 if(!found.size){const li=document.createElement("li");li.className="empty";li.textContent="The pages are still blank. Try the star at the front, a pocket, or something tucked between the cushions.";list.append(li);}
}
function open(){redraw();shade.hidden=false;panel.hidden=false;toggle.setAttribute("aria-expanded","true");panel.querySelector("#housePocketClose").focus();}
function close(){if(panel.hidden)return;panel.hidden=true;shade.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus();}
function collect(room,type){
 const id=room+":"+type;
 if(!entries.some(e=>e.id===id)||found.has(id))return false;
 found.add(id);try{localStorage.setItem(KEY,JSON.stringify([...found]))}catch(_){}
 redraw();const entry=entries.find(e=>e.id===id);announce.textContent=entry.label+' added to the pocketbook';toggle.classList.remove('new-find');void toggle.offsetWidth;toggle.classList.add('new-find');setTimeout(()=>toggle.classList.remove('new-find'),850);return true;
}
function clear(){found.clear();try{localStorage.removeItem(KEY)}catch(_){}redraw();}
function init(){
 document.body.append(toggle,shade,panel,announce);redraw();
 toggle.addEventListener("click",open);shade.addEventListener("click",close);
 panel.querySelector("#housePocketClose").addEventListener("click",close);
 panel.querySelector("#housePocketReset").addEventListener("click",clear);
 panel.querySelector("#houseThreadToggle").addEventListener("click",()=>{
  threadOn=!threadOn;
  try{localStorage.setItem(THREAD_KEY,String(threadOn))}catch(_){}
  redraw();
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){e.preventDefault();e.stopImmediatePropagation();close()}},true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
window.StudioHouseAdventure={collect,close,get count(){return found.size},get isOpen(){return !panel.hidden}};
})();