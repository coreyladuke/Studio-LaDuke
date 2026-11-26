import './house-spatial.js';

const {stairs,travel}=globalThis.StudioHouseSpatial;
export const defaultFlight=Object.freeze({
 width:stairs.width,run:stairs.to[2],rise:stairs.to[1],landing:1.60
});
const eye=travel.eye;
export function floorHeight(z,flight=defaultFlight){
 return Math.max(0,Math.min(1,z/flight.run))*flight.rise;
}
export const stoopStart={x:-5.08,y:eye,z:-.715,yaw:Math.PI/2,pitch:0};
export const start={x:-2.98,y:1.58,z:-.74,yaw:1.58,pitch:0};
const radius=.16,wall=-1.4,portal=-.8,half=.51;
const entry={wall:-4.1,hingeX:-4.03,hingeZ:-1.19,width:.95,angle:1.63,center:-.715};
const doorPose=fraction=>{
 const angle=-entry.angle*fraction;
 return {angle,x:-Math.sin(angle),z:Math.cos(angle)};
};
export const entryOccupied=x=>Math.abs(x-entry.wall)<radius+.07;
export const objects=[
 {id:'entry-door',name:'Front door',kind:'door',x:-3.99,y:1.12,z:-.7,radius:.53},
 {id:'console-switch',name:'Console lamp',kind:'light',x:-2.35,y:1.19,z:.93,radius:.19},
 {id:'console-drawer',name:'Cedar drawer',kind:'drawer',x:-2.86,y:.68,z:.85,radius:.29},
 {id:'salmon-picture',name:'King salmon painting',kind:'art',x:-2.87,y:1.68,z:1.52,radius:.35,src:'assets/front-art/salmon.webp'},
 {id:'house-book',name:'House notebook',kind:'book',x:-2.72,y:.93,z:1.02,radius:.15},
 {id:'record-player',name:'Record player',kind:'music',x:-3.34,y:.97,z:1.04,radius:.21},
 {id:'drawer-discovery',name:'Folded note',kind:'discovery',x:-2.85,y:.74,z:.62,radius:.13,requires:'console-drawer'},
 {id:'rain-window',name:'Rain window',kind:'window',x:-3.65,y:1.64,z:1.53,radius:.33},
 {id:'stair-threshold',name:'Main Stairs',kind:'stairs',x:0,y:1.04,z:.12,radius:.37}
];
export function hallLocation(x,z=-1,flight=defaultFlight){
 if(z>=flight.run&&Math.abs(x)<1.4)return 'Upstairs Landing';
 if(z>0&&Math.abs(x)<flight.width/2)return 'Main Stairs';
 return x>wall?'Main Hall':x<entry.wall?'Front Stoop':'Front Hall';
}
export function allowed(x,z,door=0,flight=defaultFlight){
 const foyer=x>=-4.1+radius&&x<=wall-radius&&z>=-1.6+radius&&z<=1.6-radius;
 const hall=x>=wall+radius&&x<=1.4-radius&&z>=-1.6+radius&&z<=-radius;
 const doorway=Math.abs(x-wall)<=radius+.0001&&Math.abs(z-portal)<=half-radius;
 const stairway=Math.abs(x)<=flight.width/2-radius&&z>=-radius&&z<=flight.run+radius;
 const landing=Math.abs(x)<=1.4-radius&&z>=flight.run+radius&&z<=flight.run+flight.landing-radius;
 const stoop=x>=-5.55+radius&&x<=entry.wall-radius&&z>=-1.65+radius&&z<=.25-radius;
 const entryway=door>.70&&Math.abs(x-entry.wall)<=radius+.0001&&Math.abs(z-entry.center)<=entry.width/2-radius;
 const furniture=x>-3.66-radius&&x<-2.13+radius&&z>.79-radius;
 if(!(foyer||hall||doorway||stoop||entryway||stairway||landing)||furniture)return false;
 const leaf=doorPose(door);
 const dx=x-entry.hingeX,dz=z-entry.hingeZ;
 const along=Math.max(0,Math.min(entry.width,dx*leaf.x+dz*leaf.z));
 return Math.hypot(dx-along*leaf.x,dz-along*leaf.z)>=radius+.025;
}
export function moveCamera(camera,dx,dz,door=0,flight=defaultFlight){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));
 let {x,z}=camera;
 for(let i=0;i<steps;i++){
  if(allowed(x+dx/steps,z,door,flight))x+=dx/steps;
  if(allowed(x,z+dz/steps,door,flight))z+=dz/steps;
 }
 return {...camera,x,z,y:eye+(x>wall?floorHeight(z,flight):0)};
}
export function objectPose(object,door,drawer=0){
 if(object.id==='console-drawer'||object.id==='drawer-discovery')return {...object,z:object.z-drawer*.31};
 if(object.id!=='entry-door')return object;
 const leaf=doorPose(door);
 return {...object,x:entry.hingeX+.82*leaf.x,z:entry.hingeZ+.82*leaf.z,y:1.04,radius:.125};
}
export function visible(camera,object,door=0){
 const distance=Math.hypot(object.x-camera.x,object.y-camera.y,object.z-camera.z);
 if(distance>2.75)return false;
 if((camera.x<entry.wall)!==(object.x<entry.wall)&&object.id!=='entry-door'){
  const t=(entry.wall-camera.x)/(object.x-camera.x);
  if(door<.72||Math.abs(camera.z+(object.z-camera.z)*t-entry.center)>entry.width/2)return false;
 }
 if((camera.x<wall)!==(object.x<wall)){
  const t=(wall-camera.x)/(object.x-camera.x);
  return Math.abs(camera.z+(object.z-camera.z)*t-portal)<half;
 }
 return true;
}
export function objectAction(state,object){
 if(object.requires&&!state[object.requires])return {type:'none'};
 if(['door','light','drawer','music','window'].includes(object.kind)){
  state[object.id]=!state[object.id];
  return {type:object.kind,on:state[object.id]};
 }
 if(object.kind==='discovery')state[object.id]=true;
 return {type:object.kind};
}
const rgba={
 wall:[.48,.29,.16,1], floor:[.50,.33,.20,2], wood:[.31,.17,.095,1],
 trim:[.24,.13,.08,1], ceiling:[.30,.21,.14,1], glass:[.20,.34,.35,3],
 frame:[.44,.29,.12,1], canvas:[.56,.38,.22,8], black:[.13,.13,.10,0],
 cream:[.72,.61,.41,0], brass:[.63,.44,.19,0], green:[.20,.29,.20,0],
 rug:[.28,.25,.18,4], light:[.88,.64,.33,5], trees:[.09,.20,.17,6], woods:[.08,.14,.10,7]
};
function mesh(state,placements,flight){
 let placement;
 function place(id,draw){
  const object=objects.find(item=>item.id===id),next=placements[id];
  if(next){
   const radians=(next.rotation??0)*Math.PI/180;
   placement={object,next,cos:Math.cos(radians),sin:Math.sin(radians),scale:next.scale??1};
  }
  draw();
  placement=undefined;
 }
 const v=[];
 function box(x,y,z,w,h,d,key,angle=0,pivot=x,slope=0){
  const color=rgba[key];
  const corners=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
  if(angle)for(const p of corners){const a=p[0]-pivot,b=p[2]-z;p[0]=pivot+a*Math.cos(angle)-b*Math.sin(angle);p[2]=z+a*Math.sin(angle)+b*Math.cos(angle);}
  if(slope)for(const point of corners)point[1]+=slope*(point[2]-z);
  const texCoords=corners.map(p=>[(p[0]-x)/w,1-(p[1]-y)/h]);
  if(placement){
   const {object,next,cos,sin,scale}=placement;
   for(const p of corners){
    const px=(p[0]-object.x)*scale,pz=(p[2]-object.z)*scale;
    p[0]=next.x+px*cos-pz*sin;
    p[1]=next.y+(p[1]-object.y)*scale;
    p[2]=next.z+px*sin+pz*cos;
   }
  }
  for(const [indices,shade] of [[[0,3,2,1],.84],[[4,5,6,7],.92],[[0,4,7,3],.70],[[1,2,6,5],.78],[[3,7,6,2],1],[[0,1,5,4],.57]]){
   for(const i of [0,1,2,0,2,3])v.push(...corners[indices[i]],...color,shade,...texCoords[indices[i]]);
  }
 }
 box(-4.1,-.08,-1.6,5.5,.08,1.6,'floor');
 box(-4.1,-.08,0,2.7,.08,1.6,'floor');
 box(-4.1,2.55,-1.6,5.5,.07,1.6,'ceiling');
 box(-4.1,2.55,0,2.7,.07,1.6,'ceiling');
 box(-4.1,0,-1.64,5.5,2.55,.04,'wall');
 box(-4.14,0,-1.6,.04,2.55,.39,'wall');
 box(-4.14,0,-.22,.04,2.55,1.82,'wall');
 box(-4.14,2.13,-1.21,.04,.42,.99,'wall');
 box(-5.55,-.09,-1.65,1.45,.09,1.90,'floor');
 box(-8.42,-2.8,-8.0,.02,9.5,14.4,'woods');
 for(const z of [-1.62,.20]){
  for(const x of [-5.47,-4.22])box(x,0,z,.078,.88,.078,'wood');
  box(-5.47,.64,z,1.33,.085,.078,'trim');
 }
 box(-5.55,0,-1.65,.07,.10,.27,'trim');
 box(-5.55,0,-.04,.07,.10,.29,'trim');
 box(-4.1,0,1.60,2.70,2.55,.04,'wall');
 box(1.40,0,-1.60,.04,2.55,1.60,'wall');
 box(-1.42,0,-1.6,.04,2.55,.29,'wall');
 box(-1.42,0,-.29,.04,2.55,1.89,'wall');
 box(-1.42,2.12,-1.31,.04,.43,1.02,'wall');
 box(-1.49,0,-1.34,.18,2.14,.085,'trim');
 box(-1.49,0,-.35,.18,2.14,.085,'trim');
 box(-1.49,2.07,-1.34,.18,.12,1.08,'trim');
 const halfFlight=flight.width/2, stepDepth=flight.run/stairs.treads, stepRise=flight.rise/stairs.risers;
 const head=flight.rise+2.43;
 box(-1.4,0,0,1.4-halfFlight,2.55,.05,'wall');
 box(halfFlight,0,0,1.4-halfFlight,2.55,.05,'wall');
 box(-halfFlight,2.55,0,flight.width,head-2.55,.05,'wall');
 for(let i=0;i<stairs.treads;i++){
  const z=i*stepDepth,y=(i+1)*stepRise;
  box(-halfFlight,0,z,flight.width,y,stepDepth,'wood');
  box(-halfFlight,y-.035,z-.025,flight.width,.035,.082,'trim');
 }
 for(const side of [-1,1]){
  const x=side*(halfFlight+.018);
  box(x-.035,0,0,.07,head,flight.run,'wall');
  const railX=side*(halfFlight-.062);
  box(railX-.033,stairs.railHeight,0,.066,.072,flight.run,'trim',0,railX,flight.rise/flight.run);
  for(const t of [0,.33,.66]){
   const z=t*flight.run,y=floorHeight(z,flight);
   box(railX-.025,y,z,.05,stairs.railHeight,.05,'trim');
  }
  box(x-.052,flight.rise,flight.run-.055,.104,1.02,.11,'trim');
 }
 box(-halfFlight-.07,head,0,flight.width+.14,.08,flight.run,'ceiling');
 box(-halfFlight,flight.rise-stepRise,flight.run-.018,flight.width,stepRise+.002,.07,'wood');
 box(-1.4,flight.rise-.10,flight.run,2.8,.10,flight.landing,'floor');
 const back=flight.run+flight.landing;
 box(-1.4,flight.rise,back,.92,2.43,.06,'wall');
 box(.48,flight.rise,back,.92,2.43,.06,'wall');
 box(-.48,flight.rise,back,.96,.93,.06,'wall');
 box(-.48,flight.rise+1.92,back,.96,.51,.06,'wall');
 box(-.48,flight.rise+.93,back+.045,.96,.99,.03,'glass');
 for(const x of [-.52,-.025,.47])box(x,flight.rise+.91,back-.02,.052,1.03,.06,'trim');
 for(const y of [.91,1.42,1.90])box(-.52,flight.rise+y,back-.02,1.04,.044,.06,'trim');
 box(-1.46,flight.rise,flight.run,.06,2.43,flight.landing,'wall');
 box(1.4,flight.rise,flight.run,.06,2.43,flight.landing,'wall');
 box(-1.4,head,flight.run,2.8,.07,flight.landing,'ceiling');
 for(const [x,w] of [[-1.4,1.4-halfFlight],[halfFlight,1.4-halfFlight]]){
  box(x,flight.rise,flight.run-.09,w,1,.09,'trim');
 }
 box(-4.09,.03,-1.26,.075,2.13,.075,'trim');
 box(-4.09,.03,-.24,.075,2.13,.075,'trim');
 box(-4.09,2.04,-1.26,.075,.12,1.095,'trim');
 // A hinged leaf with its pivot anchored to the jamb.
 const doorFraction=state['entry-door']||0;
 const {angle}=doorPose(doorFraction);
 box(entry.hingeX,.045,entry.hingeZ,.047,2,entry.width,'wood',angle,entry.hingeX);
 const knob=objectPose(objects[0],doorFraction);
 box(knob.x-.035,knob.y-.035,knob.z-.035,.11,.07,.07,'brass');
 box(-3.66,.0,.79,1.53,.84,.53,'wood');
 box(-3.70,.84,.76,1.62,.075,.62,'trim');
 const pull=(state['console-drawer']||0)*.31;
 box(-3.19,.58,.76-pull,.58,.20,.10+pull,'wood');
 box(-2.96,.655,.735-pull,.14,.035,.035,'brass');
 if(pull>.16)box(-2.94,.785,.73-pull,.17,.009,.11,'cream');
 box(-2.41,.91,.93,.17,.06,.16,'brass');
 box(-2.35,.97,.99,.044,.25,.042,'brass');
 box(-2.47,1.19,.87,.28,.18,.28,state['console-switch']?'black':'light');
 place('house-book',()=>box(-2.84,.915,.96,.24,.042,.16,'green'));
 place('record-player',()=>{box(-3.61,.915,.93,.48,.075,.34,'black');
 box(-3.53,.993,.96,.29,.01,.23,'black');
 box(-3.48,1.003,1.02,.19,.014,.13,'brass');});
 place('salmon-picture',()=>{box(-3.23,1.35,1.51,.72,.61,.065,'frame');
 box(-3.17,1.41,1.502,.60,.49,.027,'canvas');});
 box(-4.01,1.12,1.52,.53,1.04,.07,'trim');
 box(-3.96,1.18,1.49,.43,.90,.027,'glass');
 box(-3.97,1.60,1.475,.45,.026,.044,'trim');
 box(-3.78,1.17,1.475,.029,.93,.044,'trim');
 box(-3.86,.008,-.11,1.96,.012,.62,'rug');
 for(const x of [-3.92,-3.86,-3.80,-3.72,-3.64])box(x,1.24,1.481,.026,.34+(x+4)*.28,.008,'trees');
 return new Float32Array(v);
}
const vertex=`
 precision mediump float;
 attribute vec3 a; attribute vec4 c; attribute float s; attribute vec2 texturePoint;
 uniform vec3 eye; uniform vec2 turn; uniform vec2 viewport;
 uniform float time;
 varying vec3 world; varying vec4 material; varying float shade; varying vec2 uvPicture;
 void main(){
  vec3 vertex=a;
  if(c.a==6.0)vertex.x+=.008*sin(time*.83+a.x*6.0+a.z*3.1)*clamp(a.y*.65,0.0,1.0);
  vec3 p=vertex-eye;float sy=sin(turn.x),cy=cos(turn.x);
  float x=p.x*cy-p.z*sy,z=p.x*sy+p.z*cy;
  float sp=sin(turn.y),cp=cos(turn.y);
  float y=p.y*cp-z*sp;z=z*cp+p.y*sp;
  gl_Position=vec4(x*viewport.x,y*viewport.y,(200.05/199.95)*z-.100025,z);
  world=a; material=c;shade=s;uvPicture=texturePoint;
 }`;
const fragment=`
 precision mediump float;
 varying vec3 world; varying vec4 material; varying float shade; varying vec2 uvPicture;
 uniform float time; uniform float dimmed; uniform float rain; uniform float warmth;
 uniform sampler2D woodGrain; uniform sampler2D woods; uniform sampler2D picture;
 void main(){
  vec3 p=world; float mode=floor(material.a+.5);vec3 color=material.rgb;float light=shade;
  if(mode==1.0||mode==2.0){
   float grain=sin(p.x*21.0+p.z*31.0+p.y*193.0+sin(p.x*7.0+p.z*9.0)*2.0);
   float line=mode==2.0?fract(p.z*5.8):fract(p.y*8.0);
   color*=.95+.032*grain+.037*sin(p.x*7.0+p.z*11.0);
   if(line<.035)color*=.74;
   vec2 grainUV=mode==2.0?vec2(p.x*.65,p.z*.82):vec2((p.z+p.x)*.62,p.y*.88);
   vec3 veneer=texture2D(woodGrain,fract(grainUV)).rgb;
   color*=mix(vec3(1.0),veneer*1.58,mode==2.0?.36:.18);
  }
  if(mode==3.0){
   float streak=step(.965,fract(p.x*147.0+sin(p.x*34.0)*1.3));
   float bead=step(.75,fract(p.y*8.0+time*.17+p.x*37.0));
   color+=vec3(.17,.22,.24)*streak*bead*rain;
   color+=.09*vec3(.8,1.,1.)*(1.0-fract(p.y));
  }
  if(mode==8.0){
   color=texture2D(picture,uvPicture).rgb;
  }
  if(mode==7.0){
   vec2 uv=vec2((p.z+5.95)/10.4,(4.45-p.y)/6.5);
   vec3 forest=texture2D(woods,uv).rgb;
   vec2 edge=smoothstep(vec2(0.),vec2(.08),min(uv,1.-uv));
   forest=mix(vec3(.059,.073,.059),forest,edge.x*edge.y);
   float rainLine=step(.984,fract(uv.x*195.0+sin(uv.x*38.0)*1.9));
   float running=step(.82,fract(uv.y*8.8-time*1.25));
   gl_FragColor=vec4(forest+vec3(.024,.032,.030)*rainLine*running,1.0);
   return;
  }
  if(mode==4.0)color*=.8+.21*sin(p.x*175.0)*sin(p.z*145.0);
  float floorBounce=clamp(p.y*.13,.0,.28);
  light*=.87+floorBounce;
  float stairDay=.27*smoothstep(0.0,4.0,p.z)*smoothstep(0.4,4.2,p.y);
  float lamp=1.0/(1.0+7.0*distance(p,vec3(-2.33,1.26,1.01)));
  color*=light*(warmth+stairDay+lamp*(1.0-dimmed)*1.9-dimmed*.24);
  if(mode==5.0)color+=vec3(.20,.10,.02);
  gl_FragColor=vec4(pow(max(color,0.0),vec3(.84)),1.);
 }`;
export function renderer(canvas){
 const gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
 if(!gl)return null;
 function shader(type,code){
  const item=gl.createShader(type);gl.shaderSource(item,code);gl.compileShader(item);
  if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(item));
  return item;
 }
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);
 function photoTexture(path,unit,tint){
  const texture=gl.createTexture();
  const bind=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);};
  bind();
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(tint));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const plate=new Image();
  plate.onload=()=>{
   if(gl.isContextLost())return;
   bind();
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,plate);
  };
  plate.src=new URL(path,import.meta.url);
 }
 photoTexture('house-plates/entry-woods.webp',0,[19,29,24,255]);
 photoTexture('front-art/salmon.webp',1,[127,89,55,255]);
 photoTexture('pbr/wood-floor-diff.webp',2,[161,161,161,255]);
 gl.uniform1i(gl.getUniformLocation(program,'woods'),0);
 gl.uniform1i(gl.getUniformLocation(program,'picture'),1);
 gl.uniform1i(gl.getUniformLocation(program,'woodGrain'),2);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 for(const [name,size,offset] of [['a',3,0],['c',4,3],['s',1,7],['texturePoint',2,8]]){
  const index=gl.getAttribLocation(program,name);
  gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,40,offset*4);
 }
 const uniforms=Object.fromEntries(['eye','turn','viewport','time','dimmed','rain','warmth'].map(name=>[name,gl.getUniformLocation(program,name)]));
 let lastDoor,lastDrawer,lastLamp,lastPlacements,lastFlight,vertexCount=0;
 return {
  render(camera,state,time,config={},quality=1){
   const density=Math.min(devicePixelRatio||1,1.2,1100/Math.max(canvas.clientWidth,canvas.clientHeight))*quality;
   const width=Math.max(1,Math.round(canvas.clientWidth*density)),height=Math.max(1,Math.round(canvas.clientHeight*density));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
   gl.viewport(0,0,width,height); gl.clearColor(.075,.067,.054,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const door=state['entry-door'],drawer=state['console-drawer'],lamp=state['console-switch'];
   if(!vertexCount||door!==lastDoor||drawer!==lastDrawer||lamp!==lastLamp||config.objects!==lastPlacements||config.stairs!==lastFlight){
    const vertices=mesh(state,config.objects||{},config.stairs||defaultFlight);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
    vertexCount=vertices.length/10;
    lastDoor=door;lastDrawer=drawer;lastLamp=lamp;lastPlacements=config.objects;lastFlight=config.stairs;
   }
   gl.uniform3f(uniforms.eye,camera.x,camera.y,camera.z);gl.uniform2f(uniforms.turn,camera.yaw,camera.pitch);
   gl.uniform2f(uniforms.viewport,1.68*height/width,1.68);gl.uniform1f(uniforms.time,time/1000);
   gl.uniform1f(uniforms.dimmed,state['console-switch']?1:0);gl.uniform1f(uniforms.rain,state['rain-window']?.5:1);
   gl.uniform1f(uniforms.warmth,config.warmth??.75);
   gl.drawArrays(gl.TRIANGLES,0,vertexCount);
  }
 };
}
export function project(camera,object,width,height){
 const dx=object.x-camera.x,dz=object.z-camera.z,dy=object.y-camera.y;
 const sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw),sp=Math.sin(camera.pitch),cp=Math.cos(camera.pitch);
 const x=dx*cy-dz*sy,z0=dx*sy+dz*cy;
 const y=dy*cp-z0*sp,z=z0*cp+dy*sp;
 if(z<.10)return null;
 return {x:width/2+.84*height*x/z,y:height/2-.84*height*y/z,r:.84*height*object.radius/z,z};
}
