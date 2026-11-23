import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js";
/* Five distinct ORIGINAL 3D environments. The titles name cinematic inspirations,
   not licensed film assets, logos, characters, dialogue, music or copied sets. */
const game=window.StudioMovieMaze;
if(!game)throw Error("Movie Maze game logic must load before its renderer.");
const canvas=document.getElementById("cinema3d"),loading=document.getElementById("loading");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
let renderer,scene,camera,roomRoot,roomLights=[],clocks=[],clickables=[],vivid=[],frame=0,lastTime=performance.now(),yaw=0,pitch=0,yawAim=0,pitchAim=0,entryTime=0,qualityTuned=false,exitHinge=null,exitLight=null,renderStarted=0;
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
function mesh(geo,material,x=0,y=0,z=0,parent=roomRoot){
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
function plaque(text,x,y,z,w=3,h=1,options={}){
 const g=new THREE.Group();g.position.set(x,y,z);roomRoot.add(g);
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
  for(let i=0;i<=20;i++){g.strokeStyle=i%5===0?"#c49e4e":"#607378";g.lineWidth=i%5===0?6:2;let k=i*51;g.beginPath();g.moveTo(k,0);g.lineTo(k,1024);g.moveTo(0,k);g.lineTo(1024,k);g.stroke();}
  for(let i=0;i<14;i++){g.fillStyle="#a38d4180";g.fillRect(0,i*78+14,14,33);}
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
const lights={ghost:["#8ebd9e","#54d77e"],shining:["#eeaa72","#d67d4b"],beetle:["#a7e09b","#78f983"],wayne:["#ceaee9","#a8b4ff"],stand:["#edd5a1","#edaa78"]};
function createRoom(stage){
 if(roomRoot){
  scene.remove(roomRoot);
  roomRoot.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material.map&&o.material.map.userData.disposeOnRoom)o.material.map.dispose();});
 }
 roomRoot=new THREE.Group();roomRoot.name="Studio Film: "+stage.film;scene.add(roomRoot);clickables=[];vivid=[];roomLights=[];
 const theme=lights[stage.id],id=stage.id;
 scene.background=new THREE.Color(id==="ghost"?"#111d21":id==="shining"?"#351d19":id==="beetle"?"#1d1d20":id==="wayne"?"#231a2e":"#33231c");
 scene.fog=new THREE.Fog(scene.background,22,48);
 const floor=mesh(new THREE.PlaneGeometry(17,25),mat("#ffffff",.49,.03,{map:stageFloorTexture(id)}),0,-.014,-2);
 floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 const walls=id==="beetle"?mat("#8c8287",.82):id==="shining"?mat("#713c35",.74):id==="ghost"?mat("#35444a",.42,.36):id==="wayne"?M.wood:M.oak;
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
 
 box(16,.46,22,0,6.66,-2.4,id==="beetle"?M.woodDark:M.wood);
 // intricate trim is spatial, with cast shadows
 for(const y of [.13,1.21,1.42,5.42,6.17]){
  for(const x of [-7.43,7.43])box(.14,.13,23,x,y,-2.4,y===1.21?M.brass:M.oak);
  box(15.2,.16,.18,0,y,-11.05,y===1.21?M.brass:M.oak);
 }
 for(const z of [-9.4,-6.1,-2.7,.6,4.1,7.6])for(const x of [-7.4,7.4]){
  box(.22,6.2,.24,x,3.1,z,M.woodDark);
  box(.31,.2,.31,x,1.42,z,M.brass);
 }
 for(const x of [-6.8,-2.6,2.6,6.8]){
  box(.2,5.6,.3,x,3.2,-11.0,M.woodDark);
  box(.35,.28,.38,x,5.85,-10.89,M.brass);
 }
 // vintage projector-inspired ceiling fixtures with physically colored light
 for(const x of [-5.5,0,5.5]){
  cyl(.03,.03,.9,x,6.08,-4.3,M.brass);
  cyl(.32,.55,.4,x,5.42,-4.3,M.woodDark,20);
  cyl(.35,.35,.04,x,5.18,-4.3,M.brass);
  const bulb=new THREE.PointLight(theme[0],8,8);bulb.position.set(x,5.25,-4.3);roomRoot.add(bulb);roomLights.push(bulb);
 }
 plaque(stage.film,0,5.35,-10.85,5.5,.83,{background:id==="beetle"?"#232328":"#321e21",size:86});
 plaque(stage.subtitle.toUpperCase(),0,4.39,-10.84,4.5,.52,{background:"#312526",size:62});
 plaque(stage.clue,0,2.61,-10.80,6.9,.65,{background:id==="shining"?"#5e2c22":"#28302d",size:53});
 // Every chapter has a physical side door, not merely a "next" menu button.
 // It only swings open after the actual puzzle is solved.
 const frame=box(2.11,3.92,.34,5.95,2.01,-10.47,M.woodDark);
 for(const x of [5.0,6.9])box(.15,4.04,.23,x,2.02,-10.23,M.brass);
 box(2.13,.19,.25,5.95,4.01,-10.23,M.brass);
 const hinge=new THREE.Group();hinge.position.set(5.04,.12,-10.1);roomRoot.add(hinge);
 box(1.82,3.61,.16,.91,1.83,0,M.wood,hinge);
 box(1.52,3.27,.10,.91,1.83,.13,M.woodDark,hinge);
 box(1.43,2.94,.08,.91,1.86,.20,M.wood,hinge);
 const plaqueTex=labelTexture("NEXT REEL",{background:"#3a2828",size:104});
 mesh(new THREE.PlaneGeometry(1.48,.48),new THREE.MeshBasicMaterial({map:plaqueTex,side:THREE.DoubleSide}),.91,2.83,.26,hinge);
 const knob=cyl(.09,.09,.11,1.62,1.84,.26,M.brass,18,hinge);knob.rotation.x=Math.PI/2;
 const doorTouch=box(1.75,3.66,.32,.92,1.9,.08,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),hinge);
 doorTouch.castShadow=false;hinge.userData.action="next";clickables.push(hinge);
 exitHinge=hinge;
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
 // Three independent containment relay consoles; real 3D toggles.
 const controls=[["red",-3.65,"#ed4745","HOT"],["green",.1,"#50ed82","SAFE"],["blue",3.65,"#548bf6","COLD"]];
 for(const [action,x,color,name]of controls){
  const p=addProp(action,name+" relay",x,0,-5.8,2.1,2.3,1.7);
  box(1.77,1.67,1.02,0,1.38,0,M.iron,p);box(1.51,.84,.15,0,1.59,.55,M.black,p);
  const led=mat(color,.2,.3,{emissive:color,emissiveIntensity:.55});
  const b=cyl(.38,.38,.22,0,1.58,.74,led,28,p);b.rotation.x=Math.PI/2;
  ring(.39,.035,0,1.58,.85,M.chrome,p).rotation.x=0;
  cyl(.055,.055,.6,-.36,.84,.67,M.brass,9,p).rotation.z=.22;
  const tag=labelTexture(name,{background:"#30303b",size:108});
  mesh(new THREE.PlaneGeometry(1.33,.37),new THREE.MeshBasicMaterial({map:tag}),0,2.23,.75,p);
  const glow=new THREE.PointLight(color,2.3,4);glow.position.set(0,1.7,.92);p.add(glow);vivid.push({kind:"pulse",light:glow,phase:x});
 }
 const trap=addProp("trap","Ghost trap box",0,0,-2.55,1.85,1.0,1.45);
 box(1.5,.35,.8,0,.31,0,M.iron,trap);for(const x of [-.44,.44]){
  box(.22,.16,.9,x,.55,0,M.brass,trap);}
 box(.95,.12,.25,0,.61,.2,M.chrome,trap);box(.85,.05,.75,0,.6,0,M.black,trap);
 plaque("COLD → HOT → SAFE",0,3.35,-10.7,4.2,.45,{background:"#182622",size:64});
 const coil=new THREE.Group();coil.position.set(6.1,1.5,-8.4);roomRoot.add(coil);
 for(let i=0;i<7;i++)ring(.62+i*.045,.026,0,(i-3)*.17,0,M.brass,coil).rotation.x=Math.PI/2;
 return group;
}
function buildShining(){
 const group=new THREE.Group();roomRoot.add(group);
 // The three-dimensional panels must depict actual countable clues, not fake decorative text.
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
 // Slanted black/cream architectural stripes and twisted furniture.
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
 plaque("NEXT?",0,3.4,.21,1.2,.42,{background:"#234d2b",size:114});
 return group;
}
function buildWayne(){
 const group=new THREE.Group();roomRoot.add(group);
 // Dim home-video basement, original instruments, handmade band notice.
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
 plaque("CRUCIAL TAUNT\nTONIGHT",4.5,3.3,-10.72,2.9,1.2,{background:"#4d265d",size:77});
 return group;
}
function buildStand(){
 const group=new THREE.Group();roomRoot.add(group);
 // Wood-paneled town hall with hand-made pie contest table and trophy.
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
 const cup=cyl(.55,.31,.74,0,1.83,0,M.gold,32,trophy);
 for(const x of [-.54,.54]){ring(.38,.065,x,1.92,0,M.brass,trophy).rotation.y=Math.PI/2;}
 sphere(.19,0,2.33,0,M.brass,trophy);
 const tag=labelTexture("THE PIE\nCONTEST",{background:"#463327",size:117});
 mesh(new THREE.PlaneGeometry(1.05,.45),new THREE.MeshBasicMaterial({map:tag}),0,.45,.7,trophy);
 // Original SE Alaska-like distant rail line: no licensed scene photography.
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
  game.toast(game.stages[i].film+" · "+game.stages[i].subtitle);
 });
 function resize(){
  const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w<600?69:62;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 addEventListener("resize",resize);resize();
 const onPoint={down:false,moved:false,startX:0,startY:0,x:0,y:0};
 canvas.addEventListener("pointerdown",e=>{
  if(e.button!==0)return;onPoint.down=true;onPoint.moved=false;onPoint.startX=onPoint.x=e.clientX;onPoint.startY=onPoint.y=e.clientY;
  try{canvas.setPointerCapture(e.pointerId)}catch(_){}
 });
 canvas.addEventListener("pointermove",e=>{
  if(!onPoint.down)return;
  if(Math.abs(e.clientX-onPoint.startX)+Math.abs(e.clientY-onPoint.startY)>8)onPoint.moved=true;
  const dx=e.clientX-onPoint.x,dy=e.clientY-onPoint.y;
  onPoint.x=e.clientX;onPoint.y=e.clientY;
  yawAim=Math.max(-.76,Math.min(.76,yawAim-dx*.004));
  pitchAim=Math.max(-.33,Math.min(.36,pitchAim+dy*.003));
 });
 canvas.addEventListener("pointerup",e=>{
  if(!onPoint.down)return;onPoint.down=false;if(onPoint.moved)return;
  const r=canvas.getBoundingClientRect();
  cursor.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  raycaster.setFromCamera(cursor,camera);
  const hits=raycaster.intersectObjects(clickables,true);
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
 camera.position.set(0,2.15,7.1+(1-ease)*2.5);
 camera.lookAt(Math.sin(yaw)*6,2.22+Math.sin(pitch)*4,-5.1);
 if(!reduced.matches){
  for(const a of vivid){
   if(a.kind==="pulse")a.light.intensity=2.3+Math.sin(now*.002+a.phase)*.24;
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
