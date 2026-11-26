/* Lightweight perspective model for the provisional stair walk. */
(function () {
  "use strict";
  const {stairs, travel, stairCamera} = window.StudioHouseSpatial;
  const run = stairs.to[2], rise = stairs.to[1];
  const half = stairs.width/2, wall = stairs.wellWidth/2;
  const faces = [];
  const quad = (points, color) => faces.push({points,color});
  const wood = (i, light) => {
    const tone = light + (i*7%13);
    return 'rgb('+[tone+42,tone+14,tone-7].join(',')+')';
  };
  function box(x1,y1,z1,x2,y2,z2,i) {
    quad([[x1,y2,z1],[x2,y2,z1],[x2,y2,z2],[x1,y2,z2]],wood(i,129));
    quad([[x1,y1,z1],[x1,y2,z1],[x1,y2,z2],[x1,y1,z2]],wood(i,84));
    quad([[x2,y1,z1],[x2,y2,z1],[x2,y2,z2],[x2,y1,z2]],wood(i,94));
    quad([[x1,y1,z1],[x2,y1,z1],[x2,y2,z1],[x1,y2,z1]],wood(i,109));
    quad([[x1,y1,z2],[x2,y1,z2],[x2,y2,z2],[x1,y2,z2]],wood(i,101));
  }
  for(let i=0;i<stairs.risers;i++){
    const z=i*run/stairs.treads, y=i*rise/stairs.risers, nextY=(i+1)*rise/stairs.risers;
    quad([[-half,y,z],[half,y,z],[half,nextY,z],[-half,nextY,z]],wood(i,69));
    if(i<stairs.treads){
      const nextZ=(i+1)*run/stairs.treads;
      quad([[-half,nextY,z],[half,nextY,z],[half,nextY,nextZ],[-half,nextY,nextZ]],wood(i,115));
      quad([[-half,nextY+.001,z],[half,nextY+.001,z],[half,nextY+.001,z+.021],[-half,nextY+.001,z+.021]],wood(i,142));
      for(const x of [-half,half]){
        const z2=z+.02, y2=nextY+stairs.railHeight;
        if(i%2===0)box(x-.024,nextY,z2,x+.024,y2,z2+.043,i);
        const nextRailY=y2+rise/stairs.risers;
        quad([[x-.038,y2,z],[x+.038,y2,z],[x+.038,nextRailY,nextZ],[x-.038,nextRailY,nextZ]],wood(i,142));
        quad([[x-.038,y2-.043,z],[x-.038,y2,z],[x-.038,nextRailY,nextZ],[x-.038,nextRailY-.043,nextZ]],wood(i,98));
      }
    }
  }
  for(const x of [-wall,wall]){
    for(let i=0;i<24;i++){
      const y=i*.22;
      quad([[x,y,-1.45],[x,y,5.22],[x,y+.21,5.22],[x,y+.21,-1.45]],wood(i,x<0?73:88));
    }
  }
  for(let i=0;i<10;i++){
    const x=-wall+i*(2*wall/10), x2=x+2*wall/10-.005;
    quad([[x,0,-1.45],[x2,0,-1.45],[x2,0,0],[x,0,0]],wood(i,99));
    quad([[x,rise,run],[x2,rise,run],[x2,rise,5.22],[x,rise,5.22]],wood(i,108));
  }
  quad([[-wall,stairs.ceiling,-1.45],[wall,stairs.ceiling,-1.45],[wall,stairs.ceiling,5.22],[-wall,stairs.ceiling,5.22]],'#463324');
  for(const z of [-1.45,5.22]){
    const floor=z>0?rise:0;
    quad([[-wall,floor,z],[wall,floor,z],[wall,stairs.ceiling,z],[-wall,stairs.ceiling,z]],'#765539');
  }
  const wz=5.20, lower=3.55, upper=4.81;
  quad([[-.49,lower-.05,wz],[.49,lower-.05,wz],[.49,upper+.05,wz],[-.49,upper+.05,wz]],'#39281c');
  for(const [x1,x2] of [[-.44,-.026],[.026,.44]]){
    quad([[x1,lower,wz-.01],[x2,lower,wz-.01],[x2,upper,wz-.01],[x1,upper,wz-.01]],'#9fafa1');
  }

  function render(canvas, progress, descending) {
    const ctx=canvas.getContext("2d");
    if(!ctx)return false;
    const {width,height}=canvas;
    const camera=stairCamera(progress,descending);
    const focal=height/(2*Math.tan(travel.fov*Math.PI/360));
    const sin=Math.sin(travel.pitch),cos=Math.cos(travel.pitch);
    const near=.075;
    function transform([x,y,z]){
      const depth=(z-camera.z)*camera.direction, vertical=y-camera.y;
      return [(x-camera.x)*camera.direction,vertical*cos-depth*sin,depth*cos+vertical*sin];
    }
    function clip(points){
      const result=[];
      for(let i=0;i<points.length;i++){
        const a=points[i],b=points[(i+1)%points.length],inside=a[2]>=near;
        if(inside)result.push(a);
        if(inside!==(b[2]>=near)){
          const t=(near-a[2])/(b[2]-a[2]);
          result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);
        }
      }
      return result;
    }
    const scene=[];
    for(const face of faces){
      const points=clip(face.points.map(transform));
      if(points.length>=3)scene.push({points,color:face.color,depth:Math.max(...points.map(p=>p[2]))});
    }
    scene.sort((a,b)=>b.depth-a.depth);
    ctx.fillStyle='#302117';
    ctx.fillRect(0,0,width,height);
    for(const face of scene){
      ctx.beginPath();
      face.points.forEach(([x,y,z],i)=>{
        const px=width/2+focal*x/z,py=height*.48-focal*y/z;
        if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
      });
      ctx.closePath();
      ctx.fillStyle=face.color;
      ctx.fill();
    }
    const shade=ctx.createRadialGradient(width*.5,height*.37,height*.16,width*.5,height*.46,Math.max(width,height)*.68);
    shade.addColorStop(0,'rgba(242,191,119,.10)');
    shade.addColorStop(1,'rgba(18,12,9,.54)');
    ctx.fillStyle=shade;
    ctx.fillRect(0,0,width,height);
    return true;
  }

  function play(canvas, descending, onReveal, onComplete) {
    const density=Math.min(devicePixelRatio||1,1.15,1000/Math.max(innerWidth,innerHeight));
    canvas.width=Math.max(1,Math.round(innerWidth*density));
    canvas.height=Math.max(1,Math.round(innerHeight*density));
    const start=performance.now();
    if(!render(canvas,0,descending))return null;
    let frame;
    let cancelled=false;
    let revealed=false;
    canvas.hidden=false;
    function step(now){
      if(cancelled)return;
      const t=Math.min(1,(now-start)/window.StudioHouseSpatial.stairDuration);
      render(canvas,t*t*(3-2*t),descending);
      if(t>=.875&&!revealed){revealed=true;onReveal();}
      canvas.style.opacity=String(Math.min(t*8,(1-t)*8,1));
      if(t<1)frame=requestAnimationFrame(step);
      else{
        canvas.hidden=true;
        canvas.style.opacity="";
        onComplete();
      }
    }
    frame=requestAnimationFrame(step);
    return function cancel(){
      cancelled=true;
      cancelAnimationFrame(frame);
      canvas.hidden=true;
      canvas.style.opacity="";
    };
  }
  window.StudioHouseStair = {play,render};
})();
