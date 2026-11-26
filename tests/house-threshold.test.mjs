import assert from 'node:assert/strict';
import {test} from 'node:test';
import {entryOccupied,hallLocation,moveCamera,objectPose,objects} from '../assets/house-dimensional.mjs';

test('the front door gates both sides of the same opening without opening the walls',()=>{
 const inside={x:-3.1,z:-.72},outside={x:-5.1,z:-.72};
 assert.equal(hallLocation(moveCamera(inside,-4,0,0).x),'Front Hall');
 assert.equal(hallLocation(moveCamera(outside,2,0,0).x),'Front Stoop');
 assert.equal(hallLocation(moveCamera(inside,-4,0,.55).x),'Front Hall');
 assert.equal(hallLocation(moveCamera(inside,-4,0,1).x),'Front Stoop');
 assert.equal(hallLocation(moveCamera(outside,2,0,1).x),'Front Hall');
 assert.equal(hallLocation(moveCamera({...inside,z:.15},-4,0,1).x),'Front Hall');
 assert.ok(moveCamera(outside,-4,0,1).x>=-5.39);
 assert.ok(entryOccupied(-4.1));
 assert.ok(!entryOccupied(-4.7));
});

test('the handle position follows the same swing as the collision leaf',()=>{
 const door=objects.find(object=>object.id==='entry-door');
 const closed=objectPose(door,0),open=objectPose(door,1);
 assert.ok(open.x>closed.x+.8);
 assert.ok(open.z<closed.z-.8);
 assert.equal(open.y,closed.y);
});

test('the same stairway permits ascent and descent with a consistent eye height',async()=>{
 const {defaultFlight,floorHeight}=await import('../assets/house-dimensional.mjs');
 const approach={x:0,y:1.58,z:-.75,yaw:0,pitch:0};
 const mid=moveCamera(approach,0,2.5);
 assert.equal(hallLocation(mid.x,mid.z),'Main Stairs');
 assert.ok(Math.abs(mid.y-(1.58+floorHeight(mid.z)))<.0001);
 const landing=moveCamera(mid,0,4);
 assert.equal(hallLocation(landing.x,landing.z),'Upstairs Landing');
 assert.ok(landing.z<=defaultFlight.run+defaultFlight.landing);
 assert.ok(Math.abs(landing.y-4.3)<.0001);
 const wall=moveCamera(mid,2,0);
 assert.ok(wall.x<defaultFlight.width/2);
 const returned=moveCamera(landing,0,-5.5);
 assert.equal(hallLocation(returned.x,returned.z),'Main Hall');
 assert.equal(returned.y,1.58);
 assert.equal(returned.yaw,approach.yaw);
 assert.equal(moveCamera({...approach,x:-3,z:.5},0,.3).y,1.58);
 const edited={width:.9,run:3.8,rise:2.8,landing:1.4};
 assert.ok(Math.abs(moveCamera(approach,0,6,0,edited).y-4.38)<.0001);
});
