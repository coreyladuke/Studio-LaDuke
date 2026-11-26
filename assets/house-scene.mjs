import {exits, rooms} from './house-layout.mjs';
import {boundsDefault,defaults,source} from './house-assets.mjs';

const svgNS='http://www.w3.org/2000/svg';
function svg(tag,attributes){
 const element=document.createElementNS(svgNS,tag);
 for(const [key,value] of Object.entries(attributes))element.setAttribute(key,value);
 return element;
}
function model(room){
 const picture=svg('svg',{viewBox:'0 0 1000 600','aria-hidden':true,preserveAspectRatio:'none'});
 const width=Math.max(300,Math.min(680,room.width*105));
 const left=500-width/2,right=500+width/2;
 const roof=120+Math.min(80,room.depth*8);
 const floor=450-Math.min(90,room.depth*11);
 for(const [points,fill] of [
  ['0,0 1000,0 '+right+','+roof+' '+left+','+roof,'#504c40'],
  ['0,0 '+left+','+roof+' '+left+','+floor+' 0,600','#6d6756'],
  ['1000,0 '+right+','+roof+' '+right+','+floor+' 1000,600','#464637'],
  ['0,600 '+left+','+floor+' '+right+','+floor+' 1000,600','#544538'],
  [left+','+roof+' '+right+','+roof+' '+right+','+floor+' '+left+','+floor,'#86816d']
 ])picture.append(svg('polygon',{points,fill}));
 for(let i=0;i<9;i++){
  const x=i*125;
  picture.append(svg('path',{d:'M'+x+' 600L'+(left+(right-left)*i/8)+' '+floor,stroke:'#b0a18b','stroke-opacity':'.32'}));
 }
 return picture;
}
function boxStyle(element,bounds){
 Object.assign(element.style,{left:bounds.x+'%',top:bounds.y+'%',width:bounds.width+'%',height:bounds.height+'%'});
}
export function renderScene(stage,{room,view,layers={},boundaries={},onCross,onObject,mark,layerOrder}){
 const urls=[];
 const modelLayer=model(rooms[room]);
 const available=exits(room);
 const visible=view==='primary'?available.filter(edge=>edge.kind!=='hatch'):
  view==='reverse'?[available[0]].filter(Boolean):available.filter(edge=>edge.id===view);
 stage.replaceChildren(modelLayer);
 const mobile=matchMedia('(max-width: 650px)').matches;
 for(const slot of layerOrder||['background','primary','reverse','object-textures','environment','lighting','foreground']){
  const asset=layers[slot];
  if(!asset)continue;
  const resource=source(asset,mobile);
  if(!resource.url)continue;
  if(resource.release)urls.push(resource.url);
  const photo=document.createElement('img');
  photo.alt='';
  photo.className='scene-image '+slot;
  const {x,y,scale,perspective}=asset.alignment||defaults;
  photo.style.transform='translate('+x+'%,'+y+'%) perspective(900px) rotateY('+perspective+'deg) scale('+scale/100+')';
  photo.addEventListener('error',()=>photo.remove(),{once:true});
  photo.src=resource.url;
  stage.append(photo);
 }
 stage.classList.toggle('has-photo',Boolean(layers.primary||layers.reverse));
 for(const [i,edge] of visible.entries()){
  const span=Math.min(17,65/visible.length);
  const b=boundaries[edge.id]||(visible.length===1?boundsDefault:
   {x:17.5+i*(65/visible.length)+(65/visible.length-span)/2,y:31,width:span,height:41});
  const button=document.createElement(onCross?'button':'span');
  button.className='portal '+edge.kind;
  button.dataset.portal=edge.id;
  button.textContent=edge.label;
  button.setAttribute('aria-label',edge.label+' to '+rooms[edge.destination].name);
  boxStyle(button,b);
  if(onCross)button.onclick=()=>onCross(edge);
  stage.append(button);
 }
 if(onObject){
  for(const [kind,label] of [['light','Light switch'],['window','Window'],['object','Object']]){
   const button=document.createElement('button');
   button.type='button';button.className='fixture '+kind;button.textContent=label;
   if(kind!=='object')button.setAttribute('aria-pressed','false');
   button.onclick=()=>onObject(kind,button);
   stage.append(button);
  }
 }
 if(mark){
  const label=document.createElement('span');label.className='scene-status';label.textContent=mark;stage.append(label);
 }
 return ()=>urls.forEach(url=>URL.revokeObjectURL(url));
}
