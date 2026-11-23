import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js";

// Studio LaDuke Living House / first genuine modeled environment.
// All shapes are geometry in world space. No photographs pretending to be meshes.
// Open-source Three.js (MIT). No paid APIs, telemetry, or external accounts.
const $=id=>document.getElementById(id);
const canvas=$("world"),loading=$("loading"),still=$("still");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
let renderer,scene,camera,clock,room="atrium",rotY=0,rotX=0;
let targetRotY=0,targetRotX=0,discoveryTimer=0,ambientEnabled=false,audioCtx=null,weatherGain=null;
const props=[],trees=[],drops=[],animated=[],interactive=[],interactiveAreas=[];
const active=new Set();const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
const woodBase="#66412a",warmWhite="#f0dfbf",purple="#542773",orange="#ed602b";
function fallback(){loading.hidden=true;still.hidden=false;}
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"high-performance"});}catch(err){fallback();throw err;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.4:1.7));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.72;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene=new THREE.Scene();scene.background=new THREE.Color("#161c20");
scene.fog=new THREE.Fog("#222a2e",22,60);
camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,90);
const viewpoints={
 atrium:{pos:new THREE.Vector3(-.55,2.04,3.75),look:new THREE.Vector3(0,3.64,-4.2),title:"THE ATRIUM",quote:"An artist lives here. You can probably tell."},
 lounge:{pos:new THREE.Vector3(3.38,2.02,-2.25),look:new THREE.Vector3(3.45,.92,-5.2),title:"THE LIVING ROOM",quote:"Not everything in here is meant to make sense."}
};
const camAim=viewpoints.atrium.look.clone();
camera.position.copy(viewpoints.atrium.pos);camera.lookAt(camAim);
function material(color,roughness=.65,metalness=0,extra={}){return new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});}
const mats={
 walnut:material("#603923",.71),darkWood:material("#352519",.73),walnutLight:material("#9a6740",.66),
 brass:material("#d2a568",.26,.74),gold:material("#e2bd7e",.32,.6),chrome:material("#d8d8d0",.18,.9),
 cream:material("#eed9b6",.82),plaster:material("#a06f66",.82),aubergine:material("#40233f",.73),
 orange:new THREE.MeshPhysicalMaterial({color:"#e95a25",roughness:.3,metalness:.02,clearcoat:.44,clearcoatRoughness:.24}),
 purple:new THREE.MeshPhysicalMaterial({color:"#6d3a9d",roughness:.35,metalness:.04,clearcoat:.46}),
 teal:material("#166f79",.35,.17),black:material("#17191b",.44,.07),
 glass:new THREE.MeshPhysicalMaterial({color:"#7eb0b6",roughness:.07,metalness:.06,transparent:true,opacity:.52,side:THREE.DoubleSide,depthWrite:false}),
 translucent:new THREE.MeshBasicMaterial({color:"#93b9d3",transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false}),
 velvet:material("#493048",.94)
};
function mesh(geometry,mat,x=0,y=0,z=0,parent=scene){const a=new THREE.Mesh(geometry,mat);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;}
function box(w,h,d,x,y,z,mat,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
function cyl(rt,rb,h,x,y,z,mat,seg=24,parent=scene){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z,parent);}
function tube(points,r,mat,closed=false,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed,"centripetal"),Math.max(12,points.length*8),r,8,closed),mat,0,0,0,parent);}
function interactiveObject(obj,label,action){obj.userData.action=action;obj.userData.label=label;interactive.push(obj);return obj;}
function seeded(n){let z=Math.sin(n*221.19)*43758.5453;return z-Math.floor(z);}
function woodTexture(){
 const c=document.createElement("canvas");c.width=512;c.height=512;const g=c.getContext("2d");
 g.fillStyle="#a77348";g.fillRect(0,0,512,512);
 for(let i=0;i<180;i++){const y=i*3+seeded(i+2)*2;g.strokeStyle=i%7===0?"#41231959":"#e8bc8561";g.lineWidth=i%7===0?2:1;g.beginPath();for(let x=0;x<=512;x+=24){const shift=Math.sin(x*.035+i*.23)*3; x===0?g.moveTo(x,y+shift):g.lineTo(x,y+shift);}g.stroke();}
 for(let i=0;i<2200;i++){g.fillStyle=i%2?"#2f190d0d":"#fff2ca17";g.fillRect(seeded(i)*512,seeded(i+400)*512,1,seeded(i+81)*6+1);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.3,2.3);t.anisotropy=4;return t;
}
const grain=woodTexture();mats.walnut.map=grain;mats.walnut.needsUpdate=true;
const pbrLoader=new THREE.TextureLoader();
function loadWoodMap(filename,onReady,isColor=false){
 pbrLoader.load("assets/pbr/"+filename,tex=>{
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(2.2,2.2);
  tex.anisotropy=4;
  if(isColor)tex.colorSpace=THREE.SRGBColorSpace;
  onReady(tex);mats.walnut.needsUpdate=true;
 },undefined,()=>{/* keep procedural wood material if offline */});
}
loadWoodMap("wood-floor-diff.webp",tex=>{mats.walnut.map=tex;},true);
loadWoodMap("wood-floor-rough.webp",tex=>{mats.walnut.roughnessMap=tex;});
loadWoodMap("wood-floor-nor_gl.webp",tex=>{mats.walnut.normalMap=tex;mats.walnut.normalScale=new THREE.Vector2(.32,.32);});
function checkerTexture(){
 const c=document.createElement("canvas");c.width=1024;c.height=1024;const g=c.getContext("2d");
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  g.fillStyle=(x+y)%2===0?"#ded5c6":"#25262a";g.fillRect(x*128,y*128,128,128);
  g.strokeStyle=(x+y)%2?"#4f4b49":"#b6a99a";g.lineWidth=3;g.strokeRect(x*128+.5,y*128+.5,127,127);
  g.fillStyle="#ffffff09";for(let j=0;j<24;j++)g.fillRect(x*128+seeded(x*20+j+y*77)*127,y*128+seeded(x*9+j+y*93)*127,2,1);
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=8;return t;
}
const checker=checkerTexture();
const floor=mesh(new THREE.PlaneGeometry(22,26),new THREE.MeshStandardMaterial({map:checker,roughness:.29,metalness:.06}),0,-.015,-2);
floor.rotation.x=-Math.PI/2;floor.castShadow=false;
const ceiling=box(19,.45,24,0,7.1,-3.2,mats.walnut);ceiling.castShadow=false;
// walls are solid, with real physical window openings rather than 2D wallpapers
box(1.5,7.1,20,-9.4,3.55,-3.3,mats.walnut);box(1.5,7.1,20,9.4,3.55,-3.3,mats.walnut);
box(19,7.0,.5,0,3.55,9.0,mats.walnut); // behind camera for completeness
for(const [left,right]of [[-9.0,-6.15],[-3.55,3.55],[6.15,9.0]])box(right-left,7,.55,(left+right)/2,3.5,-11,mats.walnut);
for(const x of [-4.85,4.85]){
 box(2.7,1.45,.57,x,.73,-11,mats.walnut);
 box(2.7,1.3,.57,x,6.36,-11,mats.walnut);
 const glass=mesh(new THREE.PlaneGeometry(2.56,4.15),mats.glass,x,3.57,-10.8);
 box(.13,4.5,.17,x-1.35,3.5,-10.62,mats.walnutLight);
 box(.13,4.5,.17,x+1.35,3.5,-10.62,mats.walnutLight);
 box(2.83,.16,.2,x,5.82,-10.62,mats.brass);
 box(2.83,.16,.2,x,1.32,-10.62,mats.walnutLight);
 box(.06,4.4,.14,x,3.5,-10.56,mats.brass);
 box(2.65,.06,.12,x,3.55,-10.56,mats.brass);
 interactiveObject(glass,"Watch the Southeast Alaska rain","weather");
}
// horizontal moldings and architectural carved wood
for(const y of [.17,1.29,1.43,5.6,6.83]){
 for(const x of [-9.0,9.0])box(.22,.12,20,x,y,-3.3,y===1.29?mats.brass:mats.walnutLight);
 box(18,.12,.18,0,y,-10.65,y===1.29?mats.brass:mats.walnutLight);
}
for(const x of [-8.4,-5.2,-2.9,0,2.9,5.2,8.4]){
 const beam=box(.28,6.8,.28,x,3.5,-10.32,mats.walnutLight);
 box(.40,.19,.38,x,1.4,-10.31,mats.brass);
 box(.40,.19,.38,x,5.7,-10.31,mats.brass);
}
for(const x of [-8.6,8.6])for(const z of [-9,-5,-1,3]){box(.34,6.7,.35,x,3.5,z,mats.walnutLight);box(.44,.14,.44,x,1.42,z,mats.brass);}
function curveArch(x,z,scale=1){
 const a=new THREE.Group();scene.add(a);a.position.set(x,0,z);a.scale.setScalar(scale);
 for(const px of [-2.1,2.1]){
  box(.4,4.55,.5,px,2.275,0,mats.walnutLight,a);
  box(.56,.27,.63,px,.25,0,mats.brass,a);
  box(.56,.29,.63,px,4.49,0,mats.brass,a);
 }
 const path=[];for(let i=0;i<=18;i++){const t=i/18*Math.PI;path.push(new THREE.Vector3(-2.1*Math.cos(t),4.5+1.1*Math.sin(t),0));}
 tube(path,.24,mats.walnutLight,false,a);tube(path.map(p=>p.clone().add(new THREE.Vector3(0,-.15,.18))),.06,mats.brass,false,a);
 for(let i=0;i<6;i++){const angle=(i+.5)/6*Math.PI;const px=-2.1*Math.cos(angle),py=4.5+1.1*Math.sin(angle);
  box(.10,.27,.06,px,py,.25,mats.brass,a).rotation.z=angle;
 }
}
curveArch(0,-9.7,1.1);
// carved central ceiling beams and fan-shaped trim
for(const z of [-8.8,-5.1,-1.4,2.3,6.0])box(17,.34,.42,0,6.69,z,mats.walnutLight);
for(const x of [-7.65,7.65])box(.4,.32,18,x,6.68,-3.3,mats.walnutLight);
// 3D skylight is a horizontal cylinder with radial segments, not an image overlay
const skylight=new THREE.Group();scene.add(skylight);skylight.position.set(0,6.92,-3.45);
const starRing=mesh(new THREE.TorusGeometry(2.46,.21,12,80),mats.brass,0,0,0,skylight);starRing.rotation.x=Math.PI/2;
const outerRing=mesh(new THREE.TorusGeometry(2.72,.13,10,84),mats.walnutLight,0,0,0,skylight);outerRing.rotation.x=Math.PI/2;
const nightGlass=["#4c6da0","#ae65a5","#2ab9aa","#ec982e","#efa8b1"];
for(let i=0;i<5;i++){
 const a=i*Math.PI*2/5,b=(i+1)*Math.PI*2/5,shape=new THREE.Shape();shape.moveTo(0,0);
 for(let s=0;s<=18;s++){const ang=a+(b-a)*s/18;shape.lineTo(Math.cos(ang)*2.42,Math.sin(ang)*2.42);}shape.closePath();
 const p=mesh(new THREE.ShapeGeometry(shape),new THREE.MeshPhysicalMaterial({color:nightGlass[i],side:THREE.DoubleSide,transparent:true,opacity:.73,metalness:.06,roughness:.12,emissive:nightGlass[i],emissiveIntensity:.18}),0,-.02,0,skylight);
 p.rotation.x=-Math.PI/2; // plane is horizontally below torus
 const bar=mesh(new THREE.CylinderGeometry(.027,.027,2.42,8),mats.brass,Math.cos(a)*1.21,-.035,-Math.sin(a)*1.21,skylight);
 bar.rotation.z=Math.PI/2;bar.rotation.y=-a;
}
const medallion=mesh(new THREE.CylinderGeometry(.42,.42,.07,40),mats.brass,0,-.04,0,skylight);
interactiveObject(medallion,"Look up through the colored glass","glass");
const hole=mesh(new THREE.CircleGeometry(2.36,64),new THREE.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}),0,-.10,0,skylight);hole.rotation.x=-Math.PI/2;
// A real image of the five-note emblem would need tracing into approved glass shapes.
// The skylight's current radial glass is an architectural study, not a fake claim of fidelity.
// Balcony on the second floor: real raised 3D balusters
box(8,.35,1.4,-4.9,3.85,-7.75,mats.walnutLight);
for(let x=-8.2;x<-.9;x+=.45){cyl(.065,.065,1.1,x,4.55,-6.92,mats.brass,9);box(.11,.07,.11,x,5.12,-6.92,mats.walnutLight);}
box(7.9,.18,.18,-4.9,5.13,-6.92,mats.walnutLight);
// grand wood and brass staircase with no painted perspective cheats
const stairs=new THREE.Group();scene.add(stairs);
for(let i=0;i<13;i++){
 const z=-1.6-i*.49,y=.15+i*.255;
 box(2.35,.18,.51,6.45,y,z,mats.walnutLight,stairs);
 box(2.25,.045,.08,6.45,y+.11,z+.2,mats.brass,stairs);
 if(i%2===0){const post=cyl(.095,.1,1.1,5.3,y+.58,z,mats.walnutLight,8,stairs);post.castShadow=true;}
}
const handrail=[];for(let i=0;i<=13;i++)handrail.push(new THREE.Vector3(5.30,.98+i*.255,-1.6-i*.49));
tube(handrail,.095,mats.brass,false,stairs);
box(2.6,.28,7.15,6.4,3.68,-7.85,mats.walnutLight);
// 3d forest weather visible through window
const backSky=mesh(new THREE.PlaneGeometry(23,18),new THREE.MeshBasicMaterial({color:"#678a8f",side:THREE.DoubleSide}),0,5,-23);
function tree(x,z,s,seed){
 const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);g.scale.setScalar(s);
 const bark=material(seed%2?"#2e3026":"#3f3b2c",.95);
 cyl(.12,.20,5.8,0,2.1,0,bark,8,g);
 const needles=material(seed%3===0?"#163b34":seed%3===1?"#275044":"#1c4540",.91);
 for(let j=0;j<5;j++){const cone=mesh(new THREE.ConeGeometry(1.75-j*.16,3.2-j*.13,9),needles,0,2.6+j*.68,0,g);cone.rotation.y=seed*.2;}
 trees.push({group:g,phase:seed*.67,sway:.016+seeded(seed)*.013});
}
for(let i=0;i<16;i++)tree(-11+i*1.65,-15-(i%4)*1.7, .54+seeded(i)*.54,i);
const rainGeo=new THREE.BufferGeometry(),rainArray=new Float32Array(200*6);
const rainSpeed=new Float32Array(200);
for(let i=0;i<200;i++){rainSpeed[i]=4+seeded(i+33)*4;
 const x=-8+seeded(i+8)*16,y=seeded(i+91)*8,z=-11.5-seeded(i+12)*2;
 rainArray.set([x,y,z,x-.045,y-.19,z],i*6);}
rainGeo.setAttribute("position",new THREE.BufferAttribute(rainArray,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:"#c2e4e5",transparent:true,opacity:.39,depthWrite:false}));rain.castShadow=false;scene.add(rain);
// hanging light fittings, standing lamp and physical sculpted recording objects
function ceilingLamp(x,z){
 const chain=cyl(.025,.025,1.2,x,6.05,z,mats.brass);
 const shade=cyl(.44,.77,.38,x,5.28,z,mats.purple,20);
 const inner=cyl(.58,.58,.036,x,5.07,z,new THREE.MeshBasicMaterial({color:"#edc68e",transparent:true,opacity:.62}),24);
 const bulb=new THREE.PointLight("#ffcb85",8,5);bulb.position.set(x,5,z);scene.add(bulb);
 animated.push({light:bulb});
}
ceilingLamp(-4.35,-3.6);ceilingLamp(4.3,-3.5);
function makeLamp(x,z){
 const base=cyl(.31,.37,.09,x,.07,z,mats.brass);
 const stand=cyl(.043,.052,2.1,x,1.17,z,mats.brass,10);
 const shade=cyl(.29,.58,.59,x,2.47,z,mats.purple,20);
 const light=new THREE.PointLight("#ffa55c",8,5);light.position.set(x,2.3,z);scene.add(light);
 interactiveObject(shade,"Switch the purple floor lamp","lamp");
 animated.push({lamp:true,light,shade});return light;
}
makeLamp(6.65,-4.35);
// vivid but physically upholstered curved vinyl modular sofa
const sofa=new THREE.Group();scene.add(sofa);sofa.position.set(3.55,0,-5.85);
const segments=10,arcStart=Math.PI*1.04,arcEnd=Math.PI*1.96,R=2.34;
for(let i=0;i<segments;i++){
 const a=arcStart+(arcEnd-arcStart)*(i+.5)/segments;
 const x=Math.cos(a)*R,z=Math.sin(a)*R;
 const seg=new THREE.Group();sofa.add(seg);seg.position.set(x,0,z);seg.rotation.y=-a-Math.PI/2;
 // structural support shadow, chrome feet, upholstered seats and curved rolled backs
 box(.91,.38,.91,0,.39,0,mats.orange,seg);
 box(.94,.15,.96,0,.62,.015,mats.orange,seg);
 box(.89,.95,.26,0,1.04,-.43,mats.purple,seg);
 const roll=cyl(.18,.18,.9,0,1.51,-.46,mats.purple,18,seg);roll.rotation.z=Math.PI/2;
 const stitch=cyl(.011,.011,.42,-.24,1.13,-.573,mats.brass,7,seg);
 stitch.rotation.x=Math.PI/2;
 for(const dx of [-.27,.27]){cyl(.055,.055,.30,dx,.15,.28,mats.chrome,10,seg);}
 interactiveObject(seg.children[1],"Touch the curved vinyl couch","sofa");
}
const cushion=mesh(new THREE.SphereGeometry(.31,16,12),mats.teal,1.2,.82,-1.4,sofa);
cushion.scale.set(1.15,.36,1.15);
// orange-purple vinyl coffee table: true three-dimensional top, chrome pedestal and checker inlay
const table=new THREE.Group();scene.add(table);table.position.set(3.5,0,-5.02);
const foot=cyl(.65,.7,.10,0,.07,0,mats.brass,48,table);
const leg=cyl(.18,.28,.5,0,.38,0,mats.chrome,24,table);
const top=cyl(1.13,1.1,.15,0,.72,0,mats.walnutLight,56,table);top.scale.set(1.3,1,.88);
const tabletop=mesh(new THREE.CircleGeometry(1.06,56),new THREE.MeshStandardMaterial({map:checker,roughness:.24,metalness:.13}),0,.804,0,table);
tabletop.rotation.x=-Math.PI/2;tabletop.scale.set(1.26,.85,1);
const lip=mesh(new THREE.TorusGeometry(1.1,.047,9,50),mats.brass,0,.81,0,table);lip.rotation.x=Math.PI/2;lip.scale.set(1.3,.85,1);
interactiveObject(top,"Turn the vinyl-era coffee table","table");
const vase=cyl(.14,.22,.31,-.42,.98,-.3,mats.teal,13,table);vase.rotation.z=-.12;
const vaseTop=mesh(new THREE.TorusGeometry(.15,.025,8,18),mats.brass,-.44,1.13,-.3,table);vaseTop.rotation.x=Math.PI/2;
for(let i=0;i<4;i++){const rod=box(.016,.57,.016,-.42,1.35,-.3,mats.walnutLight,table);rod.rotation.z=(i-2)*.18;}
// Record cabinet and detailed vintage knobs against back left wall
const cabinet=new THREE.Group();cabinet.position.set(-3.5,0,-8.25);scene.add(cabinet);
box(2.4,1.22,.95,0,.73,0,mats.walnutLight,cabinet);
box(2.22,.98,.12,0,.76,.51,mats.darkWood,cabinet);
for(let x of [-.76,-.23,.28,.80]){
 const speaker=cyl(.19,.19,.04,x,.80,.62,mats.black,24,cabinet);speaker.rotation.x=Math.PI/2;
 cyl(.075,.075,.052,x,.8,.659,mats.brass,20,cabinet).rotation.x=Math.PI/2;
}
const platter=cyl(.45,.45,.12,-.42,1.43,-.05,mats.black,40,cabinet);
const vinyl=cyl(.32,.32,.017,-.42,1.5,-.05,mats.aubergine,48,cabinet);
const recordLabel=cyl(.078,.078,.024,-.42,1.52,-.05,mats.gold,32,cabinet);
interactiveObject(vinyl,"Play with the vintage turntable","record");
animated.push({record:vinyl});
// Real owner-created art in physically modeled frames, not floating interface cards.
const textureLoader=new THREE.TextureLoader();
function frameArtwork(url,x,y,z,angle,width,height,label){
 const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);g.rotation.y=angle;
 box(width+.25,height+.25,.15,0,0,0,mats.walnutLight,g);
 box(width+.085,height+.08,.015,0,0,.095,mats.brass,g);
 const backing=box(width,height,.025,0,0,.113,mats.black,g);
 textureLoader.load(url,tex=>{
  tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.81,metalness:0});
  const paper=mesh(new THREE.PlaneGeometry(width*.91,height*.91),mat,0,0,.132,g);
  paper.castShadow=false;
 },undefined,()=>{});
 box(width+.22,.045,.19,0,-(height+.2)/2,.06,mats.walnutLight,g);
 interactiveObject(backing,label,"art");return g;
}
frameArtwork("assets/corey-boat-sketch.jpeg",-8.48,2.78,-4.5,Math.PI/2,1.45,1.85,"A framed original boat sketch");
frameArtwork("assets/corey-carved-paddle.jpeg",8.48,2.65,-1.7,-Math.PI/2,1.4,2.05,"The carved paddle artwork");
frameArtwork("assets/corey-cedar-earrings.jpeg",-8.48,2.68,-.1,Math.PI/2,1.35,1.6,"Cedar earrings");

// Woven, hand-detailed textile under the curved modular vinyl sofa.
function textileTexture(){
 const cv=document.createElement("canvas");cv.width=cv.height=512;const g=cv.getContext("2d");
 g.fillStyle="#513253";g.fillRect(0,0,512,512);
 for(let i=0;i<13000;i++){
  const x=seeded(i+555)*512,y=seeded(i+8355)*512;
  g.fillStyle=i%4===0?"#d28d592b":i%3===0?"#f2bee724":"#120b170e";
  g.fillRect(x,y,1+seeded(i+91)*2,1);
 }
 g.strokeStyle="#d87637";g.lineWidth=17;g.strokeRect(19,19,474,474);
 g.strokeStyle="#e8b86e";g.lineWidth=5;g.strokeRect(46,46,420,420);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
const rug=mesh(new THREE.CircleGeometry(3.25,56),new THREE.MeshStandardMaterial({map:textileTexture(),roughness:.98,metalness:0}),3.55,.027,-5.8);
rug.rotation.x=-Math.PI/2;rug.scale.set(1.3,.86,1);rug.castShadow=false;

// sculptural framed original-inspired abstract artwork; not attributed to the owner
const art=new THREE.Group();scene.add(art);art.position.set(-1.45,3.0,-10.47);
box(1.95,2.35,.18,0,0,0,mats.walnutLight,art);
box(1.70,2.1,.05,0,0,.14,mats.black,art);
for(let i=0;i<5;i++){
 const shape=mesh(new THREE.TorusGeometry(.25+i*.08,.06,7,35,Math.PI*(1.3+i*.13)),
  i%2?mats.gold:mats.teal,-.28+i*.12,.52-i*.23,.19,art);
 shape.rotation.z=i*.6;
}
interactiveObject(art.children[1],"Study the strange little painting","art");
// real lamps, layered light and quality defaults
scene.add(new THREE.AmbientLight("#ecc9ab",.92));
const hemi=new THREE.HemisphereLight("#c9e1e9","#654b42",1.87);scene.add(hemi);
const daylight=new THREE.DirectionalLight("#ffe5b5",3.0);daylight.position.set(-5,12,-8);daylight.castShadow=true;
daylight.shadow.mapSize.set(1024,1024);daylight.shadow.camera.left=-13;daylight.shadow.camera.right=13;daylight.shadow.camera.top=13;daylight.shadow.camera.bottom=-13;
daylight.shadow.normalBias=.045;scene.add(daylight);
const glassGlow=new THREE.SpotLight("#ca94fa",15,18,.61,.65,1.0);
glassGlow.position.set(0,6.7,-3.45);glassGlow.target.position.set(0,0,-3.45);scene.add(glassGlow,glassGlow.target);
const localHour=new Date().getHours();if(localHour<6||localHour>=20){hemi.intensity=.9;daylight.intensity=.42;glassGlow.color.set("#a994ed");glassGlow.intensity=7.5;}
else if(localHour>=17){hemi.intensity=1.2;daylight.intensity=1.2;glassGlow.color.set("#f39ab5");glassGlow.intensity=11;}
else if(localHour<11){glassGlow.color.set("#ffe09b");glassGlow.intensity=14;}
function emit(text){const el=$("discovery");el.textContent=text;el.classList.add("show");clearTimeout(discoveryTimer);discoveryTimer=setTimeout(()=>el.classList.remove("show"),4100);}
function recordDiscovery(id){try{const k="studioladuke.house.discovery.v1",arr=JSON.parse(localStorage.getItem(k)||"[]");if(Array.isArray(arr)&&!arr.includes(id)){arr.push(id);localStorage.setItem(k,JSON.stringify(arr));}}catch(_){}}
function interact(action){
 if(action==="glass"){emit("Five pieces of colored light. The real five-note glass design is still being made.");glassGlow.intensity=glassGlow.intensity>18?12:23;}
 else if(action==="lamp"){const a=animated.find(o=>o.lamp);a.light.visible=!a.light.visible;emit(a.light.visible?"The purple lamp warms the vinyl.":"The corner settles into evening.");}
 else if(action==="record"){emit("A record starts turning. The music will be original.");recordDiscovery("living:sofa");}
 else if(action==="sofa"){emit("Orange and purple vinyl, built for long stories and loud records.");recordDiscovery("living:sofa");}
 else if(action==="table"){table.rotation.y+=.18;emit("A strange little coffee table. The whole room revolves around it.");}
 else if(action==="art"){emit("Every curious object has a story. Some aren't written yet.");}
 else if(action==="weather"){emit("Outside: rain and cedar trees. Welcome to Southeast Alaska.");}
}
const touch={down:false,x:0,y:0,startX:0,startY:0,dragged:false};
canvas.addEventListener("pointerdown",e=>{if(e.button!==0)return;touch.down=true;touch.x=touch.startX=e.clientX;touch.y=touch.startY=e.clientY;touch.dragged=false;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
canvas.addEventListener("pointermove",e=>{if(!touch.down)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.abs(e.clientX-touch.startX)+Math.abs(e.clientY-touch.startY)>9)touch.dragged=true;
 touch.x=e.clientX;touch.y=e.clientY;targetRotY=Math.max(-.78,Math.min(.78,targetRotY-dx*.0038));targetRotX=Math.max(-.28,Math.min(.35,targetRotX+dy*.0025));});
canvas.addEventListener("pointerup",e=>{if(!touch.down)return;touch.down=false;if(touch.dragged)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(interactive,true);
 if(hits.length){let hit=hits[0].object;while(hit&&!hit.userData.action)hit=hit.parent;if(hit)interact(hit.userData.action);}else emit("Drag to see around the corners. Touch a lamp, the glass, the sofa, or a record.");
});
canvas.addEventListener("pointercancel",()=>{touch.down=false});
const btns={atrium:$("atrium"),lounge:$("lounge")};
function enter(where){if(!viewpoints[where])return;room=where;targetRotX=0;targetRotY=0;for(const [k,b]of Object.entries(btns))b.setAttribute("aria-pressed",String(k===where));
 $("where-label").textContent=viewpoints[where].title;$("scene-quote").textContent=viewpoints[where].quote;}
for(const [k,b]of Object.entries(btns))b.addEventListener("click",()=>enter(k));
$("look-left").addEventListener("click",()=>targetRotY=Math.max(-.78,targetRotY-.18));
$("look-right").addEventListener("click",()=>targetRotY=Math.min(.78,targetRotY+.18));
window.addEventListener("keydown",e=>{if(e.target?.closest("button,a,input,textarea"))return;
 if(e.key==="ArrowLeft"){e.preventDefault();targetRotY=Math.max(-.78,targetRotY-.12);}
 if(e.key==="ArrowRight"){e.preventDefault();targetRotY=Math.min(.78,targetRotY+.12);}
 if(e.key==="1")enter("atrium");if(e.key==="2")enter("lounge");
});
let noiseSource=null;
async function setSound(){
 if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();
 const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
 const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.48;
 const noise=audioCtx.createBufferSource();noise.buffer=buffer;noise.loop=true;
 const lowpass=audioCtx.createBiquadFilter();lowpass.type="lowpass";lowpass.frequency.value=380;
 weatherGain=audioCtx.createGain();weatherGain.gain.value=0;
 noise.connect(lowpass).connect(weatherGain).connect(audioCtx.destination);noise.start();noiseSource=noise;
 }
 ambientEnabled=!ambientEnabled;await audioCtx.resume();
 weatherGain.gain.setTargetAtTime(ambientEnabled?.035:0,audioCtx.currentTime,.2);
 $("sound").setAttribute("aria-pressed",String(ambientEnabled));$("soundLabel").textContent=ambientEnabled?"Sound on":"Sound off";
 if(ambientEnabled){for(const [f,a,d]of [[220,.055,3.2],[330,.027,2.5],[440,.011,1.9]]){
 const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type="sine";osc.frequency.value=f;
 gain.gain.setValueAtTime(0,audioCtx.currentTime);gain.gain.linearRampToValueAtTime(a,audioCtx.currentTime+.09);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+d);
 osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+d+.03);
 }}
}
$("sound").addEventListener("click",()=>{setSound().catch(()=>emit("Audio is not available on this device."));});
for(const b of document.querySelectorAll("#accessible-objects button[data-object]"))b.addEventListener("click",()=>interact(b.dataset.object));
// Render only while tab visible; bound GPU workload for phones.
const clockStart=performance.now();let prev=clockStart,frames=0,qualityTuned=false;
function tuneMobileQuality(now){
 if(qualityTuned||now-clockStart<4200||frames<8)return;
 qualityTuned=true;
 const observedFPS=frames*1000/Math.max(1,now-clockStart);
 if(observedFPS<24){
  // Only lower the visual workload if this very device is struggling.
  renderer.shadowMap.enabled=false;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1));
  renderer.setSize(innerWidth,innerHeight,false);
 }
}
function render(t){
 requestAnimationFrame(render);
 const dt=Math.min(.045,(t-prev)/1000||.016);prev=t;
 if(document.hidden)return;
 const v=viewpoints[room];const pace=reduced.matches?1:Math.min(1,dt*3.0);
 camera.position.lerp(v.pos,pace);camAim.lerp(v.look,pace);
 rotY+= (targetRotY-rotY)*(reduced.matches?1:Math.min(1,dt*8));
 rotX+= (targetRotX-rotX)*(reduced.matches?1:Math.min(1,dt*8));
 const focus=camAim.clone().add(new THREE.Vector3(Math.sin(rotY)*5,Math.sin(rotX)*4,0));
 camera.lookAt(focus);
 if(!reduced.matches){
  const time=t*.001;
  for(const o of trees)o.group.rotation.z=Math.sin(time*.38+o.phase)*o.sway;
  const arr=rainGeo.attributes.position.array;
  for(let i=0;i<rainSpeed.length;i++){let y=arr[i*6+1]-rainSpeed[i]*dt;
   if(y<-.2)y=7.9;arr[i*6+1]=y;arr[i*6+4]=y-.19;}
  rainGeo.attributes.position.needsUpdate=true;
  vinyl.rotation.y+=dt*.24;
 }
 renderer.render(scene,camera);frames++;tuneMobileQuality(t);
}
function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w<700?66:62;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
addEventListener("resize",resize);resize();loading.hidden=true;
requestAnimationFrame(render);
window.__studio3d={get room(){return room},get frames(){return frames},get meshes(){let n=0;scene.traverse(o=>{if(o.isMesh)n++});return n},get interactive(){return interactive.length},get pixelRatio(){return renderer.getPixelRatio()},get reduced(){return reduced.matches},enter};
