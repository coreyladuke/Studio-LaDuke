/* Studio LaDuke optional discovery pocketbook. No tracking.
   Stores only local IDs and never accesses private owner resources. */
(function(){
"use strict";
const KEY="studioladuke.house.discovery.v1";
const entries=[
 {id:"foyer:star",room:"foyer",label:"Five notes, one star",detail:"The star hangs over the way in. Upstairs, the instruments have stories of their own."},
 {id:"living:sofa",room:"living",label:"Something between the cushions",detail:"There is always something left behind where people used to sit and listen."},
 {id:"coat:chest",room:"coat",label:"The forgotten pocket",detail:"A ticket, a pick, an ordinary day that became a keepsake."},
 {id:"library:shelf",room:"library",label:"Not all shelves are shelves",detail:"The bookcase hides a way upward into a smaller kingdom."},
 {id:"music:yellow",room:"music",label:"Sixteen",detail:"The yellow guitar came into this story a long time ago."},
 {id:"attic:board",room:"attic",label:"A world inside a world",detail:"The adventures upstairs aren't all the owner's. Some belong to Maverick."},
 {id:"escape:solved",room:"escape",label:"Three clues. One door.",detail:"You found the way through. Something unusual waits on the other side."},
 {id:"vault:chest",room:"vault",label:"Keep the unusual",detail:"A secret doesn't need to be expensive to be worth keeping."}
];
let found=new Set();
try{const raw=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(raw))found=new Set(raw.filter(x=>entries.some(e=>e.id===x)))}catch(_){}
const toggle=document.createElement("button");toggle.type="button";toggle.id="housePocketToggle";
toggle.setAttribute("aria-label","Open your discoveries pocketbook");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-controls","housePocketPanel");
const shade=document.createElement("div");shade.id="housePocketShade";shade.hidden=true;
const panel=document.createElement("section");panel.id="housePocketPanel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Your discoveries pocketbook");
panel.innerHTML='<button type="button" id="housePocketClose" aria-label="Close pocketbook">×</button><h2>Loose Threads</h2><p class="sub">Little pieces of a much bigger story. No checklist to finish. Just things worth noticing.</p><ul id="housePocketList"></ul><div class="privacy">Saved only on this device. <button id="housePocketReset" type="button">Start a fresh pocketbook</button></div>';
function redraw(){
 toggle.innerHTML='✦ Pocketbook <span class="count">'+found.size+'/'+entries.length+'</span>';
 const list=panel.querySelector("#housePocketList");list.replaceChildren();
 for(const entry of entries.filter(e=>found.has(e.id))){
  const li=document.createElement("li"),title=document.createElement("strong"),p=document.createElement("p"),btn=document.createElement("button");
  title.textContent=entry.label;p.textContent=entry.detail;btn.textContent="Return to this place";
  btn.type="button";btn.addEventListener("click",()=>{close();if(typeof window.StudioHouseGo==="function")window.StudioHouseGo(entry.room);else location.href="house.html?room="+encodeURIComponent(entry.room)});
  li.append(title,p,btn);list.append(li);
 }
 if(!found.size){const li=document.createElement("li");li.className="empty";li.textContent="The pages are still blank. Try the star at the front, a pocket, or something tucked between the cushions.";list.append(li);}
}
function open(){redraw();shade.hidden=false;panel.hidden=false;toggle.setAttribute("aria-expanded","true");panel.querySelector("#housePocketClose").focus();}
function close(){if(panel.hidden)return;panel.hidden=true;shade.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus();}
function collect(room,type){
 const id=room+":"+type;
 if(!entries.some(e=>e.id===id)||found.has(id))return false;
 found.add(id);try{localStorage.setItem(KEY,JSON.stringify([...found]))}catch(_){}
 redraw();return true;
}
function clear(){found.clear();try{localStorage.removeItem(KEY)}catch(_){}redraw();}
function init(){
 document.body.append(toggle,shade,panel);redraw();
 toggle.addEventListener("click",open);shade.addEventListener("click",close);
 panel.querySelector("#housePocketClose").addEventListener("click",close);
 panel.querySelector("#housePocketReset").addEventListener("click",clear);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){e.preventDefault();e.stopImmediatePropagation();close()}},true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
window.StudioHouseAdventure={collect,close,get count(){return found.size}};
})();