import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js";
/* Five distinct ORIGINAL 3D environments. The titles name cinematic inspirations,
   not licensed film assets, logos, characters, dialogue, music or copied sets. */
const game=window.StudioMovieMaze;
if(!game)throw Error("Movie Maze game logic must load before its renderer.");
const canvas=document.getElementById("cinema3d"),loading=document.getElementById("loading");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
let renderer,scene,camera,roomRoot,roomLights=[],clocks=[],clickables=[],vivid=[],frame=0,lastTime=performance.now(),yaw=0,pitch=0,yawAim=0,pitchAim=0,entryTime=0,qualityTuned=false,exitHinge=null,exitLight=null,exitThreshold=null,renderStarted=0;
const roomMaterials=new Set(),roomTextures=new Set();
const raycaster=new THREE.Raycaster(),cursor=new THREE.Vector2(),touch={down:false,drag:false,x:0,y:0,startX:0,startY:0};
const C={wood:"#764a31",gold:"#dbad68",cream:"#eddfc5",ink:"#191b1f",red:"#ac3c3a",purple:"#713d8b"};
function mat(color,roughness=.7,metalness=0,extras={}){return new THREE.MeshStandardMaterial({color,roughness,metalness,...extras});}
const M={
 wood:mat("#8c6548",.67),woodDark:mat("#38281e",.75),oak:mat("#b27b53",.69),
 brass:mat("#d5aa68",.27,.78),chrome:mat("#d9d2c3",.18,.9),iron:mat("#292c31",.4,.6),
 paper:mat("#eadab8",.83),ivory:mat("#f6e8c8",.84),black:mat("#16161a",.46,.15),
 purple:mat("#67387f",.45,.09),green:mat("#2b994b",.4,.14),red:mat("#9d3135",.51),
 blue:mat("#3c7fbd",.33,.24),orange:mat("#c97634",.45,.12),grey:mat("#73787e",.47,.5),
 velvet:mat("#532e55",.91),cloth:mat("#d5bb90",.86)
};
const sharedMaterials=new Set(Object.values(M));
function mesh(geo,material,x=0,y=0,z=0,parent=roomRoot){
 if(material&&!sharedMaterials.has(material)){roomMaterials.add(material);if(material.map)roomTextures.add(material.map);}
 const obj=new THREE.Mesh(geo,material);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
function box(w,h,d,x,y,z,material,parent){return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent)}
function cyl(rt,rb,h,x,y,z,material,n=24,parent){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),material,x,y,z,parent)}
function sphere(radius,x,y,z,material,parent){return mesh(new THREE.SphereGeometry(radius,18,12),material,x,y,z,parent)}
function ring(radius,r,x,y,z,material,parent){const o=mesh(new THREE.TorusGeometry(radius,r,9,30),material,x,y,z,parent);return o}
function tube(points,r,material,parent=roomRoot){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(22,points.length*9),r,7,false),material,0,0,0,parent)}
function addProp(action,label,x,y,z,width=1.8,height=2.4,depth=1.8){
 const g=new THREE.Group();g.position.set(x,y,z);roomRoot.add(g);
 g.userData.action=action;g.userData.label=label;clickables.push(g);
 const collider=box(width,height,depth,0,height*.3,0,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),g);
 collider.castShadow=false;collider.receiveShadow=false;collider.userData.collider=true;
 return g;
}
function labelTexture(text,opt={}){
 const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d");
 x.fillStyle=opt.background||"#201b20";x.fillRect(0,0,1024,512);
 x.strokeStyle=opt.border||"#cba16c";x.lineWidth=20;x.strokeRect(23,23,978,466);
 x.fillStyle=opt.ink||"#f5ddaf";x.textAlign="center";x.textBaseline="middle";
 const lines=text.split("\n"),sz=opt.size||Math.min(125,Math.floor(920/Math.max(7,...lines.map(l=>l.length)) *1.8));
 x.font=(opt.font||"bold ")+sz+"px Georgia";
 for(let i=0;i<lines.length;i++)x.fillText(lines[i],512,256+(i-(lines.length-1)/2)*(sz*1.25),930);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function plaque(text,x,y,z,w=3,h=1,options={},parent=roomRoot){
 const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
 box(w+.12,h+.12,.09,0,0,0,M.woodDark,g);
 const map=labelTexture(text,options);
 const m=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide});
 mesh(new THREE.PlaneGeometry(w,h),m,0,0,.07,g);
 return g;
}
function stageFloorTexture(type){
 const c=document.createElement("canvas");c.width=c.height=1024;const g=c.getContext("2d");
 g.fillStyle=type==="ghost"?"#273136":type==="shining"?"#8a3b25":type==="beetle"?"#ddd7bf":type==="wayne"?"#7f5838":"#c9ab7d";g.fillRect(0,0,1024,1024);
 if(type==="ghost"){
  for(let i=0;i<9000;i++){
   const x=(i*973)%1024,y=(i*i*37+i*13)%1024;
   g.fillStyle=i%3?"#a18d7825":"#090c1140";
   g.fillRect(x,y,1+i%4,1+i%3);
  }
  g.strokeStyle="#161c1e";g.lineWidth=5;g.strokeRect(2,2,1020,1020);
  for(const x of [190,805]){g.fillStyle="#9a784341";g.fillRect(x,0,9,1024);}
 }else if(type==="shining"){
  // Original interpretation: bold scarlet/gold interlocking zigzags, not the film's exact carpet pattern.
  for(let row=0;row<7;row++)for(let col=0;col<6;col++){
   const xx=col*180+(row%2)*90,yy=row*156;
   g.fillStyle="#cb6b2a";g.beginPath();g.moveTo(xx+85,yy+8);g.lineTo(xx+170,yy+80);g.lineTo(xx+85,yy+152);g.lineTo(xx,yy+80);g.closePath();g.fill();
   g.strokeStyle="#edc18b";g.lineWidth=12;g.stroke();
   g.strokeStyle="#502a2e";g.lineWidth=7;g.strokeRect(xx+41,yy+40,88,80);
  }
 }else if(type==="beetle"){
  g.fillStyle="#f4efdf";g.fillRect(0,0,1024,1024);
  g.strokeStyle="#24212b";g.lineWidth=45;
  for(let i=-15;i<20;i++){g.beginPath();g.moveTo(i*100,0);g.lineTo(i*100+1024,1024);g.stroke();}
 }else if(type==="wayne"){
  for(let j=0;j<22;j++){
   const y=j*49;g.fillStyle=j%3===0?"#5f3b27":"#8f6447";g.fillRect(0,y,1024,47);
   g.strokeStyle="#302016";g.lineWidth=4;g.strokeRect(0,y,1024,47);
  }
  for(let j=0;j<200;j++){g.fillStyle="#d2ad8b2a";g.fillRect((j*121)%1024,(j*57)%1024,2,12);}
 }else{
  const size=96;for(let y=0;y<11;y++)for(let x=0;x<11;x++){
   g.fillStyle=(x+y)%2?"#c65d43":"#eddab9";g.fillRect(x*size,y*size,size,size);
   g.strokeStyle="#f2dfb2";g.lineWidth=4;g.strokeRect(x*size,y*size,size,size);
  }
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,2.5);tex.anisotropy=4;return tex;
}
function masonryTexture(){
 const canvas=document.createElement("canvas");canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext("2d");
 ctx.fillStyle="#373631";ctx.fillRect(0,0,512,256);
 for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
  const x=col*64+(row%2)*32,y=row*32;
  const tone=54+((row*27+col*13+50)%34);
  ctx.fillStyle=`rgb(${tone+14},${tone-1},${tone-9})`;ctx.fillRect(x+2,y+2,61,28);
  ctx.fillStyle="#e7b39221";ctx.fillRect(x+2,y+2,61,2);
  ctx.fillStyle="#15131652";ctx.fillRect(x+2,y+27,61,3);
 }
 for(let i=0;i<5800;i++){
  ctx.fillStyle=i%4?"#17141625":"#d9bfaa22";
  ctx.fillRect((i*101)%512,(i*i*13+i*29)%256,2,1+i%3);
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,1.3);texture.anisotropy=4;
 return texture;
}
const lights={ghost:["#8ebd9e","#54d77e"],shining:["#eeaa72","#d67d4b"],beetle:["#a7e09b","#78f983"],wayne:["#ceaee9","#a8b4ff"],stand:["#edd5a1","#edaa78"]};
function createRoom(stage){
 if(roomRoot){
  scene.remove(roomRoot);
  roomRoot.traverse(o=>o.geometry?.dispose());
  for(const material of roomMaterials)material.dispose();
  for(const texture of roomTextures)texture.dispose();
  roomMaterials.clear();roomTextures.clear();
 }
 roomRoot=new THREE.Group();roomRoot.name="Studio Film: "+stage.film;scene.add(roomRoot);clickables=[];vivid=[];roomLights=[];
 const theme=lights[stage.id],id=stage.id;
 scene.background=new THREE.Color(id==="ghost"?"#111d21":id==="shining"?"#351d19":id==="beetle"?"#1d1d20":id==="wayne"?"#231a2e":"#33231c");
 scene.fog=new THREE.Fog(scene.background,22,48);
 const floor=mesh(new THREE.PlaneGeometry(17,25),mat("#ffffff",.49,.03,{map:stageFloorTexture(id)}),0,-.014,-2);
 floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 const walls=id==="beetle"?mat("#8c8287",.82):id==="shining"?mat("#713c35",.74):id==="ghost"?mat("#d1b7a1",.94,0,{map:masonryTexture()}):id==="wayne"?M.wood:M.oak;
 box(.7,6.65,23,-7.85,3.32,-2.4,walls);box(.7,6.65,23,7.85,3.32,-2.4,walls);
 // Architectural exit opening at x≈6, 2m wide. Never fake a hinged door in front of solid masonry.
 box(13,6.66,.7,-1.5,3.32,-11.48,walls);
 box(1,6.66,.7,7.5,3.32,-11.48,walls);
 box(2,2.55,.7,6,5.38,-11.48,walls);
 const beyond=mesh(new THREE.PlaneGeometry(2.0,3.86),new THREE.MeshBasicMaterial({color:"#a89570",transparent:true,opacity:.24,side:THREE.DoubleSide}),6,1.96,-12.8);
 beyond.castShadow=false;
 box(.16,3.7,2.2,5.02,1.92,-12.45,M.woodDark);
 box(.16,3.7,2.2,6.99,1.92,-12.45,M.woodDark);
 box(1.95,.12,2.2,6,.06,-12.45,M.wood);
 
 box(16,.46,22,0,6.66,-2.4,id==="beetle"||id==="ghost"?M.iron:M.wood);
 // intricate trim is spatial, with cast shadows
 if(id!=="ghost")for(const y of [.13,1.21,1.42,5.42,6.17]){
  for(const x of [-7.43,7.43])box(.14,.13,23,x,y,-2.4,y===1.21?M.brass:M.oak);
  if(y>=4)box(15.2,.16,.18,0,y,-11.05,M.oak);
  else box(12.45,.16,.18,-1.25,y,-11.05,y===1.21?M.brass:M.oak);
 }
 if(id!=="ghost")for(const z of [-9.4,-6.1,-2.7,.6,4.1,7.6])for(const x of [-7.4,7.4]){
  box(.22,6.2,.24,x,3.1,z,M.woodDark);
  box(.31,.2,.31,x,1.42,z,M.brass);
 }
 if(id!=="ghost")for(const x of [-6.8,-2.6,2.6]){
  box(.2,5.6,.3,x,3.2,-11.0,M.woodDark);
  box(.35,.28,.38,x,5.85,-10.89,M.brass);
 }
 // vintage projector-inspired ceiling fixtures with physically colored light
 if(id!=="ghost")for(const x of [-5.5,0,5.5]){
  cyl(.03,.03,.9,x,6.08,-4.3,M.brass);
  cyl(.32,.55,.4,x,5.42,-4.3,M.woodDark,20);
  cyl(.35,.35,.04,x,5.18,-4.3,M.brass);
  const bulb=new THREE.PointLight(theme[0],id==="ghost"?15:9,10);bulb.position.set(x,5.25,-4.3);roomRoot.add(bulb);roomLights.push(bulb);
 }
 for(const x of [5.0,6.9])box(.15,4.04,.23,x,2.02,-10.23,M.brass);
 box(2.13,.19,.25,5.95,4.01,-10.23,M.brass);
 const hinge=new THREE.Group();hinge.position.set(5.04,.12,-10.1);roomRoot.add(hinge);
 box(1.82,3.61,.16,.91,1.83,0,M.wood,hinge);
 box(1.52,3.27,.10,.91,1.83,.13,M.woodDark,hinge);
 box(1.43,2.94,.08,.91,1.86,.20,M.wood,hinge);
 const exitName={ghost:"SERVICE",shining:"STAIRWELL",beetle:"DISCHARGE",wayne:"BACK STAIRS",stand:"OUT TO THE TRACKS"}[id];
 const plaqueTex=labelTexture(exitName,{background:"#302720",size:70});
 mesh(new THREE.PlaneGeometry(1.48,.38),new THREE.MeshBasicMaterial({map:plaqueTex}),.91,2.87,.26,hinge);
 const knob=cyl(.09,.09,.11,1.62,1.84,.26,M.brass,18,hinge);knob.rotation.x=Math.PI/2;
 const doorTouch=box(1.75,3.66,.32,.92,1.9,.08,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),hinge);
 doorTouch.castShadow=false;hinge.userData.action="next";clickables.push(hinge);
 exitHinge=hinge;
 exitThreshold=box(1.68,3.42,.28,5.94,1.85,-10.18,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
 exitThreshold.castShadow=false;exitThreshold.receiveShadow=false;exitThreshold.userData.action="next";
 exitLight=new THREE.PointLight("#ffe8a4",0,5);exitLight.position.set(5.93,2.05,-10.04);roomRoot.add(exitLight);

 const key=new THREE.SpotLight(theme[1],13,17,.9,.5,1.1);
 key.position.set(-1,6,-5);key.target.position.set(0,1.3,-6);key.castShadow=true;key.shadow.mapSize.set(512,512);roomRoot.add(key,key.target);vivid.push({kind:"light",light:key});
 const build={ghost:buildGhost,shining:buildShining,beetle:buildBeetle,wayne:buildWayne,stand:buildStand}[id];
 const decor=build();
 decor.userData.puzzleStage=stage.id;
}
function pedestal(x,z,width=1.55,material=M.wood){
 const g=new THREE.Group();g.position.set(x,0,z);roomRoot.add(g);
 box(width,.18,1.4,0,.88,0,material,g);box(width*.8,.8,1.09,0,.42,0,M.woodDark,g);
 for(const px of [-width*.43,width*.43])for(const pz of [-.46,.46])cyl(.035,.06,.72,px,.4,pz,M.brass,10,g);
 return g;
}
function buildGhost(){
 const group=new THREE.Group();roomRoot.add(group);
 const enamel=mat("#492523",.56,.4),conduit=mat("#716655",.59,.55);
 const hazard=mat("#c49b3e",.72,.15),rubber=mat("#1c201e",.88);
 const glass=mat("#23382d",.27,.18,{emissive:"#287f47",emissiveIntensity:.44});
 // An industrial containment vault, set into the brick service wall.
 for(const z of [-7.15,-2.3]){
  const fluorescent=mat("#a8b0a0",.37,.14,{emissive:"#c6e4d7",emissiveIntensity:1.4});
  box(4.22,.24,.48,-1.18,5.59,z,M.iron,group);
  for(const offset of [-.124,.124])box(3.96,.08,.079,-1.18,5.44,z+offset,fluorescent,group);
  for(const x of [-3.01,.69])box(.045,.81,.05,x,6.05,z,M.iron,group);
  const fixture=new THREE.PointLight("#cee6e0",16,9);fixture.position.set(-1.18,5.31,z);group.add(fixture);
 }
 for(const z of [-8.9,-4.4,1.2])box(14.94,.29,.22,0,6.24,z,M.iron,group);
 for(const x of [-7.28,7.28])for(const y of [1.17,4.67]){
  cyl(.089,.089,20.4,x,y,-1.05,conduit,14,group).rotation.x=Math.PI/2;
  for(const z of [-9,-6,-3,0,3,6])box(.16,.21,.23,x,y,z,M.iron,group);
 }
 const vault=new THREE.Group();vault.position.set(-2.8,0,-9.65);group.add(vault);
 box(5.2,4.86,.67,0,2.5,0,M.iron,vault);
 box(4.7,4.42,.25,0,2.48,.42,enamel,vault);
 box(4.24,3.6,.22,0,2.41,.6,M.iron,vault);
 box(2.6,2.16,.12,0,2.67,.78,rubber,vault);
 box(2.23,1.78,.12,0,2.67,.86,glass,vault);
 for(const x of [-1.58,1.58]){
  box(.17,3.92,.26,x,2.42,.8,conduit,vault);
  for(let row=0;row<7;row++)box(.32,.11,.08,x,.62+row*.57,.95,M.chrome,vault);
 }
 for(let i=0;i<12;i++){
  const stripe=box(.2,.19,.08,-1.75+i*.32,.76,.86,i%2?hazard:rubber,vault);
  stripe.rotation.z=.24;
 }
 for(let i=0;i<6;i++){
  const slat=box(1.94,.064,.07,0,2.02+i*.24,1.01,conduit,vault);
  slat.rotation.x=.28;
 }
 plaque("CONTAINMENT",0,4.45,.85,2.67,.4,{background:"#302821",size:94},vault);
 const leak=new THREE.PointLight("#4fe68a",9,8);leak.position.set(-2.9,2.9,-8.61);group.add(leak);
 for(const x of [-6.5,-5.99,1.4]){
  tube([[x,.22,-9.8],[x,2.1,-9.8],[x,4.8,-9.9],[x+.55,5.3,-9.9],[x+2.4,5.3,-9.9]].map(v=>new THREE.Vector3(...v)),.085,conduit);
 }
 // A bank of three relays mounted together inside a service cabinet.
 box(3.96,2.83,.53,2.45,1.82,-7.37,M.iron,group);
 box(3.7,2.53,.13,2.45,1.82,-7.05,rubber,group);
 plaque("RELAY BANK",2.45,2.87,-6.93,2.82,.31,{background:"#30382e",size:96});
 const controls=[["red",1.34,"#eb5340","HOT",3],["green",2.45,"#54da77","SAFE",4],["blue",3.56,"#5791e6","COLD",2]];
 for(const [action,x,color,name,step] of controls){
  const p=addProp(action,name+" relay",x,1.33,-6.77,1.03,1.26,.44);
  box(.87,1.08,.14,0,.3,0,conduit,p);
  const led=mat(color,.24,.15,{emissive:color,emissiveIntensity:.51});
  cyl(.14,.14,.11,0,.53,.12,led,20,p).rotation.x=Math.PI/2;
  ring(.155,.026,0,.53,.13,M.iron,p);
  const lever=cyl(.046,.06,.34,0,.13,.19,M.chrome,12,p);lever.rotation.x=.91;
  vivid.push({kind:"relay",material:led,mesh:lever,step});
  plaque(name,0,-.18,.11,.75,.25,{background:"#2e2b25",size:115},p);
 }
 // Trap and old meter share a scuffed repair bench in the foreground.
 box(4.74,.21,1.61,-1.55,1.07,-3.02,M.wood,group);
 for(const x of [-3.63,.51])box(.14,1.02,1.46,x,.53,-3.02,M.iron,group);
 box(4.22,.54,.07,-1.56,.72,-2.27,M.woodDark,group);
 const trap=addProp("trap","Ghost trap box",-1.72,1.19,-2.77,2.0,1.15,1.27);
 box(1.74,.37,.95,0,.22,0,M.iron,trap);
 box(1.39,.08,.79,0,.44,0,rubber,trap);
 for(let i=0;i<8;i++)box(.15,.05,.6,-.53+i*.15,.49,0,i%2?rubber:hazard,trap);
 for(const x of [-.83,.83])box(.12,.19,.91,x,.39,0,conduit,trap);
 box(.78,.10,.14,0,.58,.34,M.chrome,trap);
 const armed=mat("#64eb8c",.3,.1,{emissive:"#64eb8c",emissiveIntensity:.05});
 box(.13,.085,.018,.62,.32,.487,armed,trap);
 vivid.push({kind:"relay",material:armed,step:1});
 tube([[-.99,1.45,-2.78],[-.11,1.20,-2.59],[.75,.11,-2.6],[2.05,.1,-3.47],[2.45,.25,-6.76]].map(v=>new THREE.Vector3(...v)),.046,rubber);
 const fan=addProp("fan","Bench fan",-3.39,1.19,-3.03,1.1,1.51,.74);
 cyl(.35,.41,.11,0,.065,0,M.iron,18,fan);
 cyl(.035,.065,.52,0,.33,0,M.chrome,12,fan);
 ring(.44,.033,0,.87,.07,conduit,fan);
 ring(.34,.015,0,.87,.083,conduit,fan);
 const rotor=new THREE.Group();rotor.position.set(0,.87,.04);fan.add(rotor);
 for(let i=0;i<4;i++){
  const arm=new THREE.Group();arm.rotation.z=i*Math.PI/2;rotor.add(arm);
  box(.13,.27,.05,0,.15,0,M.iron,arm);
 }
 cyl(.1,.1,.15,0,.87,.11,M.iron,14,fan).rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){
  const spoke=new THREE.Group();spoke.position.set(0,.87,.09);spoke.rotation.z=i*Math.PI/4;fan.add(spoke);
  box(.014,.79,.012,0,0,0,conduit,spoke);
 }
 vivid.push({kind:"fan",mesh:rotor});
 return group;
}
function buildShining(){
 const group=new THREE.Group();roomRoot.add(group);
 // Repeated guest-room frames establish a hotel corridor and carry the clues.
 for(const side of [-1,1])for(const z of [-8.8,-4.5,.25,4.7]){
  box(.24,3.16,1.44,side*7.36,1.59,z,M.woodDark,group);
  box(.19,2.95,1.18,side*7.19,1.54,z,M.wood,group);
  box(.14,.08,.14,side*7.05,1.48,z+side*.38,M.brass,group);
  box(.13,.58,.27,side*7.24,3.62,z,M.brass,group);
  const lamp=mat("#ffe0a9",.7,0,{emissive:"#ffc769",emissiveIntensity:.54});
  box(.2,.34,.32,side*7.09,3.79,z,lamp,group);
 }
 for(const x of [-5.6,5.6])for(const z of [-3.4,-8.8]){
  box(.49,6.15,.53,x,3.07,z,M.woodDark,group);
  box(.63,.28,.66,x,5.92,z,M.brass,group);
  box(.65,.22,.67,x,.14,z,M.brass,group);
 }
 plaque("RED DIAMONDS · CREAM CIRCLES · GOLD BARS",0,4.86,-10.62,5.8,.47,{size:58,background:"#452623"});
 const defs=[
 {id:"diamonds",x:-3.85,n:2,color:"#c74b34",title:"RED DIAMONDS"},
 {id:"circles",x:0,n:3,color:"#e6d5ab",title:"CREAM CIRCLES"},
 {id:"bars",x:3.85,n:7,color:"#e4b459",title:"GOLD BARS"}
 ];
 for(const a of defs){
  const g=addProp(a.id,a.title,a.x,0,-5.5,2.8,2.65,1.1);
  box(2.55,2.47,.25,0,1.79,0,M.woodDark,g);
  box(2.3,2.15,.06,0,1.75,.15,M.wood,g);
  for(let i=0;i<a.n;i++){
   const col=(i%4),row=Math.floor(i/4),offset=a.n<=3?(i-(a.n-1)/2)*.66:(col-1.5)*.48;
   const x=offset,y=a.n<=3?1.7:1.85-row*.65;
   const colorMat=mat(a.color,.33,.08);
   if(a.id==="diamonds"){const cube=box(.4,.4,.09,x,y,.28,colorMat,g);cube.rotation.z=Math.PI/4;}
   if(a.id==="circles"){const disc=cyl(.21,.21,.09,x,y,.27,colorMat,24,g);disc.rotation.x=Math.PI/2;}
   if(a.id==="bars"){box(.27,.55,.1,x,y,.3,colorMat,g);}
  }
  const text=new THREE.MeshBasicMaterial({map:labelTexture(a.title,{size:69,background:"#39221e"})});
  mesh(new THREE.PlaneGeometry(2.36,.42),text,0,.57,.27,g);
 }
 const door=addProp("door","The mysterious hotel door",0,0,-9.9,2.72,4.2,.6);
 box(2.4,3.62,.24,0,2.14,0,M.woodDark,door);
 box(2.21,3.36,.16,0,2.13,.15,M.wood,door);
 for(const y of [1.29,2.33,3.24])box(1.77,.08,.1,0,y,.26,M.oak,door);
 cyl(.075,.075,.1,.74,1.93,.3,M.brass,16,door).rotation.x=Math.PI/2;
 const tag=labelTexture("ROOM ? ? ?",{size:86,background:"#512f21"});
 mesh(new THREE.PlaneGeometry(1.6,.5),new THREE.MeshBasicMaterial({map:tag}),0,3.49,.29,door);
 return group;
}
function buildBeetle(){
 const group=new THREE.Group();roomRoot.add(group);
 // The queue backs up at a crooked public-service counter.
 plaque("TAKE A NUMBER",0,4.57,-10.59,3.6,.64,{background:"#37263b",size:99});
 plaque("ANNOUNCEMENT → NUMBER → ODDITY",0,3.68,-10.56,5.8,.57,{background:"#29252a",size:60});
 for(const x of [-4.9,-2.5]){
  cyl(.06,.08,.93,x,.49,-2.3,M.brass,12,group);
  cyl(.21,.24,.09,x,.055,-2.3,M.iron,18,group);
 }
 tube([[-4.9,.86,-2.3],[-3.7,.61,-2.3],[-2.5,.86,-2.3]].map(v=>new THREE.Vector3(...v)),.045,M.velvet,group);
 for(let i=0;i<17;i++){
  const x=-7.5+i*.9;
  const stripe=box(.28,5.1,.045,x,2.9,-10.62,M.black);
  stripe.rotation.z=(i%2?.15:-.15);
 }
 const bench=box(3.8,.3,1.2,-4.7,.68,-8.3,M.purple);
 for(const x of [-6.3,-3.1])box(.2,1.04,1.25,x,.53,-8.3,M.woodDark);
 box(3.8,1.05,.23,-4.7,1.21,-8.84,M.purple);
 const bell=addProp("bell","Reception desk bell",-3.45,0,-5.2,2.1,1.7,1.6);
 box(1.7,1.0,1.1,0,.56,0,M.woodDark,bell);
 const dome=sphere(.42,0,1.25,.15,M.brass,bell);dome.scale.set(1,.48,1);
 cyl(.07,.07,.18,0,1.55,.15,M.chrome,15,bell);
 const ticket=addProp("ticket","Waiting number machine",0,0,-5.2,2.1,2.4,1.4);
 box(1.6,1.8,1.06,0,1.48,0,M.woodDark,ticket);
 box(1.35,.3,.12,0,1.9,.6,M.paper,ticket);
 for(let i=0;i<3;i++)box(.85,.13,.04,0,1.45-i*.22,.6,M.brass,ticket);
 const disp=labelTexture("TAKE A\nNUMBER",{background:"#342b37",size:95});
 mesh(new THREE.PlaneGeometry(1.4,.75),new THREE.MeshBasicMaterial({map:disp}),0,2.22,.62,ticket);
 const sculpture=addProp("sculpture","The twisted sculpture",3.45,0,-5.2,2.8,3.25,2.4);
 box(1.45,.25,1.45,0,.28,0,M.woodDark,sculpture);
 const shape=[];
 for(let i=0;i<33;i++){let t=i/32*3.9*Math.PI;shape.push(new THREE.Vector3(Math.sin(t)*(.31+i/96),.42+i/32*2.4,Math.cos(t)*(.27+i/120)));}
 const twisted=tube(shape,.12,M.purple,sculpture);vivid.push({kind:"sculpt",mesh:twisted});
 sphere(.31,.1,2.95,.1,M.green,sculpture).scale.set(1.5,.7,1);
 const door=addProp("door","The crooked green door",0,0,-9.55,2.7,4.0,.8);
 const glowMat=mat("#328744",.3,.22,{emissive:"#3ec74f",emissiveIntensity:.45});
 const d=box(2.35,3.62,.19,0,2.2,0,glowMat,door);d.rotation.z=.055;
 ring(.55,.07,0,2.3,.14,M.brass,door);
 plaque("RECORDS",0,3.4,.21,1.2,.42,{background:"#234d2b",size:95},door);
 return group;
}
function buildWayne(){
 const group=new THREE.Group();roomRoot.add(group);
 // Dim home-video basement, original instruments, handmade band notice.
 for(const z of [-9.6,-6.4,-3.2,0,3.2])box(14.8,.38,.27,0,5.98,z,M.woodDark,group);
 for(const y of [1.2,2.16,3.12]){
  box(2.45,.1,.5,3.55,y,-10.19,M.woodDark,group);
  for(let i=0;i<8;i++)box(.092,.28,.36,2.75+i*.19,y+.19,-10.19,i%3?M.black:M.grey,group);
 }
 for(let i=0;i<9;i++)box(15,.06,.08,0,1.3+i*.56,-10.6,i%2?M.oak:M.woodDark);
 const carpet=mesh(new THREE.PlaneGeometry(8,6.5),mat("#51395b",.95),0,.02,-4.3);carpet.rotation.x=-Math.PI/2;carpet.castShadow=false;
 const guitar=addProp("guitar","Electric guitar",-3.25,0,-5.25,2.2,3.3,1.5);
 const body=sphere(.48,0,1.4,.2,M.red,guitar);body.scale.set(1.2,.9,.45);
 const body2=sphere(.34,.18,1.61,.25,M.red,guitar);body2.scale.set(1,.7,.6);
 box(.17,2.05,.16,0,2.65,.25,M.oak,guitar);
 box(.28,.26,.19,0,3.77,.25,M.woodDark,guitar);
 for(let i=0;i<5;i++)box(.011,2.7,.018,-.08+i*.037,2.52,.345,M.chrome,guitar);
 const amp=addProp("amp","Amplifier and sound gear",0,0,-5.25,2.3,2.3,1.5);
 box(1.8,1.75,1.09,0,.99,0,M.black,amp);
 box(1.53,1.20,.08,0,.88,.59,M.woodDark,amp);
 for(let x of [-.37,.36]){const speaker=cyl(.39,.39,.09,x,.88,.65,M.grey,28,amp);speaker.rotation.x=Math.PI/2;}
 for(let x of [-.58,-.25,.08,.41]){const knob=cyl(.052,.052,.08,x,1.71,.62,M.brass,18,amp);knob.rotation.x=Math.PI/2;}
 const cameraObj=addProp("camera","Video camera",3.25,0,-5.25,2.5,3.0,2.2);
 for(const x of [-.6,.6]){const leg=box(.065,2.5,.07,x*.5,1.2,.1,M.chrome,cameraObj);leg.rotation.z=x*.29;}
 box(1.4,.88,1.05,0,2.5,0,M.black,cameraObj);
 const lens=cyl(.38,.38,.35,0,2.5,.73,M.chrome,24,cameraObj);lens.rotation.x=Math.PI/2;
 const glass=mesh(new THREE.CircleGeometry(.25,24),mat("#316481",.19,.12),0,2.5,.93,cameraObj);
 box(.22,.16,.13,.54,2.86,.36,M.red,cameraObj);
 const couch=new THREE.Group();couch.position.set(-4.25,0,-8.94);group.add(couch);
 box(3.7,.47,1.48,0,.52,0,M.velvet,couch);
 box(3.42,.92,.42,0,1.01,-.52,M.velvet,couch);
 for(const x of [-1.71,1.71])box(.42,.53,1.34,x,.81,0,M.velvet,couch);
 const poster=addProp("poster","Band poster",4.5,2.96,-10.55,2.5,1.25,.2);
 plaque("CRUCIAL TAUNT\nTONIGHT",0,.34,0,2.4,1.12,{background:"#4d265d",size:77},poster);
 return group;
}
function buildStand(){
 const group=new THREE.Group();roomRoot.add(group);
 // 1950s county fair booth, canvas awning, and the hand-made judging table.
 const canvasCloth=mat("#e8cda4",.96);
 for(const x of [-6.34,6.34]){
  box(.13,4.07,.13,x,2.05,-7.35,M.wood,group);
  box(.12,3.31,.12,x,1.68,-3.5,M.wood,group);
 }
 for(let i=0;i<13;i++){
  const awning=box(.99,.061,4.02,-5.97+i*.995,3.79,-5.42,i%2?canvasCloth:M.red,group);
  awning.rotation.x=.19;
 }
 const flags=[M.red,canvasCloth,M.blue,M.orange];
 for(let i=0;i<15;i++){
  const x=-6.2+i*.86;
  const flag=mesh(new THREE.ConeGeometry(.22,.42,3),flags[i%4],x,3.4+Math.abs(x)*.055,-3.65,group);
  flag.rotation.z=Math.PI;
 }

 for(let i=0;i<11;i++)box(15,.075,.10,0,.9+i*.44,-10.7,i%2?M.oak:M.woodDark);
 const cloth=new THREE.MeshStandardMaterial({map:stageFloorTexture("stand"),roughness:.93});
 box(11.4,.18,2.4,0,.95,-5.75,cloth);
 for(let i=0;i<6;i++)box(.14,1.0,1.1,-5.1+i*2.05,.52,-5.75,M.wood);
 const pies=[["cherry",-3.25,"#a73b3c"],["apple",0,"#d8a24f"],["blueberry",3.25,"#404f88"]];
 for(const [action,x,color]of pies){
  const p=addProp(action,action+" pie",x,.45,-5.55,2.2,1.6,2.1);
  cyl(.86,.82,.16,0,.61,0,M.chrome,35,p);
  cyl(.79,.77,.24,0,.75,0,mat(color,.68),40,p);
  ring(.77,.14,0,.86,0,M.oak,p).rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){const strip=box(.06,.03,1.4,(i-3)*.19,.92,0,M.paper,p);strip.rotation.y=i%2===0?.45:-.45;}
  const plaqueTex=labelTexture(action.toUpperCase(),{background:"#392623",size:111});
  const sign=mesh(new THREE.PlaneGeometry(1.35,.38),new THREE.MeshBasicMaterial({map:plaqueTex}),0,.23,1.04,p);
 }
 const trophy=addProp("trophy","The pie-contest trophy",0,0,-9.15,2.2,3.5,1.7);
 box(1.5,.25,1.27,0,.3,0,M.woodDark,trophy);
 cyl(.19,.31,1.12,0,1.05,0,M.brass,18,trophy);
 const cup=cyl(.55,.31,.74,0,1.83,0,M.brass,32,trophy);
 for(const x of [-.54,.54]){ring(.38,.065,x,1.92,0,M.brass,trophy).rotation.y=Math.PI/2;}
 sphere(.19,0,2.33,0,M.brass,trophy);
 const tag=labelTexture("THE PIE\nCONTEST",{background:"#463327",size:117});
 mesh(new THREE.PlaneGeometry(1.05,.45),new THREE.MeshBasicMaterial({map:tag}),0,.45,.7,trophy);
 plaque("COUNTY FAIR • 1959",0,4.55,-10.63,5.8,.82,{background:"#744438",size:86});
 plaque("JUDGES’ TABLE",0,3.48,-10.6,3.1,.49,{background:"#50362f",size:75});
 // Original distant rail line. 
 for(const z of [-9,-8,-7,-6,-5])box(2.6,.08,.14,5.9,.13,z,M.woodDark);
 for(const x of [5.15,6.65])box(.10,.07,5.2,x,.21,-7,M.chrome);
 return group;
}
function displayMessage(text){game.toast(text)}
function initialize(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance",alpha:false});
 }catch(e){game.revealFallback();return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.35:1.65));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.65;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color("#191b20");
 camera=new THREE.PerspectiveCamera(67,innerWidth/innerHeight,.1,65);
 camera.position.set(0,2.15,7.1);
 const hemi=new THREE.HemisphereLight("#dfebf3","#6f4b37",1.75);scene.add(hemi);
 const ambient=new THREE.AmbientLight("#ead3ba",.67);scene.add(ambient);
 const dir=new THREE.DirectionalLight("#ffe0b6",2.35);
 dir.position.set(-4,8,3);dir.castShadow=true;dir.shadow.mapSize.set(768,768);
 dir.shadow.camera.left=-12;dir.shadow.camera.right=12;dir.shadow.camera.top=12;dir.shadow.camera.bottom=-12;dir.shadow.normalBias=.05;scene.add(dir);
 const loader=new THREE.TextureLoader();
 loader.load("assets/pbr/wood-floor-diff.webp",t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.colorSpace=THREE.SRGBColorSpace;M.wood.map=t;M.wood.needsUpdate=true;},undefined,()=>{});
 game.attachRenderer(i=>{
  createRoom(game.stages[i]);
  yaw=yawAim=0;pitch=pitchAim=0;entryTime=performance.now();
  
 });
 function resize(){
  const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w<600?69:62;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 addEventListener("resize",resize);resize();
 const onPoint={down:false,moved:false,startX:0,startY:0,x:0,y:0};
 canvas.addEventListener("pointerdown",e=>{
  if(!e.isPrimary||e.button!==0)return;onPoint.down=true;onPoint.moved=false;onPoint.startX=onPoint.x=e.clientX;onPoint.startY=onPoint.y=e.clientY;
  try{canvas.setPointerCapture(e.pointerId)}catch(_){}
 });
 canvas.addEventListener("pointermove",e=>{
  if(!e.isPrimary||!onPoint.down)return;
  if(Math.abs(e.clientX-onPoint.startX)+Math.abs(e.clientY-onPoint.startY)>8)onPoint.moved=true;
  const dx=e.clientX-onPoint.x,dy=e.clientY-onPoint.y;
  onPoint.x=e.clientX;onPoint.y=e.clientY;
  yawAim=Math.max(-.76,Math.min(.76,yawAim-dx*.004));
  pitchAim=Math.max(-.33,Math.min(.36,pitchAim+dy*.003));
 });
 canvas.addEventListener("pointerup",e=>{
  if(!e.isPrimary||!onPoint.down)return;onPoint.down=false;if(onPoint.moved)return;
  const r=canvas.getBoundingClientRect();
  cursor.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  raycaster.setFromCamera(cursor,camera);
  const hits=raycaster.intersectObjects(game.solved?[...clickables,exitThreshold]:clickables,true);
  if(hits.length){let m=hits[0].object;
   while(m&&!m.userData.action)m=m.parent;
   if(m&&m.userData.action){if(m.userData.action==="next"){if(game.solved)game.next();else game.toast("Finish this movie puzzle before opening the next door.");}else game.interact(m.userData.action);}
  }else displayMessage("Drag to explore. Touch the props, or use Inspect objects.");
 });
 canvas.addEventListener("pointercancel",()=>onPoint.down=false);
 document.getElementById("left").addEventListener("click",()=>yawAim=Math.min(.76,yawAim+.17));
 document.getElementById("right").addEventListener("click",()=>yawAim=Math.max(-.76,yawAim-.17));
 addEventListener("keydown",e=>{
  if(e.target?.closest("button,input,textarea,a"))return;
  if(e.key==="ArrowLeft"){e.preventDefault();yawAim=Math.min(.76,yawAim+.14);}
  if(e.key==="ArrowRight"){e.preventDefault();yawAim=Math.max(-.76,yawAim-.14);}
 });
 loading.hidden=true;
 lastTime=performance.now();renderStarted=lastTime;requestAnimationFrame(render);
}
function render(now){
 requestAnimationFrame(render);
 const dt=Math.min(.05,(now-lastTime)/1000||.016);lastTime=now;
 if(document.hidden||!renderer)return;
 const pace=reduced.matches?1:Math.min(1,dt*8);
 if(exitHinge){
  exitHinge.rotation.y+=( (game.solved?-.95:0)-exitHinge.rotation.y)*Math.min(1,dt*3);
  if(exitLight)exitLight.intensity+=( (game.solved?7:0)-exitLight.intensity)*Math.min(1,dt*4);
 }
 yaw+=(yawAim-yaw)*pace;pitch+=(pitchAim-pitch)*pace;
 let ease=1;if(!reduced.matches)ease=Math.min(1,(now-entryTime)/1200);
 camera.position.set(0,2.25,(game.stage.id==="ghost"?4.85:7.1)+(1-ease)*1.4);
 camera.lookAt(Math.sin(yaw)*6,2.22+Math.sin(pitch)*4,-5.1);
 for(const a of vivid){
  if(a.kind==="relay"){
   const active=game.solved||game.step>=a.step;
   a.material.emissiveIntensity=active?1.65:.22;
   if(a.mesh)a.mesh.rotation.x=active?-.9:.91;
  }
 }
 if(!reduced.matches){
  for(const a of vivid){
   if(a.kind==="fan"&&game.fanRunning)a.mesh.rotation.z+=dt*19;
   if(a.kind==="sculpt")a.mesh.rotation.y=Math.sin(now*.0005)*.065;
   if(a.kind==="light")a.light.intensity=13+Math.sin(now*.0006)*.55;
  }
 }
 renderer.render(scene,camera);frame++;
 if(!qualityTuned && frame>8 && now-renderStarted>4000){
  qualityTuned=true;
  const fps=frame*1000/Math.max(1,now-renderStarted);
  if(fps<22){
   // Slow phones get lower GPU work without losing any puzzle or interaction.
   renderer.shadowMap.enabled=false;
   renderer.setPixelRatio(Math.min(1,devicePixelRatio||1));
   renderer.setSize(innerWidth,innerHeight,false);
  }
 }
}
window.__movieMaze3d={get meshes(){let n=0;roomRoot?.traverse(o=>{if(o.isMesh)n++});return n},get frame(){return frame},get activeRoom(){return game.stage.id},get clickable(){return clickables.length},get quality(){return renderer?.getPixelRatio()},get reduced(){return reduced.matches},get exitAngle(){return exitHinge?.rotation.y||0}};
initialize();

