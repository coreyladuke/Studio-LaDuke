/* Complete-house scene direction. Original Studio LaDuke scenes are preserved;
   supplemental cabin photography credited in house-scene-sources.md. */
(function(){
"use strict";
const V2=window.StudioHouseV2;
if(!V2)return;
const pex=(id)=>"assets/house-plates/pexels-"+id+".jpg";
const rooms={
 hall:{image:"assets/front-room-doors.webp",warm:[1195,460]},
 dining:{image:pex(7163611),warm:[950,300],fallback:"assets/front-room-wide.webp"},
 kitchen:{image:pex(37084525),warm:[1100,370],fallback:"assets/workshop-in-use.webp"},
 pantry:{image:"assets/forgotten-works.webp",warm:[1200,220]},
 art:{image:"assets/corey-studio.webp",warm:[1100,230]},
 bath:{image:pex(8266866),warm:[1120,380],fallback:"assets/gallery-room-v2.webp"},
 mud:{image:pex(20678530),warm:[1180,350],fallback:"assets/workshop-in-use.webp"},
 laundry:{image:pex(4846272),warm:[850,370],fallback:"assets/workshop-cleared.webp"},
 porch:{image:pex(8583538),warm:[400,360],fallback:"assets/bob-greenhouse-threshold.webp",rain:true},
 landing:{image:pex(35695313),warm:[1080,440],fallback:"assets/front-room-doors.webp"},
 bed:{image:pex(9056665),warm:[1230,320],fallback:"assets/writing-desk.webp"},
 closet:{image:pex(8589124),warm:[800,440],fallback:"assets/forgotten-works.webp"},
 bath2:{image:pex(12059391),warm:[1120,360],fallback:"assets/gallery-room-v2.webp"},
 guest:{image:pex(9056663),warm:[1270,365],fallback:"assets/writing-desk.webp"},
 library:{image:"assets/writing-desk.webp",warm:[315,230]},
 music:{image:"assets/denali-music-room.webp",warm:[1140,310]},
 roof:{image:pex(34053448),warm:[1000,580],fallback:"assets/bob-greenhouse-threshold.webp",rain:true},
 attic:{image:pex(40823982),warm:[1070,460],fallback:"assets/cartridge-console.webp"},
 basement:{image:pex(35489868),warm:[1030,330],fallback:"assets/workshop-cleared.webp"},
 arcade:{image:"assets/mcbrides-cabinet-row.webp",warm:[960,440]},
 recording:{image:pex(39371478),warm:[850,380],fallback:"assets/denali-music-room.webp"},
 cinema:{image:pex(40467089),warm:[910,460],fallback:"assets/gallery-room-v2.webp"},
 escape:{image:"assets/prism-workbench.webp",warm:[800,440]},
 vault:{image:"assets/forgotten-works.webp",warm:[1170,460]}
};
document.body.classList.add("directed-house");
function escapeAttr(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
function scene(which){
 if(["foyer","coat","living"].includes(which))return V2.scene(which);
 const r=rooms[which];if(!r)return "";
 const src=escapeAttr(r.image),fallback=escapeAttr(r.fallback||r.image);
 const bg=src.includes("https://images.pexels.com/")?
 '<image href="'+fallback+'" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/><image href="'+src+'" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>':
 '<image href="'+src+'" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>';
 let special="";
 if(["vault","pantry"].includes(which)){
  special='<g class="scene-reveal"><rect x="280" y="120" width="1040" height="650" rx="9" fill="#160e0a" opacity=".84"/>'+
  '<image href="assets/workshop-drawer.webp" x="323" y="153" width="960" height="570" preserveAspectRatio="xMidYMid meet"/>'+
  '<rect x="323" y="153" width="960" height="570" fill="none" stroke="#a97d4b" stroke-width="17"/></g>';
 }
 if(["library","art","closet","attic"].includes(which)){
  const cover=which==="library"?"assets/everybody-home-cover.webp":which==="art"?"assets/corey-carved-paddle.jpeg":which==="closet"?"assets/feel-the-burn-print.webp":"assets/cartridge-maverick.webp";
  special='<g class="scene-reveal"><rect x="568" y="164" width="470" height="560" rx="6" fill="#180e09" opacity=".8"/>'+
  '<image href="'+cover+'" x="588" y="182" width="430" height="520" preserveAspectRatio="xMidYMid meet"/>'+
  '<rect x="586" y="180" width="434" height="524" fill="none" stroke="#d2a66d" stroke-width="12"/></g>';
 }
 if(which==="cinema"){
  special='<g class="scene-film"><rect x="315" y="138" width="970" height="625" fill="#0a0b0d" stroke="#8d7356" stroke-width="15"/>'+
  '<image href="assets/archive-maverick.webp" x="348" y="166" width="902" height="560" preserveAspectRatio="xMidYMid meet"/>'+
  '<rect x="348" y="166" width="902" height="560" fill="#f7daa0" opacity=".08"/></g>';
 }
 if(which==="escape"){
  special='<g class="scene-prism"><ellipse cx="820" cy="340" rx="360" ry="150" fill="#54c2fa" opacity=".24"/>'+
  '<path d="M560 760L1025 140L1130 150L700 785Z" fill="#6c80f4" opacity=".28"/>'+
  '<path d="M630 760L1020 120L1110 130L760 775Z" fill="#e1baff" opacity=".2"/></g>';
 }
 if(which==="recording"){
  special='<g class="scene-reveal"><image href="assets/cartridge-console.webp" x="515" y="435" width="560" height="330" preserveAspectRatio="xMidYMid meet"/></g>';
 }
 const rain=r.rain?Array.from({length:30},(_,i)=>{
  const x=(i*173)%1570+15,y=(i*59)%830;
  return '<path d="M'+x+' '+y+'l-13 32" stroke="#dce9ef" stroke-opacity=".14" stroke-width="2"/>';
 }).join(""):"";
 return '<svg class="house-scene house-photo house-directed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">'+
 '<defs><radialGradient id="houseWarm"><stop stop-color="#f7cb8b" stop-opacity=".32"/><stop offset=".45" stop-color="#edb55a" stop-opacity=".13"/><stop offset="1" stop-color="#df9d4d" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="houseVignette"><stop offset=".44" stop-color="#0b1716" stop-opacity="0"/><stop offset="1" stop-color="#081011" stop-opacity=".73"/></radialGradient>'+
 '<radialGradient id="houseSpot"><stop stop-color="#ffe9ae" stop-opacity=".8"/><stop offset=".4" stop-color="#e9bf77" stop-opacity=".35"/><stop offset="1" stop-color="#efbd66" stop-opacity="0"/></radialGradient></defs>'+
 bg+
 '<rect width="1600" height="900" fill="#15211d" opacity=".19" pointer-events="none"/>'+
 '<ellipse cx="'+r.warm[0]+'" cy="'+r.warm[1]+'" rx="380" ry="340" fill="url(#houseWarm)" pointer-events="none"/>'+
 '<rect width="1600" height="900" fill="url(#houseVignette)" pointer-events="none"/>'+
 '<rect class="scene-lamp-shade" width="1600" height="900" fill="#060b0e" pointer-events="none"/>'+
 '<rect class="scene-mist" width="1600" height="900" fill="#d6dcdb" pointer-events="none"/>'+
 '<circle class="scene-spot" cx="800" cy="520" r="200" fill="url(#houseSpot)" pointer-events="none"/>'+
 '<ellipse class="scene-steam" cx="800" cy="420" rx="190" ry="250" fill="url(#houseWarm)" pointer-events="none"/>'+
 '<ellipse class="scene-spark" cx="820" cy="570" rx="350" ry="190" fill="url(#houseSpot)" pointer-events="none"/>'+
 rain+special+'</svg>';
}
function activate(room,p,ctx){
 const type=p[0],x=p[1],y=p[2],title=p[3],copy=p[4],plate=ctx.plate;
 if(["living","foyer","coat"].includes(room)){
  const handled=V2.activate(room,type,ctx);if(handled)return true;
 }
 plate.classList.remove("discovered");
 const spot=document.querySelector("#painting .scene-spot");
 if(spot){spot.setAttribute("cx",x);spot.setAttribute("cy",y);plate.classList.add("discovered");}
 if(room==="escape" && (type==="switch"||type==="record"||type==="trophy")){
  const clue={switch:"FIRST = 4",record:"SECOND = 7",trophy:"THIRD = 2"}[type];
  plate.classList.toggle("light-on");ctx.toast(clue);return true;
 }
 const action={
  lamp:"lamp-dim",mirror:"mirror-fog",cup:"steam-on",switch:"light-on",
  tv:"tv-playing",chest:"drawer-open",trophy:"spark-on",record:"spark-on",
  rain:"spark-on",window:"spark-on",board:"spark-on",shelf:"drawer-open",
  hanger:"drawer-open",brush:"drawer-open",book:"drawer-open",
  star:"spark-on",joystick:"light-on",yellow:"spark-on",pink:"spark-on",
  pick:"spark-on",paw:"spark-on",sofa:"spark-on",stairs:"light-on",lock:"light-on"
 }[type]||"spark-on";
 plate.classList.toggle(action);
 if(["lamp","mirror","chest","tv","cup","hanger","brush"].includes(type))return true;
 ctx.toast(copy&&copy.length<160?copy:title);
 return true;
}
window.StudioHouseDirector={scene,activate,rooms};
})();