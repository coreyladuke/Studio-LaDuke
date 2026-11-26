export function validateConfig(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid room settings.');
 const config={};
 if(value.warmth!==undefined){
  if(!Number.isFinite(value.warmth)||value.warmth<.35||value.warmth>1.2)throw new Error('Invalid room lighting.');
  config.warmth=value.warmth;
 }
 if(value.rainVolume!==undefined){
  if(!Number.isFinite(value.rainVolume)||value.rainVolume<0||value.rainVolume>1)throw new Error('Invalid rain level.');
  config.rainVolume=value.rainVolume;
 }
 if(value.objects){
  config.objects={};
  for(const id of ['salmon-picture','house-book','record-player']){
   const object=value.objects[id];
   if(!object)continue;
   if(!Number.isFinite(object.x)||object.x<-4||object.x>-1.5||!Number.isFinite(object.y)||object.y<.1||object.y>2.35||
    !Number.isFinite(object.z)||object.z<-1.4||object.z>1.58||!Number.isFinite(object.radius)||object.radius<.06||object.radius>.6)
    throw new Error('Object placement is outside the Front Hall.');
   config.objects[id]={x:object.x,y:object.y,z:object.z,radius:object.radius};
  }
 }
 if(value.layerOrder){
  const allowed=['background','primary','reverse','object-textures','environment','lighting','foreground'];
  if(!Array.isArray(value.layerOrder)||value.layerOrder.length!==allowed.length||
   new Set(value.layerOrder).size!==allowed.length||value.layerOrder.some(slot=>!allowed.includes(slot)))throw new Error('Invalid layer order.');
  config.layerOrder=[...value.layerOrder];
 }
 return config;
}
