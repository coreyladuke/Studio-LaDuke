const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { runInNewContext } = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");

const html = readFileSync(join(__dirname, "../pool.html"), "utf8");
const script = html.match(/<script>([\s\S]+)<\/script>/)[1];

function runGame(check) {
  const context = new Proxy({}, { get: () => () => context });
  const element = {
    width: 1200,
    dataset: {},
    height: 624,
    classList: { toggle() {} },
    style: {},
    getContext: () => context,
    addEventListener() {},
    setAttribute() {},
    setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 624 })
  };
  runInNewContext(script.replace("})();", check + "\n})();"), {
    assert, performance, window: {}, requestAnimationFrame() {},
    document: { getElementById: () => ({ ...element }), createElement: () => ({ ...element }) }
  });
}

test("a fast near miss at each pocket rebounds, and a centered shot falls", () => {
  runGame(`
    for (const pocket of pockets) {
      const sx = pocket.x <= W/2 ? 1 : -1;
      const sy = pocket.y < H/2 ? 1 : -1;
      const miss = makeBall(1, pocket.x+sx*34, pocket.y+sy*28);
      miss.vy=-sy*18;
      balls=[miss];
      for(let step=0;step<6;step++) physicsStep(physicsTick);
      assert.equal(miss.pocketed,false);
      assert.ok(miss.y>=top+R && miss.y<=bottom-R);
      assert.ok(sy*miss.vy>0);

      const taken = makeBall(1, pocket.x+(pocket.kind==="corner" ? sx*19 : 0), pocket.y+sy*32);
      taken.vy=-sy*18;
      balls=[taken];
      for(let step=0;step<6;step++) physicsStep(physicsTick);
      assert.equal(taken.pocketed,true);
    }
  `);
});

test("grazing trajectories around every pocket leave no live balls beyond the cushions", () => {
  runGame(`
    for (const pocket of pockets) {
      const sx = pocket.x <= W/2 ? 1 : -1;
      const sy = pocket.y < H/2 ? 1 : -1;
      for(let offset=16;offset<=49;offset+=1){
        for(let angle=-.8;angle<=.81;angle+=.2){
          const ball=makeBall(1,pocket.x+sx*offset,pocket.y+sy*35);
          ball.vx=Math.sin(angle)*18;
          ball.vy=-sy*Math.cos(angle)*18;
          balls=[ball];
          for(let step=0;step<20;step++) physicsStep(physicsTick);
          if(!ball.pocketed){
            assert.ok(ball.x>=left+R && ball.x<=right-R);
            assert.ok(ball.y>=top+R && ball.y<=bottom-R);
          }
        }
      }
    }
  `);
});

test("regripping the cue starts from the last aim and ignores a second finger", () => {
  runGame(`
    const c=cue();
    const pointer=(x,y,id=1,type="pointerdown")=>({
      button:0,pointerId:id,pointerType:"touch",clientX:c.x+x,clientY:c.y+y,type
    });
    canvasDown(pointer(100,0));
    canvasMove(pointer(100,80));
    const held=aimAngle;
    assert.ok(held>.6);
    canvasUp(pointer(100,80,1,"pointerup"));
    canvasDown(pointer(-100,0,2));
    assert.equal(aimAngle,held);
    canvasMove(pointer(-100,80,3));
    assert.equal(aimAngle,held);
    canvasMove(pointer(-100,-80,2));
    assert.ok(aimAngle>held+.6);
    canvasUp(pointer(-100,-80,2,"pointercancel"));
    const released=aimAngle;
    canvasMove(pointer(-100,0,2));
    assert.equal(aimAngle,released);
  `);
});

test("the number and stripe roll with distance and reverse direction together", () => {
  runGame(`
    const b=makeBall(9,0,0);
    const quarterTurn=R*Math.PI/2;
    rollBall(b,0,quarterTurn);
    assert.ok(b.face[1]>.999);
    assert.ok(b.down[2]<-.999);
    rollBall(b,0,-quarterTurn);
    assert.ok(b.face[2]>.999);
    assert.ok(b.down[1]>.999);
    rollBall(b,quarterTurn,0);
    assert.ok(b.face[0]>.999);
    assert.ok(b.right[2]<-.999);
  `);
});

test("a full break settles and passes play even when frames arrive slowly", () => {
  runGame(`
    lastTime=0;
    shoot(1);
    for(let now=125;now<=7000&&ballsMoving;now+=125) loop(now);
    assert.equal(ballsMoving,false);
    assert.equal(statusEl.textContent,"Player 2's turn.");
  `);
});

test("aim predicts the nearest object-ball contact and ignores a pocketed ball", () => {
  runGame(`
    const c=makeBall(0,300,300);
    const near=makeBall(1,447,311);
    const far=makeBall(2,500,300);
    balls=[c,far,near];
    const hit=aimContact(c,1,0);
    assert.equal(hit.object,near);
    assert.ok(Math.abs(hit.distance-(147-Math.sqrt(4*R*R-121)))<.001);
    near.pocketed=true;
    assert.equal(aimContact(c,1,0).object,far);
    assert.equal(aimContact(c,-1,0).distance,c.x-left-R);
  `);
});

test("the three solo layouts can all be pocketed and a new rack restores two-player play", () => {
  runGame(`
    practice={attempt:0,score:0};
    startPracticeShot();
    for(const layout of practiceShots){
      const pocket=pockets[layout.pocket];
      const c=cue(), target=balls.find(ball=>ball.n===3);
      const a=Math.atan2(pocket.y-target.y,pocket.x-target.x);
      aimAngle=Math.atan2(target.y-Math.sin(a)*R*2-c.y,target.x-Math.cos(a)*R*2-c.x);
      shoot(.71);
      for(let i=0;i<1300&&ballsMoving;i++) physicsStep(physicsTick);
    }
    assert.equal(gameOver,true);
    assert.equal(practice.score,3);
    assert.equal(ballsMoving,false);
    resetRack();
    assert.equal(practice,null);
    assert.equal(balls.length,16);
  `);
});
