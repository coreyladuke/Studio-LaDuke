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
