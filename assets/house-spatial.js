/* House Guide route. Coordinates are provisional metres: x east, y up, z north. */
(function () {
  "use strict";

  const rooms = {
    foyer: {name:"Front Hall", floor:0, ceiling:2.55, bounds:[-4.1,-1.6,-1.4,1.6],
      plate:"assets/front-room-doors.webp", eye:[-2.7,1.58,0]},
    hall: {name:"Main Hall", floor:0, ceiling:2.55, bounds:[-1.4,-1.6,1.4,0],
      plate:"assets/house-plates/main-hall-cedar.webp", eye:[0,1.58,-1.25]},
    landing: {name:"Upstairs Landing", floor:2.72, ceiling:5.15, bounds:[-1.4,3.5,1.4,5.1],
      eye:[0,4.30,4.27]}
  };
  const opening = {name:"Main Hall Opening", rooms:["foyer","hall"],
    center:[-1.4,0,-.8], normal:[1,0,0], width:1.02, height:2.12};
  const stairs = {name:"Main Stairs", rooms:["hall","landing"], from:[0,0,0], to:[0,2.72,3.5],
    treads:14, risers:15, width:1.10, railHeight:.91, wellWidth:1.55, ceiling:5.15};
  const photos = Object.fromEntries(Object.entries(rooms).filter(([,room])=>room.plate)
    .map(([key,room])=>[key,room.plate]));
  const stairDuration = 1180;
  const travel = {near:-.72, far:4.23, eye:1.58, pitch:-.075, fov:65};

  function stairCamera(progress, descending) {
    const phase = descending ? 1-progress : progress;
    const z = travel.near + (travel.far-travel.near)*phase;
    const height = Math.max(0,Math.min(1,z/stairs.to[2]))*stairs.to[1];
    const sway = Math.sin(phase*Math.PI*6)*Math.sin(phase*Math.PI)*.014;
    return {x:sway,y:height+travel.eye,z,direction:descending?-1:1};
  }

  globalThis.StudioHouseSpatial = {rooms, opening, stairs, photos, travel, stairDuration, stairCamera};
})();
