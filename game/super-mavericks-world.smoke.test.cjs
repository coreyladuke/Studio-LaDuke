// Headless engine regression checks. Run: node game/super-mavericks-world.smoke.test.cjs
// This mocks only browser rendering; it exercises the actual game engine.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const noop = () => {};
const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop: noop }) }, {
  get: (obj, key) => key in obj ? obj[key] : noop,
  set: (obj, key, value) => { obj[key] = value; return true; }
});
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id, style: {}, hidden: false, textContent: '', value: '', isConnected: true,
      addEventListener: noop, setAttribute: noop, blur: noop, focus: noop,
      requestFullscreen: () => Promise.resolve(), getContext: () => ctx,
      classList: { toggle: noop, add: noop, remove: noop, contains: () => false }
    });
  }
  return elements.get(id);
}
const document = {
  hidden: false, getElementById: element, querySelector: () => element('close'),
  fullscreenElement: null, exitFullscreen: () => Promise.resolve()
};
const window = {};
const store = new Map();
const localStorage = {
  getItem: key => store.get(key) || null,
  setItem: (key, value) => store.set(key, value)
};
class FakeImage { constructor() { this.complete = false; this.naturalWidth = 0; this.src = ''; } }
const speechSynthesis = { cancel: noop, speak: noop };
const engine = fs.readFileSync(path.join(__dirname, 'super-mavericks-world.js'), 'utf8');
const boot = new Function(
  'document','window','Image','localStorage','addEventListener','requestAnimationFrame',
  'cancelAnimationFrame','performance','location','speechSynthesis','setTimeout',
  'clearTimeout','setInterval','clearInterval','matchMedia','URLSearchParams',engine
);
boot(document, window, FakeImage, localStorage, noop, () => 1, noop,
  { now: () => 1000 }, { search: '' }, speechSynthesis, noop, noop, () => 1,
  noop, () => ({ matches: false }), class { get() { return null; } });

const game = window.__mavGameTest;
function run(name, test) { test(); console.log('PASS ' + name); }
run('six authored chapters and six boss encounters', () => {
  assert.equal(game.LEVELS.length, 6);
  assert.equal(game.LEVELS.filter(l => l.boss).length, 3);
  assert.equal(game.LEVELS.filter(l => l.miniBoss).length, 3);
});
run('every checkpoint has a safe ground margin', () => {
  const checks = game.LEVELS.flatMap(l => (l.checkpoints || []).map(x =>
    l.ground.some(([start,,width]) => x >= start + 50 && x + 52 <= start + width - 35)
  ));
  assert.equal(checks.length, 11);
  assert(checks.every(Boolean));
});
run('late-stage checkpoint activates before the final arena', () => {
  game.loadLevel(5);
  game.setPlayer(3160, 330);
  game.step(.016, 3);
  const s = game.state();
  assert.equal(s.checkpointIndex, 2);
  assert.equal(s.checkpointX, 3130);
});
run('a lost life returns Maverick to safe ground', () => {
  game.setPlayer(3150, 700);
  game.step(.016, 1);
  const s = game.state();
  assert.equal(s.player.x, 3130);
  assert.equal(s.player.y, 300);
  assert.equal(s.lives, 2);
});
run('boss fires toward a player on its right', () => {
  game.loadLevel(5);
  game.setPlayer(3700, 330);
  game.step(.016, 110);
  assert(game.state().projectiles.some(p => p.vx > 0));
});
run('boss fires toward a player on its left', () => {
  game.loadLevel(5);
  game.setPlayer(2960, 330);
  game.step(.016, 110);
  assert(game.state().projectiles.some(p => p.vx < 0));
});
run('first optional-route mini-boss activates', () => {
  game.loadLevel(0);
  game.setPlayer(4240, 330);
  game.step(.016, 4);
  const s = game.state();
  assert.equal(s.activeMidBoss, true);
  assert.equal(s.bossMax, 4);
});
run('grounded Maverick does not re-enter a landing pose while standing', () => {
  game.loadLevel(0);
  game.setPlayer(120, 330);
  game.step(.016, 160);
  const state = game.state();
  assert.equal(state.player.ground, true);
  assert.equal(state.player.land, 0);
  assert.equal(game.activeSpriteFrame(), 0);
});
run('running cycles through strides rather than sliding in the landing pose', () => {
  game.input.right = true;
  const poses = new Set();
  for(let i=0;i<75;i++) {
    game.step(.016,1);
    const state=game.state();
    if(state.player.ground && state.player.vx>45)poses.add(game.activeSpriteFrame());
  }
  game.input.right = false;
  assert(poses.has(1) && poses.has(2) && poses.has(3));
  assert.equal(poses.has(7), false);
});
run('Maverick, Finn, and Bob costumes use one physical sprite atlas', () => {
  assert.deepEqual(Object.keys(game.spriteSheets), ['mav']);
  const atlas=game.spriteSheets.mav;
  assert.equal(atlas.w,384);assert.equal(atlas.h,512);
  game.loadLevel(0);
  game.setPlayer(280,370);game.step(.016,8);
  const start=game.state().player;
  game.activateFinn(false);
  const finn=game.state().player;
  assert.equal(finn.finn,true);assert.equal(finn.bob,false);
  assert.equal(finn.x,start.x);assert.equal(finn.y,start.y);
  assert.equal(finn.w,start.w);assert.equal(finn.h,start.h);
  game.activateBob();
  const bob=game.state().player;
  assert.equal(bob.bob,true);assert.equal(bob.finn,false);
  assert.equal(bob.x,start.x);assert.equal(bob.y,start.y);
  assert.equal(bob.w,start.w);assert.equal(bob.h,start.h);
});
run('both costumes preserve abilities and reset old ability cooldowns', () => {
  game.loadLevel(0);
  game.activateFinn(false);
  game.throwBone();
  assert.equal(game.state().counts.bones,1);
  game.activateBob();
  game.throwBone();
  assert.equal(game.state().counts.vines,1);
});
console.log('All Super Maverick\'s World engine smoke checks passed.');
