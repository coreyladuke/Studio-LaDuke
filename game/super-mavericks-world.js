(() => {
  'use strict';
  const canvas=document.getElementById('mavGameCanvas'); if(!canvas)return;
  const ctx=canvas.getContext('2d'), W=960,H=540, TAU=Math.PI*2;
  const modal=document.getElementById('gameModal'),score=document.getElementById('gameScore');
  const titleScreen=document.getElementById('mavTitleScreen'),pauseScreen=document.getElementById('mavPauseScreen'),winScreen=document.getElementById('mavWinScreen'),gameOverScreen=document.getElementById('mavGameOverScreen'),libraryScreen=document.getElementById('mavLibraryScreen'),heimrScreen=document.getElementById('mavHeimrScreen'),prismScreen=document.getElementById('mavPrismScreen');
  canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=true;
  const input={left:false,right:false,jump:false,down:false},pressed={jump:false,bone:false,dash:false};
  let soundEnabled=true,musicTimer=0,musicStep=0;
  try{soundEnabled=localStorage.getItem('mavWorldSoundV1')!=='off'}catch(_){ }
  const tune=[659,0,784,0,988,784,659,0,587,0,698,0,880,698,587,0,523,0,659,0,784,659,523,0,587,0,698,0,784,0,988,0];
  const bgFiles=["game/assets/chapter-1.webp", "game/assets/chapter-2.webp", "game/assets/chapter-3.webp", "game/assets/chapter-4.webp"];
  const bgs=bgFiles.map(src=>{const i=new Image();i.src=src;return i});
  // Every power-up uses Maverick's own eight animation frames; suits are layers,
// not separate protagonists with incompatible faces, proportions or padding.
const spriteSheets={mav:{image:new Image(),src:'game/assets/maverick-sprites.webp',w:384,h:512,drawW:88,drawH:118}};
  let running=false,raf=0,last=0,restartArm=0;
  const S={level:0,mode:'world',screen:'title',coins:0,points:0,lives:3,tags:0,cam:0,time:0,won:false,transition:2.2,message:'',messageTime:0,shake:0,bossHP:9,bossMax:9,midBossDone:false,activeMidBoss:false};
  const SAVE_NAMES={1:'COREY',2:'MAVERICK',3:'FRIEND'},SAVE_PREFIX='mavWorldRunV1-slot';let activeSaveSlot=1;try{activeSaveSlot=Number(localStorage.getItem('mavWorldActiveSlotV1')||1)}catch(_){ }if(![1,2,3].includes(activeSaveSlot))activeSaveSlot=1;
function saveKey(slot=activeSaveSlot){return SAVE_PREFIX+slot}
function readRunSave(slot=activeSaveSlot){try{const data=JSON.parse(localStorage.getItem(saveKey(slot))||'null');return data&&data.version===1?data:null}catch(_){return null}}
function writeRunSave(completed=false){try{localStorage.setItem(saveKey(),JSON.stringify({version:1,level:S.level,checkpointX,checkpointIndex,points:S.points,coinsTotal:S.coins,lives:S.lives,tags:S.tags,midBossDone:S.midBossDone,completed:!!completed,coins:coins.map(c=>!!c.taken),blocks:blocks.map(b=>[!!b.used,!!b.broken]),enemies:enemies.map(e=>!!e.alive),player:{finn:!!player.finn,bob:!!player.bob,cape:!!player.cape,glide:!!player.glide,runners:!!player.runners,double:!!player.double,blend:player.blend||0},savedAt:Date.now()}))}catch(_){ }}
function saveProgressLabel(data){if(!data)return'EMPTY SLOT';if(data.completed)return'CAMPAIGN COMPLETE';const n=Math.max(0,Math.min(LEVELS.length-1,Number(data.level)||0)),stage=LEVELS[n];return'WORLD '+((stage?.worldId||0)+1)+' · STAGE '+(stage?.chapter||n+1)+'/6'}
function refreshSaveSlots(){document.querySelectorAll('[data-mav-save-slot]').forEach(button=>{const slot=Number(button.dataset.mavSaveSlot),data=readRunSave(slot);button.classList.toggle('active',slot===activeSaveSlot);button.setAttribute('aria-pressed',String(slot===activeSaveSlot));const status=button.querySelector('small');if(status)status.textContent=saveProgressLabel(data)});const data=readRunSave(),startButton=document.getElementById('mavStartButton'),newButton=document.getElementById('mavNewGameButton');if(startButton)startButton.innerHTML=(data&&!data.completed?'CONTINUE · '+saveProgressLabel(data):data?.completed?'PLAY AGAIN':'START ADVENTURE')+' <span>▶</span>';if(newButton){newButton.hidden=!data;newButton.textContent='NEW ADVENTURE'}}
function restoreRunSave(data){const index=Math.max(0,Math.min(LEVELS.length-1,Number(data.level)||0));loadLevel(index,false);S.points=Number(data.points)||0;S.coins=Number(data.coinsTotal)||0;S.lives=Math.max(1,Number(data.lives)||3);S.tags=Number(data.tags)||0;S.midBossDone=!!data.midBossDone;checkpointX=Math.max(level.start[0],Math.min(level.finish-40,Number(data.checkpointX)||level.start[0]));checkpointIndex=Math.max(0,Number(data.checkpointIndex)||0);if(Array.isArray(data.coins))data.coins.forEach((taken,i)=>{if(coins[i])coins[i].taken=!!taken});if(Array.isArray(data.blocks))data.blocks.forEach((state,i)=>{if(blocks[i]){blocks[i].used=!!state?.[0];blocks[i].broken=!!state?.[1]}});if(Array.isArray(data.enemies))data.enemies.forEach((alive,i)=>{if(enemies[i])enemies[i].alive=!!alive});if(data.player&&typeof data.player==='object')Object.assign(player,data.player);player.x=checkpointX;player.y=level.start[1];player.vx=0;player.vy=0;player.ground=false;player.inv=1;S.cam=clamp(player.x-W*.42,0,Math.max(0,level.world-W));updateScore();writeRunSave()}
function startNewAdventure(){const previous=readRunSave();if(previous&&!confirm('Start over in the '+SAVE_NAMES[activeSaveSlot]+' slot? Its campaign save will be replaced.'))return;try{localStorage.removeItem(saveKey())}catch(_){ }reset();S.screen='playing';syncScreens();start();startMusic();writeRunSave();refreshSaveSlots()}
const player={x:120,y:330,w:52,h:68,vx:0,vy:0,dir:1,ground:false,coyote:0,jumpBuffer:0,hold:0,skid:0,land:0,punch:0,inv:0,finn:false,bob:false,blend:0,double:true,dash:0,dashCD:0,boneCD:0,cape:false,glide:false,runners:false,speedBoost:0,stride:0};
  let level,blocks=[],coins=[],bonusCoins=[],enemies=[],bones=[],vines=[],particles=[],items=[],hazards=[],boss=null,returnX=1280,checkpointX=120,checkpointIndex=0;
  const gearScenesSeen={finn:false,cape:false,runners:false};
  const PIXEL_PALETTE={o:'#342638',h:'#603b2c',H:'#a45d36',s:'#e9a878',S:'#ffd3a1',r:'#c9434e',R:'#ff745c',y:'#ffd74e',b:'#246fc1',B:'#54a9ee',g:'#503044',G:'#f2bd56',w:'#fff8de',e:'#263348',k:'#192631',f:'#f3ead0',F:'#b46d3e',d:'#30343e',D:'#58616c',p:'#a73f55',l:'#65bb4e',L:'#9cdb5e',c:'#8c572b'};
  const PIXEL_SPRITES={
    mav:['......hhhh......','.....hHHHHh.....','....hhHHHHhh....','...hhhhhhhhhh...','...hSSSSSSSSs...','...sSSSSSSee....','...sSSSSSSSSs...','....sSSSsss......','.....sssss.......','....oRRRRRRo.....','...orRRRRRRRo....','...orRRyyRRRo....','...ooRRRRRRoo....','.....ooRRoo.......','.....bBBb.........','....obBBBo........','....obBBBo........','...gggggggg.......','...gGggggGg.......','..gggg..gggg......'],
    finn:['......oo.........','.....oFFo........','....oFFFFo.......','...oFFFFFooo.....','..oFFFFFFFDo.....','..oFFFFFFFDo.....','...oFFFFFFFo.....','....oFFFFFo......','....oFFFFo.......','...oFfffFfo......','...oFwwfFfo......','....oFkkFo.......','.....oFpo.........','....oDDDDDo......','...oDDDDDDDo.....','...oDddddDDo.....','..oDdd..ddDDo....','..oDD....DDDo....','...gG....gGg.....','..gggg..gggg.....'],
    bob:['......llll.......','....llLLLLll.....','...lLLLLLLLLl....','..llLLLLLLLLll...','..lLLLSSSLLLLl...','..lLLSeeeLLLLl...','...lLLSSSLLLl....','....lLLLLLLl.....','..lllLLLLLLlll...','..lLLLLLLLLLLl...','..lLLLllllLLLl...','...lLLl..lLLl.....','...lLLl..lLLl.....','....lLL..LLl......','...olLLLLLLLo.....','..oLLLLLLLLLLo....','..olLLLppLLLLo....','...oLLLLLLLLo.....','....cCC..CCc......','...cccc..cccc.....']
  };
  const LEVELS=[
    {name:'SUNLIT FORT TRAIL',world:3200,theme:0,start:[120,330],ground:[[0,438,630],[760,438,600],[1460,438,440],[2010,438,560],[2690,438,510]],
      plats:[[445,350,180],[880,330,180],[1110,270,170],[1540,350,210],[1810,290,130],[2140,335,260],[2500,270,170],[2780,340,240]],
      blocks:[[250,320,'coin'],[305,320,'brick'],[360,320,'finn'],[930,245,'brick'],[988,245,'coin'],[1046,245,'brick'],[1570,265,'brick'],[1628,265,'brick'],[1686,265,'tag'],[2190,250,'brick'],[2248,250,'coin'],[2306,250,'brick'],[2840,255,'coin']],
      coins:[[570,380],[810,370],[1190,220],[1390,360],[1760,245],[1950,350],[2430,300],[2630,230],[2890,300]], enemies:[[980,392],[1640,392],[2290,392],[2760,392]], finish:3090,
      intro:'LEVEL 1  •  FIND THE WAGGING BLOCK'},
    {name:'CEDAR RUSH',world:3500,theme:1,start:[100,330],ground:[[0,438,520],[665,438,430],[1225,438,310],[1685,438,480],[2300,438,360],[2800,438,700]],
      plats:[[250,335,190],[720,320,180],[980,245,155],[1260,330,210],[1540,255,120],[1740,345,210],[2040,270,170],[2340,335,210],[2650,255,135],[2910,330,210],[3220,250,150]],
      blocks:[[300,250,'brick'],[358,250,'coin'],[760,235,'brick'],[818,235,'brick'],[876,235,'tag'],[1290,245,'brick'],[1348,245,'coin'],[1790,260,'brick'],[1848,260,'brick'],[2400,250,'coin'],[2960,245,'brick'],[3018,245,'coin']],
      coins:[[540,370],[620,330],[940,210],[1160,340],[1510,215],[1980,230],[2220,350],[2700,215],[3150,300],[3330,210]],enemies:[[780,392],[1320,392],[1880,392],[2440,392],[3040,392]],finish:3380,intro:'LEVEL 2  •  DASH THROUGH THE RAIN'},
    {name:"BOB'S GREENHOUSE",world:3600,theme:2,start:[110,330],ground:[[0,438,720],[850,438,520],[1510,438,430],[2080,438,390],[2600,438,1000]],
      plats:[[290,330,230],[620,260,150],[930,340,210],[1210,265,150],[1570,330,220],[1830,245,160],[2140,340,230],[2440,260,170],[2740,340,220],[3050,255,160],[3290,330,210]],
      blocks:[[340,245,'brick'],[398,245,'coin'],[456,245,'brick'],[970,255,'brick'],[1028,255,'tag'],[1086,255,'brick'],[1600,245,'brick'],[1658,245,'coin'],[2160,250,'brick'],[2218,250,'brick'],[2276,250,'coin'],[2790,255,'brick'],[2848,255,'coin'],[3320,245,'brick']],
      coins:[[750,215],[810,270],[1410,350],[1470,300],[1980,210],[2040,260],[2510,220],[2570,275],[3000,210],[3210,280]],enemies:[[610,392],[1050,392],[1710,392],[2250,392],[2860,392],[3350,392]],finish:3480,intro:'LEVEL 3  •  BONES VS. BOTANICAL NONSENSE'},
    {name:'GRUMBLE KEEP',world:1900,theme:3,start:[120,330],ground:[[0,438,1900]],plats:[[410,320,180],[720,255,170],[1030,335,190],[1370,270,170]],blocks:[[230,320,'finn'],[470,235,'coin'],[1090,250,'coin']],coins:[[560,275],[805,210],[1170,290],[1450,225]],enemies:[],finish:9999,intro:'BOSS LEVEL  •  THE GRUMBLE KING'}
  ];
  // Six stages form three distinct worlds. Each world ends with a main boss;
  // its first stage has an optional-route miniboss arena before the exit.
  LEVELS[0].checkpoints=[1740,3820];
  Object.assign(LEVELS[0],{world:6100,finish:5960});
  LEVELS[0].ground.push([3330,438,660],[4140,438,430],[4720,438,760],[5620,438,480]);
  LEVELS[0].plats.push([3430,330,180],[3710,255,180],[4170,340,230],[4510,275,150],[4820,335,220],[5120,250,160],[5480,330,190],[5780,255,160]);
  LEVELS[0].blocks.push([3470,245,'brick'],[3528,245,'coin'],[3586,245,'brick'],[4210,255,'brick'],[4268,255,'brick'],[4326,255,'coin'],[4860,250,'brick'],[4918,250,'coin'],[5170,165,'tag'],[5660,245,'brick'],[5718,245,'brick'],[5776,245,'coin']);
  LEVELS[0].blocks[4]=[988,245,'cape'];
  LEVELS[0].blocks.push([2890,245,'runners']);
  LEVELS[0].coins.push([3260,340],[3650,210],[4050,350],[4460,230],[4660,330],[5040,215],[5370,310],[5560,370],[5880,210]);
  LEVELS[0].enemies.push([3490,392],[4230,392],[4920,392],[5680,392]);
  LEVELS[1].world=3900;LEVELS[1].finish=3700;LEVELS[1].checkpoints=[1800];
  LEVELS[2].world=6800;LEVELS[2].finish=6660;LEVELS[2].checkpoints=[1790,4160];LEVELS[2].blocks[1]=[398,245,'bob'];
  LEVELS[2].ground.push([3740,438,210],[4100,438,650],[4900,438,390],[5430,438,610],[6190,438,610]);
  LEVELS[2].plats.push([3530,325,220],[3830,245,150],[4150,340,230],[4490,260,170],[4940,330,210],[5240,245,145],[5480,340,220],[5790,265,170],[6240,330,210],[6520,245,160]);
  LEVELS[2].blocks.push([3570,240,'brick'],[3628,240,'coin'],[3686,240,'brick'],[4180,255,'brick'],[4238,255,'coin'],[4296,255,'brick'],[4980,245,'brick'],[5038,245,'brick'],[5096,245,'coin'],[5530,255,'brick'],[5588,255,'tag'],[6300,245,'brick'],[6358,245,'coin'],[6570,160,'brick']);
  LEVELS[2].coins.push([3420,350],[3780,210],[4020,350],[4430,220],[4800,350],[5190,205],[5380,340],[5750,225],[6110,350],[6470,205],[6700,350]);
  LEVELS[2].enemies.push([3610,392],[4210,392],[5030,392],[5560,392],[6300,392],[6640,392]);
  Object.assign(LEVELS[3],{name:'ROOT-LOCKED RUINS',world:3300,intro:'BOSS CHAPTER  •  GET THROUGH THE OLD GARDEN. THEN FILE A COMPLAINT.'});
  LEVELS[3].ground.splice(0,1,[0,438,680],[820,438,520],[1470,438,430],[2020,438,1280]);
  LEVELS[3].plats.push([1640,335,190],[1950,255,170],[2280,330,190]);
  LEVELS[3].blocks.push([1530,245,'brick'],[1588,245,'coin'],[2050,170,'tag']);
  LEVELS[3].coins.push([1780,290],[1990,210],[2220,290],[2480,350]);
  LEVELS[3].enemies.push([970,392],[1700,392],[2200,392]);
  LEVELS[1].boss={name:'RAINCALLER RAM',kind:'ram',x:2950,y:312,bounds:[2600,3350],hp:6,projectile:'rain'};
  LEVELS[3].boss={name:'BARKBACK BRUISER',kind:'boar',x:2790,y:312,bounds:[2440,3160],hp:7,projectile:'seed'};
  LEVELS.push({name:'TIDAL ROOTS',world:6200,theme:2,start:[110,330],ground:[[0,438,560],[690,438,600],[1430,438,430],[1970,438,710],[2790,438,520],[3430,438,720],[4310,438,540],[5010,438,1050]],plats:[[210,335,190],[520,265,150],[760,335,180],[1110,270,170],[1470,340,210],[1750,265,150],[2020,330,210],[2380,250,160],[2830,335,200],[3180,270,150],[3520,345,220],[3910,260,180],[4360,330,200],[4680,250,150],[5100,335,210],[5520,265,180],[5890,340,170]],blocks:[[300,250,'brick'],[358,250,'coin'],[830,255,'bob'],[1480,250,'brick'],[1538,250,'tag'],[1596,250,'brick'],[2190,245,'brick'],[2248,245,'coin'],[2306,245,'brick'],[2920,245,'brick'],[2978,245,'coin'],[3590,250,'brick'],[3648,250,'tag'],[3706,250,'brick'],[4450,245,'brick'],[4508,245,'coin'],[4566,245,'brick'],[5280,245,'finn']],coins:[[600,350],[1040,220],[1370,340],[1850,215],[2480,205],[2730,340],[3360,350],[3820,215],[4200,330],[4840,210],[5000,350],[5740,215],[6070,320]],enemies:[[930,392],[1680,392],[2410,392],[3310,392],[4170,392],[4890,392],[5830,392]],finish:6030,checkpoints:[2100,4240],intro:'LEVEL 5  •  FIND THE LOW TIDE PATH'});
  LEVELS.push({name:'GRUMBLE KEEP',world:3900,theme:3,start:[110,330],ground:[[0,438,640],[770,438,580],[1470,438,520],[2110,438,640],[2900,438,1000]],plats:[[240,335,190],[500,260,160],[820,335,180],[1110,260,170],[1510,345,210],[1810,270,150],[2150,335,190],[2490,250,180],[2850,340,220],[3180,265,160],[3500,335,190]],blocks:[[300,250,'brick'],[358,250,'coin'],[900,245,'brick'],[958,245,'tag'],[1016,245,'brick'],[1580,250,'brick'],[1638,250,'coin'],[1696,250,'brick'],[2280,245,'brick'],[2338,245,'coin'],[2396,245,'brick'],[3000,245,'brick'],[3058,245,'coin'],[3116,245,'brick'],[3540,220,'tag']],coins:[[580,215],[1280,220],[1740,210],[2030,340],[2670,200],[2800,330],[3400,210],[3700,300]],enemies:[[650,392],[1280,392],[1980,392],[2800,392],[3460,392]],finish:99999,checkpoints:[1450,2850],intro:'FINAL BOSS  •  THE GRUMBLE KING IS HOME'});
  LEVELS[4].checkpoints=[1740,3850];
  LEVELS[3].checkpoints=[1780,2310];
  LEVELS[5].checkpoints=[1220,3130];
  LEVELS[5].boss={name:'THE GRUMBLE KING',kind:'grumble',x:3420,y:312,bounds:[3020,3730],hp:10,projectile:'complaint'};
  const WORLDS=[
    {name:'SUNLIT FORTLAND',look:'golden hills, clear skies and cedar rain',first:0,last:1},
    {name:'BOB’S WILDWOOD',look:'overgrown greenhouse paths and root-locked ruins',first:2,last:3},
    {name:'TIDAL ROOTS & GRUMBLE KEEP',look:'tide pools, deep greens and a purple sunset fortress',first:4,last:5}
  ];
  const MINI_BOSSES=[
    {name:'THE WAGGING BLOCK BANDIT',kind:'boar',trigger:4200,x:4550,y:312,bounds:[4380,5120],hp:4,projectile:'seed'},
    {name:'BOB’S FLYTRAP COUSIN',kind:'ram',trigger:4680,x:5030,y:312,bounds:[4840,5620],hp:5,projectile:'rain'},
    {name:'THE TIDE-POOL TERROR',kind:'boar',trigger:4050,x:4400,y:312,bounds:[4220,4970],hp:5,projectile:'seed'}
  ];
  [0,2,4].forEach((i,j)=>Object.assign(LEVELS[i],{worldId:j,worldName:WORLDS[j].name,worldLook:WORLDS[j].look,chapter:j*2+1,chaptersInWorld:2,miniBoss:{...MINI_BOSSES[j]}}));
  [1,3,5].forEach((i,j)=>Object.assign(LEVELS[i],{worldId:j,worldName:WORLDS[j].name,worldLook:WORLDS[j].look,chapter:j*2+2,chaptersInWorld:2}));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function rr(x,y,w,h,r,fill,stroke='#183449',lw=3){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
  function ellipse(x,y,rx,ry,fill,stroke=null,lw=2){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
  function text(t,x,y,size=20,fill='#fff',align='left'){ctx.textAlign=align;ctx.font=`900 ${size}px Trebuchet MS, sans-serif`;ctx.lineWidth=Math.max(3,size*.13);ctx.strokeStyle='#10283a';ctx.strokeText(t,x,y);ctx.fillStyle=fill;ctx.fillText(t,x,y)}
  function tone(f=440,d=.08){if(!soundEnabled)return;try{window.beep?.(f,d,'square',.018)}catch(_){}}
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=0}}
  function startMusic(){if(!soundEnabled||S.screen!=='playing'||musicTimer)return;musicStep=0;const tick=()=>{if(!soundEnabled||S.screen!=='playing'||document.hidden)return;const note=tune[musicStep++%tune.length];if(note)tone(note,.105)};tick();musicTimer=setInterval(tick,145)}
  function refreshSoundButton(){const button=document.getElementById('mavSoundButton');if(!button)return;button.textContent=soundEnabled?'♫':'♪̸';button.setAttribute('aria-pressed',String(soundEnabled));button.setAttribute('aria-label',soundEnabled?'Turn game sound off':'Turn game sound on')}
  function speak(t,p=.8){try{if(!speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.pitch=p;u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(_){}}
  function msg(t,sec=2){S.message=t;S.messageTime=sec}
  const stories={intro:[['A QUIET DAY AT THE FORT','Maverick spots a strange light blinking beyond the hills.'],['THE MAP IS MOVING','Finn finds a trail of shining paw prints. Bob insists the map is edible.'],['THREE WORLDS. SIX BIG FIGHTS.','The friends head out to find who woke the Grumble King.']],mini:[['ONE TROUBLEMAKER DOWN','The path ahead opens. The next trail is already acting suspicious.']],finale:[['THE LAST COMPLAINT','Maverick and Finn face the Grumble King while Bob guards the snacks.'],['THE FORT IS SAFE','The king gives up his crown. Bob asks if it is made of lettuce.'],['THE END… FOR TODAY','Corey, Maverick, Finn, and Bob head home. The next cartridge is waiting.']]};
  const miniStories=[
    ['RAIN ON THE CEDAR TRAIL','The bandit drops the gate key. Cedar Rush is waiting beyond the hills.'],
    ['THE GREENHOUSE CAN BREATHE','Bob promises not to eat the key. The old roots point toward the ruins.'],
    ['THE TIDE PATH OPENS','The water settles. A purple light flickers from Grumble Keep.']
  ];
  function startStory(kind,override){
    const beats=override||stories[kind]||[];
    S.story={kind,beats,index:0,time:0};stopMusic();
    Object.assign(input,{left:false,right:false,jump:false,down:false});
    pressed.jump=false;syncScreens();
  }
  function showGearScene(kind,heading,caption){
    if(gearScenesSeen[kind])return;
    gearScenesSeen[kind]=true;
    startStory('gear',[[heading,caption]]);
  }
  function advanceStory(){if(!S.story)return;S.story.index++;S.story.time=0;if(S.story.index>=S.story.beats.length){const kind=S.story.kind;S.story=null;if(kind==='finale')finishWin();else startMusic()}}
  function updateStory(dt){if(!S.story)return;S.story.time+=dt;if(S.story.time>=3.2)advanceStory()}
  function burst(x,y,color='#ffe16a',n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*300,vy:-80-Math.random()*260,life:.35+Math.random()*.45,color,r:3+Math.random()*5})}
  function makeBlock(a,i){return{x:a[0],y:a[1],w:52,h:48,type:a[2],used:false,broken:false,bump:0,id:i}}
  function loadLevel(index,keep=true){S.level=index;S.mode='world';level=LEVELS[index];checkpointIndex=0;checkpointX=level.start[0];S.cam=0;S.transition=2.15;S.won=false;S.midBossDone=false;S.activeMidBoss=false;S.bossMax=level.boss?.hp||level.miniBoss?.hp||9;S.bossHP=S.bossMax;Object.assign(player,{x:level.start[0],y:level.start[1],vx:0,vy:0,dir:1,ground:false,inv:1,blend:0,dash:0,dashCD:0,boneCD:0,glide:false,runners:false,speedBoost:0,stride:0});blocks=level.blocks.map(makeBlock);coins=level.coins.map((a,i)=>({x:a[0],y:a[1],w:25,h:34,taken:false,id:i}));enemies=level.enemies.map((a,i)=>({x:a[0],y:a[1],w:50,h:43,vx:i%2?75:-75,alive:true,stun:0}));bones=[];vines=[];particles=[];items=[];hazards=[];boss=level.boss?{...level.boss,w:142,h:126,vx:-78,vy:0,ground:true,flash:0,attack:1.2,windup:0,phase:0}:null;if(level.boss&&!player.finn)activateFinn(false);updateScore();msg(level.intro,2.3)}
  function reset(){S.coins=0;S.points=0;S.lives=3;S.tags=0;S.won=false;S.story=null;Object.keys(gearScenesSeen).forEach(key=>gearScenesSeen[key]=false);scorePanel?.classList.remove('show');Object.assign(player,{finn:false,bob:false,blend:0,double:true,cape:false,glide:false,runners:false,speedBoost:0});setAbilityLabels('BONE','FINN DASH',true);loadLevel(0,false)}
  function setAbilityLabels(primary,secondary,locked=false){const a=document.getElementById('gameBone'),b=document.getElementById('gameDash');if(a)a.textContent=primary;if(b)b.textContent=secondary;a?.classList.toggle('locked',locked);b?.classList.toggle('locked',locked)}
  function activateFinn(audio=true){Object.assign(player,{finn:true,bob:false,blend:0,double:true,boneCD:0,dashCD:0});setAbilityLabels('BONE','FINN DASH');burst(player.x+24,player.y+30,'#fff4a8',36);S.shake=9;if(audio)speak('FINN POWER',.68);msg('FINN POWER • DOUBLE JUMP • BONES • DASH',2.8);updateScore()}
  function activateBob(){Object.assign(player,{bob:true,finn:false,blend:0,double:true,boneCD:0,dashCD:0});setAbilityLabels('VINE','BLEND');burst(player.x+24,player.y+30,'#88e36c',40);S.shake=9;speak('BOB POWER',.64);msg('BOB POWER • VINE GRAB • FLYTRAP HAND • BLEND',3);updateScore()}
  function floors(){if(S.mode==='bonus')return[{x:0,y:438,w:960,h:102},{x:230,y:350,w:180,h:24},{x:505,y:280,w:190,h:24}];return level.ground.map(g=>({x:g[0],y:g[1],w:g[2],h:H-g[1]})).concat(level.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:26}))).concat(blocks.filter(b=>!b.broken).map(b=>({...b,y:b.y-Math.sin(b.bump*Math.PI)*9}))) }
  function enterPipe(){if(S.mode==='bonus'){S.mode='world';player.x=returnX+90;player.y=320;player.vx=120;S.cam=clamp(player.x-W*.36,0,level.world-W);msg('THE PIPE SAID “GOAT.” VERY HELPFUL.',1.6);return}if(S.level===0&&Math.abs(player.x-1270)<150){returnX=player.x;S.mode='bonus';S.cam=0;Object.assign(player,{x:85,y:340,vx:0,vy:0});bonusCoins=[[180,380],[285,305],[370,305],[535,235],[620,235],[755,350],[820,310]].map((a,i)=>({x:a[0],y:a[1],w:25,h:34,taken:false,id:i}));msg('SECRET COIN CAVE • FAR PIPE RETURNS',2)}else msg('NO PIPE HERE. THE BUTTON REMAINS OPTIMISTIC.',1.2)}
  // Only play the landing animation on an actual air-to-ground transition.
  // Previously the .16s landing timer was reset while simply walking along
  // the floor, leaving Maverick frozen in his low landing/action pose.
  function landOn(solids,prevY){
    const wasGrounded=player.ground;
    player.ground=false;
    for(const s of solids){
      if(player.x+player.w>s.x+5&&player.x<s.x+s.w-5&&player.y+player.h>=s.y&&prevY+player.h<=s.y+10&&player.vy>=0){
        const landingSpeed=player.vy;
        player.y=s.y-player.h;player.vy=0;player.ground=true;player.coyote=.11;
        if(!wasGrounded&&landingSpeed>80){
          player.land=.14;
          burst(player.x+player.w/2,player.y+player.h,'#dff7c7',5);
        }
        return;
      }
    }
  }
  function underside(prevY){if(player.vy>=0)return;for(const b of blocks){if(b.broken)continue;if(player.x+player.w>b.x+5&&player.x<b.x+b.w-5&&player.y<=b.y+b.h&&prevY>=b.y+b.h-9){player.y=b.y+b.h;player.vy=120;player.punch=.18;S.shake=5;b.bump=1;tone(250,.08);hitBlock(b);return}}}
  function hitBlock(b){if(b.type==='brick'&&(player.finn||player.bob)){b.broken=true;S.points+=150;burst(b.x+26,b.y+24,'#c87037',18);msg(player.bob?'COMPOST-ADJACENT DEMOLITION':'TERRIER-ASSISTED MASONRY',1.2)}else if(!b.used){b.used=true;if(b.type==='finn')items.push({x:b.x+7,y:b.y-42,w:38,h:38,kind:'finn',vy:-150});else if(b.type==='bob')items.push({x:b.x+7,y:b.y-42,w:38,h:38,kind:'bob',vy:-150});else if(b.type==='cape')items.push({x:b.x+7,y:b.y-42,w:38,h:38,kind:'cape',vy:-150});else if(b.type==='runners')items.push({x:b.x+7,y:b.y-42,w:38,h:38,kind:'runners',vy:-150});else if(b.type==='tag')items.push({x:b.x+9,y:b.y-40,w:34,h:34,kind:'tag',vy:-140});else{S.coins++;S.points+=100;burst(b.x+26,b.y,'#ffd33d',10)}}}
  function die(){if(player.inv>0||S.won||S.screen==='gameover')return;S.lives--;tone(90,.3);S.shake=12;if(S.lives<=0){S.lives=0;S.coins=Math.max(0,S.coins-5);S.screen='gameover';stopMusic();syncScreens()}else Object.assign(player,{x:checkpointX,y:300,vx:0,vy:0,inv:2});msg(S.lives?'MAV WAS TEMPORARILY INCONVENIENCED':'OUT OF HEARTS • GIVE IT ANOTHER GO?',1.8);updateScore()}
  function nextLevel(){if(S.level<LEVELS.length-1){S.coins+=10;S.points+=1500;burst(player.x,player.y,'#fff',35);loadLevel(S.level+1);writeRunSave()}else win()}
  function bossDefeated(){
    const defeated=boss,name=defeated.name;
    S.coins+=S.activeMidBoss?8:20;S.points+=S.activeMidBoss?1200:3000;
    burst(defeated.x+defeated.w/2,defeated.y+defeated.h/2,'#ffeaa2',54);
    if(S.activeMidBoss){
      boss=null;S.activeMidBoss=false;S.midBossDone=true;hazards=[];
      msg(`${name} BEATEN • THE EXIT PATH IS OPEN`,2.5);
      startStory('mini',[miniStories[level.worldId]]);
      return;
    }
    if(S.level===LEVELS.length-1){win();return}
    loadLevel(S.level+1);writeRunSave();msg(`${name} DEFEATED • ON TO THE NEXT WORLD`,2.2);
  }
  function throwBone(){if(player.bob)return throwVine();if(!player.finn||player.boneCD>0)return;player.boneCD=.28;bones.push({x:player.x+(player.dir>0?player.w:-24),y:player.y+26,w:25,h:12,vx:player.dir*570,life:1.7,spin:0});tone(620,.06)}
  function throwVine(){if(!player.bob||player.boneCD>0)return;player.boneCD=.48;vines.push({x:player.x+(player.dir>0?player.w:-120),y:player.y+25,w:120,h:20,vx:player.dir*460,dir:player.dir,life:.65});tone(310,.1);msg('VINE HAND: UNREASONABLY LONG',.8)}
  function doDash(){if(player.bob){if(player.dashCD>0)return;player.dashCD=1.6;player.blend=1.35;player.inv=Math.max(player.inv,1.35);player.vx=0;burst(player.x+22,player.y+50,'#80d46b',16);msg('BOB BLEND • DEFINITELY JUST A PLANT',1.35);return}if(!player.finn||player.dashCD>0)return;player.dash=.24;player.dashCD=1.0;player.vx=player.dir*650;burst(player.x+22,player.y+50,'#fff0a6',12);S.shake=4;msg('FINN DASH!',.7)}
  function update(dt){S.time+=dt;if(S.story){updateStory(dt);return}S.transition=Math.max(0,S.transition-dt);S.shake=Math.max(0,S.shake-30*dt);S.messageTime=Math.max(0,S.messageTime-dt);player.inv=Math.max(0,player.inv-dt);player.blend=Math.max(0,player.blend-dt);player.skid=Math.max(0,player.skid-dt);player.land=Math.max(0,player.land-dt);player.punch=Math.max(0,player.punch-dt);player.dash=Math.max(0,player.dash-dt);player.dashCD=Math.max(0,player.dashCD-dt);player.boneCD=Math.max(0,player.boneCD-dt);player.speedBoost=Math.max(0,player.speedBoost-dt);blocks.forEach(b=>b.bump=Math.max(0,b.bump-dt*4));
    if(S.won)return;
    if(pressed.bone){throwBone();pressed.bone=false}if(pressed.dash){doDash();pressed.dash=false}
    const boosted=player.speedBoost>0,max=boosted?480:player.finn?315:player.bob?295:285,acc=player.ground?(boosted?1750:1250):680,fric=player.ground?1050:180;
    const dir=(input.right?1:0)-(input.left?1:0);
    if(player.dash>0)player.vx=player.dir*650;else if(dir){if(player.vx&&Math.sign(player.vx)!==dir&&Math.abs(player.vx)>65)player.skid=.18;player.vx+=dir*acc*dt;player.vx=clamp(player.vx,-max,max);player.dir=dir}else{const s=Math.sign(player.vx);player.vx-=s*Math.min(Math.abs(player.vx),fric*dt)}
    if(pressed.jump){player.jumpBuffer=.12;pressed.jump=false}else player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);if(player.ground)player.coyote=.11;else player.coyote=Math.max(0,player.coyote-dt);
    if(player.jumpBuffer>0&&(player.coyote>0||(player.finn&&player.double))){if(player.coyote<=0)player.double=false;player.vy=player.finn?-710:-665;player.ground=false;player.coyote=0;player.jumpBuffer=0;player.hold=.18;player.land=0;tone(410,.08);burst(player.x+23,player.y+player.h,'#eaf6cf',5)}
    if(!input.jump&&player.vy<-235)player.vy+=1500*dt;if(input.jump&&player.hold>0&&player.vy<0){player.vy-=190*dt;player.hold-=dt}else player.hold=0;player.glide=Boolean(player.cape&&!player.ground&&input.jump&&player.vy>0);if(player.glide)player.vy=Math.min(player.vy,155);
    if(level.checkpoints&&checkpointIndex<level.checkpoints.length&&player.x>level.checkpoints[checkpointIndex]){checkpointX=level.checkpoints[checkpointIndex];checkpointIndex++;msg('CHECKPOINT! FINN SAYS YOU MAY KEEP GOING.',1.5);writeRunSave();burst(checkpointX,340,'#ffe27a',22)}
    const prevY=player.y;player.vy+=1880*dt;player.vy=Math.min(980,player.vy);player.x+=player.vx*dt;player.y+=player.vy*dt;player.x=clamp(player.x,0,(S.mode==='bonus'?960:level.world)-player.w);if(S.mode!=='bonus'&&level.miniBoss&&!S.midBossDone&&!boss&&player.x>level.miniBoss.trigger){boss={...level.miniBoss,w:142,h:126,vx:-86,vy:0,ground:true,flash:0,attack:1.1,windup:0,phase:0};S.activeMidBoss=true;S.bossHP=level.miniBoss.hp;S.bossMax=level.miniBoss.hp;hazards=[];msg(`MINI-BOSS! ${boss.name}`,2.3);S.shake=5}if(S.mode!=='bonus'&&level.miniBoss&&!S.midBossDone&&player.x>level.miniBoss.trigger+680){player.x=level.miniBoss.trigger+680;player.vx=Math.min(0,player.vx)}if(S.mode!=='bonus')underside(prevY);landOn(floors(),prevY);if(player.ground){player.double=true;if(Math.abs(player.vx)>42)player.stride+=Math.abs(player.vx)*dt/25;}if(player.y>620)die();
    (S.mode==='bonus'?bonusCoins:coins).forEach(c=>{if(!c.taken&&hit(player,c)){c.taken=true;S.coins++;S.points+=100;burst(c.x,c.y,'#ffe36a',8);tone(760,.05)}});
    items.forEach(it=>{it.vy+=700*dt;it.y+=it.vy*dt;const floorY=(it.kind==='finn'||it.kind==='bob'||it.kind==='cape'||it.kind==='runners')?350:370;if(it.y>floorY){it.y=floorY;it.vy=-Math.abs(it.vy)*.45}if(hit(player,it)){it.dead=true;if(it.kind==='finn'){activateFinn();showGearScene('finn','FINN SUIT, MADE FOR YOU','I stitched this suit so you can borrow Finn’s quick paws. A good friend should get to come along.')}else if(it.kind==='bob')activateBob();else if(it.kind==='cape'){player.cape=true;setAbilityLabels(player.bob?'VINE':'BONE',player.bob?'BLEND':player.finn?'FINN DASH':'CAPE GLIDE');burst(player.x+24,player.y+28,'#f5a94d',36);tone(880,.12);msg('CAPE FOUND • HOLD JUMP WHILE FALLING TO GLIDE',2.4);showGearScene('cape','A CAPE FROM THE WORKBENCH','I cut it from light sailcloth so the wind can carry you. Hold Jump when you start to fall.')}else if(it.kind==='runners'){player.runners=true;player.speedBoost=8;burst(player.x+24,player.y+30,'#ff4b55',28);tone(740,.1);msg('RED RUNNERS • SPEED BOOST!',1.8);showGearScene('runners','RED RUNNERS, FIELD TESTED','I added grippy soles and light canvas. Take a running start—these will carry you past trouble.')}else{S.tags++;S.points+=500;burst(it.x,it.y,'#82f3ff',18);msg('SECRET FINN TAG • EXTREMELY OFFICIAL',1.7)}}});items=items.filter(i=>!i.dead);if(S.story)return;
    if(S.mode!=='bonus')enemies.forEach(e=>{if(!e.alive)return;e.x+=e.vx*dt;if(e.x<40||e.x>level.world-70)e.vx*=-1;const foot=level.ground.some(g=>e.x+e.w/2>g[0]&&e.x+e.w/2<g[0]+g[2]);if(!foot)e.vx*=-1;if(hit(player,e)){if(player.vy>100&&player.y+player.h<e.y+26){e.alive=false;S.points+=250;player.vy=-420;burst(e.x+25,e.y+18,'#bde85e',15);msg('GRUMBLY: DE-GRUMBLED',.9)}else die()}});
    bones.forEach(b=>{b.x+=b.vx*dt;b.life-=dt;b.spin+=dt*14;enemies.forEach(e=>{if(e.alive&&hit(b,e)){e.alive=false;b.life=0;S.points+=250;burst(e.x,e.y,'#d9f79a',14)}});if(boss&&hit(b,boss)&&boss.flash<=0){b.life=0;boss.flash=.18;S.bossHP--;S.points+=500;S.shake=9;burst(boss.x,boss.y+40,'#ffdf68',20);msg(S.bossHP?`${boss.name} IS STILL GRUMPY`:'THAT CROWN IS COMING OFF',1);if(S.bossHP<=0)bossDefeated()}});bones=bones.filter(b=>b.life>0);
    vines.forEach(v=>{v.x+=v.vx*dt;v.life-=dt;enemies.forEach(e=>{if(e.alive&&hit(v,e)){e.alive=false;v.life=0;S.points+=350;S.coins++;burst(e.x,e.y,'#7ee36c',22);tone(170,.12);speak('lunch',.58);msg('FLYTRAP HAND SAYS “LUNCH”',1.1)}});if(boss&&hit(v,boss)&&boss.flash<=0){v.life=0;boss.flash=.2;S.bossHP--;S.points+=500;burst(boss.x,boss.y+40,'#76d867',22);if(S.bossHP<=0)bossDefeated()}});vines=vines.filter(v=>v.life>0);
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=720*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
    if(boss&&S.mode!=='bonus')updateBoss(dt);
    if(S.mode!=='bonus'&&!level.boss&&(!level.miniBoss||S.midBossDone)&&player.x>level.finish)nextLevel();S.cam=S.mode==='bonus'?0:clamp(player.x-W*.36,0,level.world-W);updateScore();
  }
  // Bosses warn before each shot, and fire toward Maverick from either side.
  // A readable wind-up makes a fight about timing instead of surprise damage.
  function updateBoss(dt){
    boss.flash=Math.max(0,boss.flash-dt);
    boss.attack-=dt;
    boss.x+=boss.vx*dt;
    const [left,right]=boss.bounds;
    if(boss.x<left){boss.x=left;boss.vx=Math.abs(boss.vx)}
    else if(boss.x+boss.w>right){boss.x=right-boss.w;boss.vx=-Math.abs(boss.vx)}
    if(boss.windup>0){
      boss.windup-=dt;
      if(boss.windup<=0){
        const direction=(player.x+player.w/2)<(boss.x+boss.w/2)?-1:1;
        const from=boss.x+(direction<0?6:boss.w-40);
        hazards.push({kind:boss.projectile,x:from,y:boss.y+38,w:34,h:30,
          vx:direction*(245+Math.random()*85),vy:-300-Math.random()*95,life:4.5});
        tone(210,.11);
      }
    }else if(boss.attack<=0){
      boss.windup=.42;
      boss.attack=1.12+Math.random()*.48;
    }
    hazards.forEach(h=>{
      h.x+=h.vx*dt;h.y+=h.vy*dt;h.vy+=1100*dt;
      if(h.y>408){h.y=408;h.vy=-Math.abs(h.vy)*.63}
      h.life-=dt;
      if(hit(player,h)){h.life=0;die()}
    });
    hazards=hazards.filter(h=>h.life>0);
    if(hit(player,boss)){
      if(player.vy>180&&player.y+player.h<boss.y+42){
        player.vy=-520;
        if(boss.flash<=0){
          boss.flash=.2;S.bossHP--;S.points+=500;S.shake=10;
          burst(boss.x,boss.y,'#ffda65',22);
          if(S.bossHP<=0)bossDefeated();
        }
      }else die();
    }
  }
  const scorePanel=document.getElementById('highScorePanel'),scoreList=document.getElementById('highScoreList'),scoreEntry=document.getElementById('highScoreEntry'),scoreNote=document.getElementById('highScoreNote');
  const scoreApi=window.STUDIO_LADUKE_SCORE_API||'';
  function localScores(){try{return JSON.parse(localStorage.getItem('studioLadukeMavScoresV1')||'[]')}catch(_){return[]}}
  function cleanScores(rows){return (Array.isArray(rows)?rows:[]).map(r=>({initials:String(r.initials||'???').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'???',score:Math.max(0,Number(r.score)||0),coins:Math.max(0,Number(r.coins)||0)})).sort((a,b)=>b.score-a.score).slice(0,10)}
  function renderScores(rows){const list=cleanScores(rows);scoreList.innerHTML=list.length?list.map(r=>`<li>${r.initials.padEnd(3,' ')} · ${String(r.score).padStart(6,'0')} · 🪙${r.coins}</li>`).join(''):'<li>NO SCORES. THE CABINET IS JUDGING YOU.</li>'}
  async function showHighScores(){scoreEntry.hidden=!S.won;scorePanel.classList.add('show');let rows=localScores();renderScores(rows);if(scoreApi){try{const res=await fetch(scoreApi,{headers:{Accept:'application/json'}});if(!res.ok)throw Error('score service');rows=await res.json();renderScores(rows);scoreNote.textContent='LIVE FORT CABINET • SCORES SHARED WITH EVERYONE'}catch(_){scoreNote.textContent='The shared cabinet is napping. Device scores are still safe.'}}}
  async function saveHighScore(){const field=document.getElementById('scoreInitials');const initials=field.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);if(initials.length!==3){field.focus();scoreNote.textContent='THREE INITIALS. THE CABINET IS OLD AND INFLEXIBLE.';return}const row={initials,score:S.points,coins:S.coins};const local=cleanScores([...localScores(),row]);localStorage.setItem('studioLadukeMavScoresV1',JSON.stringify(local));renderScores(local);scoreEntry.hidden=true;scoreNote.textContent=scoreApi?'SENDING SCORE TO THE FORT CABINET…':'SAVED ON THIS DEVICE • SHARED CABINET READY FOR ITS ENDPOINT';if(scoreApi){try{const res=await fetch(scoreApi,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)});if(!res.ok)throw Error('score service');scoreNote.textContent='SCORE POSTED. BRAGGING AUTHORIZED.';await showHighScores()}catch(_){scoreNote.textContent='Online post failed; the device copy is safe.'}}}
  function win(){if(S.won||S.story)return;startStory('finale')}
  function finishWin(){if(S.won)return;S.won=true;S.screen='won';S.coins+=50;S.points+=5000;writeRunSave(true);roomCelebration();burst(boss?boss.x+60:player.x+26,boss?boss.y+50:player.y+24,'#fff29c',90);setTimeout(showHighScores,1200);syncScreens();updateScore()}
  function roomCelebration(){try{window.launchConfetti?.(110);window.jingle?.()}catch(_){}}
  function updateScore(){const suit=player.finn?'FINN SUIT':player.bob?'BOB SUIT':'';const label=`SCORE ${String(S.points).padStart(6,'0')}  •  🪙 ${S.coins}  •  ❤️ ${S.lives}${suit?'  •  '+suit:''}`;if(score&&score.textContent!==label)score.textContent=label}
  function drawBg(){const img=bgs[level.theme]||bgs[0];if(img.complete&&img.naturalWidth){const offset=(S.cam*.14)%W;ctx.drawImage(img,-offset,0,W,H);ctx.drawImage(img,W-offset,0,W,H)}else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,level.theme===3?'#48216d':'#29a8f2');g.addColorStop(1,'#58bf62');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}if(level.worldId===2){if(level.theme===2){ctx.fillStyle='rgba(4,102,132,.16)';ctx.fillRect(0,0,W,H);ctx.globalAlpha=.28;for(let band=0;band<3;band++){const y=286+band*54;ctx.strokeStyle=band%2?'#8cebe0':'#53c7d0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,y+Math.sin(S.time*1.2)*4);for(let x=0;x<=W;x+=80)ctx.lineTo(x,y+Math.sin(x*.015+S.time*1.2+band)*6);ctx.stroke()}ctx.globalAlpha=1}else{ctx.fillStyle='rgba(53,22,94,.2)';ctx.fillRect(0,0,W,H);for(let i=0;i<26;i++){const x=(i*167+37)%W,y=30+(i*71)%205;ctx.fillStyle=(i%4===0)?'#fff0a4':'#ddc9ff';ctx.globalAlpha=.42+Math.sin(S.time*1.5+i)*.12;ctx.fillRect(x,y,2+(i%3),2)}ctx.globalAlpha=1}}ctx.fillStyle='rgba(10,24,36,.035)';ctx.fillRect(0,0,W,H)}
  function drawGround(g){const wx=g[0],x=wx-S.cam,y=g[1],w=g[2];if(x>W||x+w<0)return;const soil=level.theme===2?'#985b32':level.theme===3?'#563c55':'#a95d35',soilLight=level.theme===2?'#ca8750':level.theme===3?'#835b70':'#d18145',soilDark=level.theme===2?'#5a392b':level.theme===3?'#33293d':'#673c2b',grass=level.theme===3?'#a9d64e':'#56be42';ctx.fillStyle=soil;ctx.fillRect(x,y,w,H-y);ctx.fillStyle=soilDark;ctx.fillRect(x,y+17,w,H-y-17);ctx.fillStyle=soilLight;ctx.fillRect(x,y+19,w,5);
    const first=Math.floor(wx/32)*32;for(let q=first;q<wx+w;q+=32){const sx=q-S.cam,seed=(Math.floor(q/32)*17+level.theme*7)&7;if(sx>W||sx+32<0)continue;ctx.fillStyle=seed<4?soilLight:soilDark;ctx.fillRect(sx+4,y+27+(seed%3)*8,7,5);ctx.fillRect(sx+19,y+43+(seed%2)*12,5,4);ctx.fillStyle=soilDark;ctx.fillRect(sx+13,y+35,8,4);if(seed===1||seed===5){ctx.fillStyle='#efb56d';ctx.fillRect(sx+22,y+25,5,3)}}
    ctx.fillStyle=grass;ctx.fillRect(x,y,w,13);ctx.fillStyle=level.theme===3?'#d6e986':'#b3ef65';ctx.fillRect(x,y,w,4);ctx.fillStyle=level.theme===3?'#5b9d3a':'#318e3c';ctx.fillRect(x,y+13,w,4);for(let q=Math.ceil(wx/24)*24;q<wx+w;q+=24){const sx=q-S.cam;if(((Math.floor(q/24)+level.theme)%4)===0){ctx.fillStyle='#a8e65a';ctx.fillRect(sx,y-4,4,5);ctx.fillRect(sx-3,y-1,3,3);ctx.fillRect(sx+4,y,3,3)}}}
  function drawPlatform(p){const wx=p[0],x=wx-S.cam,y=p[1],w=p[2];if(x>W||x+w<0)return;const dirt=level.theme===2?'#9d6134':level.theme===3?'#684c62':'#ad6638';ctx.fillStyle='#1c5337';ctx.fillRect(x+2,y+9,w-4,32);ctx.fillStyle=dirt;ctx.fillRect(x+3,y+12,w-6,26);ctx.fillStyle=level.theme===2?'#d58b48':'#d18a4c';for(let q=wx+8;q<wx+w-8;q+=32){const sx=q-S.cam;ctx.fillRect(sx,y+17,12,4);ctx.fillRect(sx+12,y+21,5,4);ctx.fillRect(sx+4,y+29,5,5)}ctx.fillStyle='#3d9b42';ctx.fillRect(x,y+3,w,13);ctx.fillStyle='#a3e65c';ctx.fillRect(x,y,w,5);ctx.fillStyle='#246e39';ctx.fillRect(x,y+14,w,4);for(let q=wx+12;q<wx+w-4;q+=28){const sx=q-S.cam;ctx.fillStyle=(Math.floor(q/28)%2)?'#72d84c':'#d8f27a';ctx.fillRect(sx,y-2,5,5)}}
  function drawPipe(x,y=358){x-=S.cam;ctx.fillStyle='#17613b';ctx.fillRect(x+5,y+5,62,75);ctx.fillStyle='#239d45';ctx.fillRect(x+11,y+7,50,72);ctx.fillStyle='#4de16b';ctx.fillRect(x+17,y+12,10,62);ctx.fillStyle='#18723e';ctx.fillRect(x+39,y+14,14,64);ctx.fillStyle='#123d34';ctx.fillRect(x+9,y+4,54,7);ctx.fillStyle='#62ef7a';ctx.fillRect(x-8,y,88,9);ctx.fillRect(x-8,y,88,5);ctx.fillStyle='#17613b';ctx.fillRect(x-8,y+8,88,17);ctx.fillStyle='#37bc56';ctx.fillRect(x-3,y+10,78,8)}
  function drawBlock(b){if(b.broken)return;const x=Math.round(b.x-S.cam),y=Math.round(b.y-Math.sin(b.bump*Math.PI)*9);if(x<-60||x>W+60)return;const used=b.used, finn=b.type==='finn'&&!used,bob=b.type==='bob'&&!used,special=finn||bob;const face=used?'#8a8070':bob?'#72c953':finn?'#f4cf46':b.type==='brick'?'#bd7543':'#f5a92f';ctx.fillStyle='#603c2c';ctx.fillRect(x,y,52,48);ctx.fillStyle=face;ctx.fillRect(x+3,y+3,46,42);ctx.fillStyle=used?'#b9aa91':bob?'#c7ee75':finn?'#fff2a0':'#ffd87a';ctx.fillRect(x+5,y+5,40,5);ctx.fillRect(x+5,y+5,5,34);ctx.fillStyle=used?'#514b48':'#a04f2c';ctx.fillRect(x+4,y+42,44,4);ctx.fillRect(x+44,y+7,4,35);if(b.type==='brick'){ctx.fillStyle='#8e4d32';ctx.fillRect(x+24,y+5,4,15);ctx.fillRect(x+4,y+21,20,4);ctx.fillRect(x+32,y+21,16,4);ctx.fillRect(x+21,y+25,4,18)}else if(!used){text(bob?'♣':finn?'F':b.type==='tag'?'★':'?',x+26,y+34,27,bob?'#155335':finn?'#a24336':b.type==='tag'?'#276386':'#fff5ca','center')}if(special){ctx.fillStyle='#fff8dc';ctx.fillRect(x+9,y+10,5,3);ctx.fillRect(x+38,y+10,5,3)}}
  function drawCoin(c){if(c.taken)return;const x=Math.round(c.x-S.cam),y=Math.round(c.y+Math.sin(S.time*5+c.x)*3),width=Math.max(3,Math.round(10*Math.abs(Math.sin(S.time*5+c.x))));ctx.fillStyle='#95600d';ctx.fillRect(x-width-3,y-15,width*2+6,30);ctx.fillStyle='#f6ac22';ctx.fillRect(x-width,y-13,width*2,26);ctx.fillStyle='#ffe65e';ctx.fillRect(x-width+2,y-10,Math.max(2,width-2),20);ctx.fillStyle='#fff5bc';ctx.fillRect(x-width+2,y-8,Math.max(2,width-3),5);ctx.fillStyle='#d88919';ctx.fillRect(x+Math.max(1,width-3),y-8,Math.max(1,width-3),17)}
  function drawEnemy(e){if(!e.alive)return;const x=Math.round(e.x-S.cam),b=Math.round(Math.sin(S.time*8+e.x)*2),blink=Math.floor(S.time*1.6+e.x)%7===0;ctx.fillStyle='#29432e';ctx.fillRect(x+5,e.y+17+b,40,24);ctx.fillRect(x+11,e.y+8+b,28,32);ctx.fillStyle='#76b84c';ctx.fillRect(x+9,e.y+15+b,34,25);ctx.fillRect(x+15,e.y+7+b,22,13);ctx.fillStyle='#b1df66';ctx.fillRect(x+13,e.y+8+b,14,7);ctx.fillStyle='#fff8df';ctx.fillRect(x+15,e.y+17+b,7,9);ctx.fillRect(x+31,e.y+17+b,7,9);if(!blink){ctx.fillStyle='#263545';ctx.fillRect(x+18,e.y+20+b,3,5);ctx.fillRect(x+33,e.y+20+b,3,5)}else{ctx.fillStyle='#263545';ctx.fillRect(x+15,e.y+21+b,8,2);ctx.fillRect(x+31,e.y+21+b,8,2)}ctx.fillStyle='#435134';ctx.fillRect(x+12,e.y+37+b,9,6);ctx.fillRect(x+31,e.y+37+b,9,6);ctx.fillStyle='#f1d094';ctx.fillRect(x+22,e.y+31+b,8,3)}
  function drawPixelSprite(kind,x,y,dir,air=false){
    const rows=PIXEL_SPRITES[kind],step=4,run=Math.min(1,Math.abs(player.vx)/235),bounce=player.ground?Math.abs(Math.sin(S.time*(12+run*10)))*3*run:0;
    const squash=player.land>0?1.1:1,stretch=!player.ground?.94:1;
    ctx.save();ctx.translate(x+player.w/2,y+player.h-bounce);ctx.scale(dir*step,step);ctx.scale(1,squash/stretch);ctx.imageSmoothingEnabled=false;
    for(let row=0;row<rows.length;row++){
      const line=rows[row].padEnd(16,'.').slice(0,16);let col=0;
      while(col<16){const pixel=line[col],start=col;while(col<16&&line[col]===pixel)col++;if(pixel==='.')continue;ctx.fillStyle=PIXEL_PALETTE[pixel]||'#fff';const swing=player.ground&&run>.15&&row>=15?Math.sin(S.time*18+(row>17?Math.PI:0))*.65:0;ctx.fillRect(start-8+swing,row-20,col-start,1);}
    }
    if(player.skid){ctx.fillStyle='#fff2ba';ctx.fillRect(-14,15,3,1);ctx.fillRect(-17,17,4,1);ctx.fillRect(-13,19,3,1)}
    if(air&&player.finn){ctx.fillStyle='#fff5d0';ctx.fillRect(-7,-21,2,1);ctx.fillRect(4,-22,2,1)}
    if(player.dash>0){ctx.globalAlpha=.5;ctx.fillStyle=kind==='finn'?'#fff3a9':'#bfe4ff';ctx.fillRect(-11,4,3,8);ctx.fillRect(-13,12,4,5);ctx.globalAlpha=1}
    ctx.restore();ctx.imageSmoothingEnabled=true;
  }
  // A sprite cell contains transparent padding below the boots. Inspect it
  // once when the image loads and align the visible shoe sole to the collider.
  // Keep original proportions/art and do not alter the physics hitbox.
  function spriteFootOffset(sheet,frame){
    if(!sheet.footOffsets){
      sheet.footOffsets=Array(8).fill(0);
      if(typeof document.createElement==='function'){
        try{
          const probe=document.createElement('canvas');
          probe.width=sheet.image.naturalWidth;probe.height=sheet.image.naturalHeight;
          const pctx=probe.getContext('2d',{willReadFrequently:true});
          if(pctx){
            pctx.drawImage(sheet.image,0,0);
            const pixels=pctx.getImageData(0,0,probe.width,probe.height).data;
            const sheetW=probe.width,sheetH=probe.height;
            for(let f=0;f<8;f++){
              const col=f%4,row=Math.floor(f/4);
              const left=Math.round(col*sheet.w),right=Math.min(sheetW,Math.round((col+1)*sheet.w));
              const top=Math.round(row*sheet.h),bottom=Math.min(sheetH,Math.round((row+1)*sheet.h));
              const inset=Math.floor((right-left)*.08);
              let sole=-1;
              outer:for(let y=bottom-1;y>=top;y--){
                for(let x=left+inset;x<right-inset;x+=2){
                  if(pixels[(y*sheetW+x)*4+3]>=160){sole=y;break outer;}
                }
              }
              if(sole>=top){
                const transparentFootPad=(bottom-1-sole)*sheet.drawH/sheet.h;
                sheet.footOffsets[f]=clamp(transparentFootPad,0,24);
              }
            }
          }
        }catch(_){/* Canvas unavailable: retain old alignment. */}
      }
    }
    return sheet.footOffsets[frame]||0;
  }
  function activeSpriteFrame(){
    return !player.ground?(player.vy<-280?4:player.vy<70?5:6)
      :player.land>0?7:Math.abs(player.vx)<45?0:1+(Math.floor(player.stride)%3);
  }
  // Gear is sewn onto the same Mav sprite and respects its foot anchor.
  // Keeping the hair, face, body, gait, and collision box identical makes
  // pickups read as costumes instead of an unrelated character suddenly
  // replacing Maverick.
  function drawCostume(kind,layer,footOffset=0){
    if(kind==='mav')return;
    const x=Math.round(player.x-S.cam+player.w/2),y=Math.round(player.y+player.h);
    const swing=Math.sin(player.stride*Math.PI*.7)*2;
    ctx.save();ctx.translate(x,y+footOffset);ctx.scale(player.dir,1);
    ctx.lineJoin='round';ctx.lineCap='round';
    if(kind==='finn'){
      if(layer==='under'){
        // Finn's floppy ears sit behind Maverick's unmistakable blond head.
        ctx.strokeStyle='#3c2b2c';ctx.lineWidth=3;
        ctx.fillStyle='#ae683b';
        ctx.beginPath();ctx.ellipse(-29,-91,13,24,-.22,0,TAU);ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.ellipse(25,-101,13,21,.3,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle='#e9b277';ctx.beginPath();ctx.ellipse(-30,-94,6,14,-.16,0,TAU);ctx.fill();
        // Wagging tail, visible on runs and jumps, always behind his body.
        ctx.strokeStyle='#42302b';ctx.lineWidth=11;
        ctx.beginPath();ctx.moveTo(-28,-44);ctx.quadraticCurveTo(-52,-50+swing,-47,-65+swing);ctx.stroke();
        ctx.strokeStyle='#f2d19a';ctx.lineWidth=6;
        ctx.beginPath();ctx.moveTo(-30,-44);ctx.quadraticCurveTo(-47,-50+swing,-45,-62+swing);ctx.stroke();
      }else{
        // Small dog-hood band, paw badge and mitts on the same Mav.
        ctx.strokeStyle='#45332c';ctx.lineWidth=3;ctx.fillStyle='#f1d2a4';
        ctx.beginPath();ctx.roundRect(-21,-104,37,8,4);ctx.fill();ctx.stroke();
        ctx.fillStyle='#b97847';ctx.beginPath();ctx.ellipse(-4,-106,13,3,0,0,TAU);ctx.fill();
        ctx.strokeStyle='#54352d';ctx.lineWidth=2;ctx.fillStyle='#ffe0ab';
        ctx.beginPath();ctx.roundRect(-3,-57,18,13,4);ctx.fill();ctx.stroke();
        ctx.fillStyle='#aa6440';ctx.beginPath();ctx.ellipse(5,-50,5,4,0,0,TAU);ctx.fill();
        ctx.fillStyle='#fff3d1';ctx.fillRect(1,-53,2,2);ctx.fillRect(5,-55,2,2);ctx.fillRect(9,-53,2,2);
      }
    }else if(kind==='bob'){
      if(layer==='under'){
        // Bob's greenhouse power is a leafy costume, not a grown man.
        ctx.strokeStyle='#234537';ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(-22,-72);ctx.quadraticCurveTo(-48,-57+swing,-40,-28+swing);ctx.stroke();
        ctx.fillStyle='#76bc56';ctx.strokeStyle='#274f37';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(-37,-42+swing,15,25,-.45,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle='#b8e575';ctx.beginPath();ctx.ellipse(-38,-47+swing,5,15,-.45,0,TAU);ctx.fill();
      }else{
        // Rounded sprout hood, chlorophyll badge and bright work gloves.
        ctx.fillStyle='#2f643d';ctx.strokeStyle='#1b4036';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(-13,-110,7,12,-.6,0,TAU);ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.ellipse(2,-113,8,13,.46,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle='#aadf67';ctx.beginPath();ctx.ellipse(-13,-110,3,7,-.6,0,TAU);ctx.fill();
        ctx.fillStyle='#85c859';ctx.beginPath();ctx.ellipse(2,-113,4,8,.46,0,TAU);ctx.fill();
        ctx.fillStyle='#2f6e48';ctx.strokeStyle='#c3ee88';ctx.lineWidth=2;
        ctx.beginPath();ctx.roundRect(-1,-61,18,18,5);ctx.fill();ctx.stroke();
        ctx.fillStyle='#e6f7a7';ctx.beginPath();ctx.ellipse(8,-53,4,7,0,0,TAU);ctx.fill();
        ctx.fillStyle='#d0ed91';ctx.fillRect(7,-51,3,8);
      }
    }
    ctx.restore();
  }
  function drawSheetCharacter(kind){
    // Mav, Finn Suit, and Bob Suit share the identical animator and anchor.
    const sheet=spriteSheets.mav,img=sheet.image;
    if(!img.src)img.src=sheet.src;
    if(!img.complete||!img.naturalWidth)return false;
    const frame=activeSpriteFrame();
    const sx=(frame%4)*sheet.w,sy=Math.floor(frame/4)*sheet.h;
    const cx=player.x-S.cam+player.w/2,base=player.y+player.h;
    const plantedFoot=player.ground?spriteFootOffset(sheet,frame):0;
    if(kind!=='mav')drawCostume(kind,'under',plantedFoot);
    ctx.save();ctx.translate(Math.round(cx),Math.round(base));ctx.scale(player.dir,1);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(img,sx,sy,sheet.w,sheet.h,-sheet.drawW/2,-sheet.drawH+plantedFoot,sheet.drawW,sheet.drawH);
    ctx.restore();ctx.imageSmoothingEnabled=true;
    if(kind!=='mav')drawCostume(kind,'over',plantedFoot);
    return true;
  }
  function drawHuman(){if(!drawSheetCharacter('mav'))drawPixelSprite('mav',player.x-S.cam,player.y,player.dir,!player.ground)}
  // Even when an image has not finished loading, the controllable hero is
  // still Maverick; companion cutscene portraits use their own designs.
  function drawFinn(){if(!drawSheetCharacter('finn'))drawPixelSprite('mav',player.x-S.cam,player.y,player.dir,!player.ground)}
  function drawBob(){if(!drawSheetCharacter('bob'))drawPixelSprite('mav',player.x-S.cam,player.y,player.dir,!player.ground)}
  function drawCape(){const x=Math.round(player.x-S.cam),y=Math.round(player.y);ctx.save();ctx.translate(x+player.w/2,y+32);ctx.scale(player.dir,1);ctx.fillStyle='#633d43';ctx.fillRect(-24,-21,11,39);ctx.fillRect(-19,11,25,13);ctx.fillStyle='#c94f52';ctx.fillRect(-17,-18,9,27);ctx.fillRect(-12,9,22,12);ctx.fillStyle='#f2ae54';ctx.fillRect(-12,-18,4,24);ctx.fillRect(-8,11,14,5);ctx.restore()}
  function drawPlayer(){const cx=player.x-S.cam+player.w/2;ctx.fillStyle='rgba(18,35,38,.24)';ctx.fillRect(Math.round(cx-23),player.y+player.h-2,46,5);if(player.cape)drawCape();player.bob?drawBob():player.finn?drawFinn():drawHuman();if(player.speedBoost>0){ctx.fillStyle='#dc3447';ctx.fillRect(Math.round(player.x+4-S.cam),player.y+58,17,7);ctx.fillRect(Math.round(player.x+30-S.cam),player.y+58,17,7);ctx.fillStyle='#ffe27a';ctx.fillRect(Math.round(player.x+7-S.cam),player.y+60,8,2);ctx.fillRect(Math.round(player.x+33-S.cam),player.y+60,8,2)}}
  function drawBone(b){const x=b.x-S.cam;ctx.save();ctx.translate(x+12,b.y+6);ctx.rotate(b.spin);ctx.fillStyle='#fff7d6';ctx.strokeStyle='#5c4833';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-10,-4,20,8,4);ctx.fill();ctx.stroke();ellipse(-10,-4,5,5,'#fff7d6','#5c4833',2);ellipse(10,4,5,5,'#fff7d6','#5c4833',2);ctx.restore()}
  function drawVine(v){const x=v.x-S.cam;ctx.strokeStyle='#3c8f43';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,v.y+10);ctx.quadraticCurveTo(x+v.w/2,v.y-5+Math.sin(S.time*18)*6,x+v.w,v.y+10);ctx.stroke();ellipse(x+(v.dir>0?v.w:0),v.y+10,12,8,'#b93e4f','#352b32',3)}
  function drawItem(i){const x=i.x-S.cam,b=Math.sin(S.time*7+i.x)*4;if(i.kind==='finn'){ellipse(x+19,i.y+19+b,18,18,'#fff0cb','#4d3427',3);ellipse(x+8,i.y+8+b,7,12,'#b96b36','#4d3427',2);ellipse(x+30,i.y+8+b,7,12,'#b96b36','#4d3427',2);text('F',x+19,i.y+27+b,18,'#d04b35','center')}else if(i.kind==='bob'){ellipse(x+19,i.y+19+b,18,18,'#7dcc57','#274f2d',3);text('B',x+19,i.y+27+b,18,'#fff5c9','center')}else if(i.kind==='cape'){ctx.fillStyle='#6a3c46';ctx.fillRect(x+5,i.y+8+b,28,24);ctx.fillStyle='#d94f54';ctx.fillRect(x+8,i.y+5+b,22,23);ctx.fillStyle='#f5b650';ctx.fillRect(x+13,i.y+5+b,4,17);ctx.fillRect(x+9,i.y+26+b,22,4);text('✦',x+19,i.y+19+b,13,'#fff4be','center')}else if(i.kind==='runners'){ctx.fillStyle='#7b2637';ctx.fillRect(x+5,i.y+18+b,25,14);ctx.fillStyle='#ee3c4c';ctx.fillRect(x+7,i.y+13+b,23,14);ctx.fillStyle='#ffd967';ctx.fillRect(x+12,i.y+15+b,4,3);ctx.fillRect(x+9,i.y+25+b,24,5);ctx.fillStyle='#fff0bd';ctx.fillRect(x+10,i.y+27+b,17,2)}else{text('🐾',x+17,i.y+25+b,25,'#79efff','center')}}
  function drawBoss(){if(!boss)return;const x=Math.round(boss.x-S.cam),y=Math.round(boss.y+Math.sin(S.time*4)*2),o='#332737';if(boss.flash>0&&Math.floor(S.time*25)%2)return;const box=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h)};
    box(16,112,112,12,'rgba(24,34,29,.35)');
    if(boss.kind==='boar'){
      box(22,54,98,60,o);box(14,68,114,38,'#8a5234');box(22,60,98,49,'#bd7944');box(29,50,24,30,o);box(33,48,14,20,'#cf8960');box(91,50,24,30,o);box(95,48,14,20,'#cf8960');box(36,66,18,19,'#fff3d3');box(92,66,18,19,'#fff3d3');box(42,72,7,11,'#29303b');box(98,72,7,11,'#29303b');box(46,89,60,24,'#55332c');box(53,94,46,13,'#edb05b');box(52,100,7,10,'#f8edd1');box(94,100,7,10,'#f8edd1');box(4,76,22,8,'#f0e0b9');box(8,70,15,7,'#fff2ca');box(116,76,22,8,'#f0e0b9');box(115,70,15,7,'#fff2ca');box(39,108,20,17,'#70402e');box(83,108,20,17,'#70402e');box(30,34,21,17,o);box(40,29,14,15,'#6fa34e');box(75,25,14,18,o);box(75,20,10,15,'#6fa34e');
    }else if(boss.kind==='ram'){
      box(20,55,104,59,o);box(11,72,121,33,'#264d7b');box(25,60,94,50,'#397bad');box(27,78,24,32,'#e5f0e6');box(89,78,24,32,'#e5f0e6');box(34,82,12,17,'#d99f46');box(95,82,12,17,'#d99f46');box(36,86,5,8,'#223044');box(97,86,5,8,'#223044');box(52,91,54,9,'#203d64');box(61,92,7,4,'#fff');box(76,92,7,4,'#fff');box(33,53,16,13,o);box(19,43,16,13,'#f0d68c');box(11,34,12,12,'#e5bf68');box(104,53,16,13,o);box(118,43,16,13,'#f0d68c');box(130,34,12,12,'#e5bf68');box(35,107,22,18,'#294f7b');box(83,107,22,18,'#294f7b');box(53,18,12,20,'#bfe9f4');box(70,7,13,28,'#85d8ec');box(91,17,8,20,'#bfe9f4');
    }else{
      box(24,54,96,62,o);box(14,80,116,34,'#513c6f');box(27,65,90,49,'#7753a0');box(36,73,25,27,'#ffe6a4');box(83,73,25,27,'#ffe6a4');box(41,80,9,13,'#332741');box(91,80,9,13,'#332741');box(42,82,3,5,'#fff');box(92,82,3,5,'#fff');box(52,101,40,8,'#362842');box(58,102,7,7,'#f5f0d9');box(78,102,7,7,'#f5f0d9');box(31,107,20,18,'#4a355f');box(91,107,20,18,'#4a355f');box(17,48,22,15,o);box(22,35,15,15,'#9b6dbb');box(105,48,22,15,o);box(101,35,15,15,'#9b6dbb');box(27,30,24,13,o);box(37,22,17,12,'#f1bf4b');box(54,15,18,19,o);box(59,8,9,14,'#ffd95b');box(72,15,18,19,o);box(78,8,9,14,'#ffd95b');box(88,30,24,13,o);box(42,42,60,10,'#f3cd57');box(62,31,22,13,'#fff1a3');
    }
    if(boss.windup>0){
      ctx.save();ctx.globalAlpha=.6+.25*Math.sin(S.time*24);
      ctx.strokeStyle='#ffe478';ctx.lineWidth=5;
      ctx.strokeRect(x+7,y+4,128,115);
      ctx.restore();text('!',x+71,y+37,30,'#ffe478','center');
    }
  }
  function drawHazard(h){const x=Math.round(h.x-S.cam),y=Math.round(h.y);if(h.kind==='seed'){ctx.fillStyle='#514130';ctx.fillRect(x+5,y+4,25,23);ctx.fillStyle='#9ec35c';ctx.fillRect(x+8,y+2,19,19);ctx.fillStyle='#e2c36e';ctx.fillRect(x+14,y+7,7,9);ctx.fillStyle='#faf0c8';ctx.fillRect(x+12,y+4,3,3)}else if(h.kind==='rain'){ctx.fillStyle='#d9f5ff';ctx.fillRect(x+9,y+3,14,15);ctx.fillStyle='#69c8e9';ctx.fillRect(x+6,y+11,20,9);ctx.fillRect(x+9,y+18,14,7)}else{ctx.fillStyle='#392d45';ctx.fillRect(x+5,y+5,25,20);ctx.fillStyle='#c75e4d';ctx.fillRect(x+9,y+4,18,14);ctx.fillStyle='#f0cd68';ctx.fillRect(x+12,y+10,4,3);ctx.fillRect(x+21,y+10,4,3)}ctx.fillStyle='#fff7cc';ctx.fillRect(x+12,y+9,3,4);ctx.fillRect(x+22,y+9,3,4)}
  function drawParticles(){particles.forEach(p=>{ctx.globalAlpha=clamp(p.life*2,0,1);ellipse(p.x-S.cam,p.y,p.r,p.r,p.color)});ctx.globalAlpha=1}
  function drawCheckpointMarkers(){if(!level.checkpoints)return;for(let i=0;i<level.checkpoints.length;i++){const x=level.checkpoints[i]-S.cam;if(x<-20||x>W+20)continue;ctx.fillStyle='#624b38';ctx.fillRect(x,350,5,88);ctx.fillStyle=i<checkpointIndex?'#ffe27a':'#d9e9ef';ctx.beginPath();ctx.moveTo(x+5,352);ctx.lineTo(x+52,365);ctx.lineTo(x+5,380);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x+8,359,8,4)}}
  function drawFinish(){if(level.boss)return;const x=level.finish-S.cam;ctx.fillStyle='#5a402d';ctx.fillRect(x-5,190,11,248);ctx.fillStyle='#f6e1aa';ctx.fillRect(x-2,190,5,248);ctx.fillStyle='#ed594a';ctx.fillRect(x+3,198,61,37);ctx.fillStyle='#ffcf59';ctx.fillRect(x+3,198,6,37);text('M',x+35,225,22,'#fff','center');ctx.fillStyle='#c9924f';ctx.fillRect(x-14,426,29,12)}
  function drawHud(){rr(14,12,370,52,16,'rgba(5,24,38,.82)','rgba(255,255,255,.2)',2);if(S.mode==='bonus')text('SECRET COIN CAVE',29,44,17,'#fff');else{text(`WORLD ${level.worldId+1}  •  CHAPTER ${level.chapter}/2`,29,31,13,'#8fe9ff');text(level.name,29,52,17,'#fff')}rr(W-276,12,262,48,16,'rgba(5,24,38,.82)','rgba(255,255,255,.2)',2);text(`🪙 ${S.coins}   ❤️ ${S.lives}   🐾 ${S.tags}/3`,W-28,43,18,'#ffe175','right');if(boss&&S.mode!=='bonus'){rr(255,70,450,30,12,'rgba(20,12,31,.88)','#fff0c0',3);ctx.fillStyle='#e85161';ctx.fillRect(267,81,426*(S.bossHP/S.bossMax),8);text(`${S.activeMidBoss?'MINI-BOSS':'BOSS'} • ${boss.name}`,W/2,94,14,'#fff','center')}}
  function drawOverlay(){if(S.messageTime>0){const a=Math.min(1,S.messageTime*3);ctx.globalAlpha=a;rr(170,468,620,48,14,'rgba(3,17,28,.88)','rgba(255,255,255,.25)',2);text(S.message,W/2,500,19,'#fff','center');ctx.globalAlpha=1}if(S.transition>0){ctx.fillStyle=`rgba(4,15,25,${Math.min(.82,S.transition*.5)})`;ctx.fillRect(0,0,W,H);text(`WORLD ${level.worldId+1}  •  CHAPTER ${level.chapter}/2`,W/2,220,22,'#7fe6ff','center');text(level.name,W/2,273,46,'#ffe173','center');text(level.boss?`WORLD BOSS: ${level.boss.name}`:level.miniBoss?`MINI-BOSS AHEAD • ${level.worldLook}`:'RUN • JUMP • EXPLORE',W/2,314,17,'#fff','center')}if(S.won){ctx.fillStyle='rgba(4,12,24,.76)';ctx.fillRect(0,0,W,H);text('FORT MAVERICK SAVED!',W/2,210,48,'#ffe26e','center');text('MAV IS NOW LEGALLY ALLOWED TO BRAG.',W/2,260,25,'#fff','center');text('FINN DEMANDS A PARADE.',W/2,301,28,'#8ff4ff','center');text(`3 WORLDS • 3 MINI-BOSSES • 3 WORLD BOSSES • ${S.coins} COINS`,W/2,355,18,'#fff','center');text('RESTART WHEN THE CROWD STOPS CHEERING',W/2,401,15,'#d9ecf7','center')}}
  function drawStoryParty(){
    // Cutscenes show the *three separate friends*: Maverick, Finn the dog,
    // and Bob the greenhouse creature. Power-up suits are Maverick wearing
    // their gifts, not additional copies of Maverick in the story.
    const saved={...player},cam=S.cam;
    try{
      player.w=52;player.h=68;player.vx=0;player.ground=true;
      player.land=0;player.dash=0;player.skid=0;player.dir=1;S.cam=0;
      for(const [kind,x] of [['mav',286],['finn',454],['bob',622]]){
        player.x=x;player.y=248;player.finn=false;player.bob=false;
        drawPixelSprite(kind,x,248,1,false);
      }
    }finally{Object.assign(player,saved);S.cam=cam}
  }
  function drawStoryScreen(){if(!S.story)return;const [heading,caption]=S.story.beats[S.story.index]||['THE ADVENTURE CONTINUES','The trail is waiting.'];ctx.fillStyle='rgba(8,26,38,.24)';ctx.fillRect(0,0,W,H);drawStoryParty();ctx.fillStyle='rgba(5,19,31,.9)';ctx.fillRect(34,370,892,136);ctx.fillStyle='#f0bd58';ctx.fillRect(34,370,892,6);ctx.fillStyle='#f0bd58';ctx.fillRect(34,500,892,6);ctx.fillStyle='#fff3ce';ctx.fillRect(34,376,6,124);ctx.fillRect(920,376,6,124);text(S.story.kind==='intro'?'A MAVERICK’S WORLD STORY':S.story.kind==='finale'?'THE LAST PAGE':S.story.kind==='gear'?'DAD’S WORKBENCH':'BETWEEN WORLDS',60,405,14,'#82e6fb');text(heading,60,440,24,'#ffe174');text(caption,60,471,18,'#fff');const remaining=Math.max(0,1-S.story.time/3.2);ctx.fillStyle='#ffe174';ctx.fillRect(60,485,820*remaining,4);text('TAP OR PRESS ENTER TO CONTINUE',W-58,496,12,'#dcecf2','right')}
  function drawBonus(){const cave=ctx.createLinearGradient(0,0,0,H);cave.addColorStop(0,'#205d78');cave.addColorStop(.55,'#10394e');cave.addColorStop(1,'#061722');ctx.fillStyle=cave;ctx.fillRect(0,0,W,H);for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#2d7182':'#245d72';ctx.beginPath();ctx.moveTo(i*75,0);ctx.lineTo(i*75+35,90+(i%3)*22);ctx.lineTo(i*75+75,0);ctx.fill()}for(let i=0;i<35;i++)ellipse((i*137)%W,70+(i*83)%330,2+i%3,2+i%3,i%3?'#76dbe9':'#eaffff');drawGround([0,438,960]);drawPlatform([230,350,180]);drawPlatform([505,280,190]);const old=S.cam;S.cam=0;drawPipe(14);drawPipe(874);bonusCoins.forEach(drawCoin);bones.forEach(drawBone);vines.forEach(drawVine);if(!(player.inv>0&&Math.floor(S.time*12)%2))drawPlayer();drawParticles();S.cam=old;text('PRESS PIPE AT THE FAR END TO RETURN',W/2,110,17,'#e9fbff','center')}
  function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);if(S.mode==='bonus'){drawBonus()}else{drawBg();ctx.save();if(S.shake)ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);level.ground.forEach(drawGround);level.plats.forEach(drawPlatform);drawCheckpointMarkers();if(S.level===0)drawPipe(1270);blocks.forEach(drawBlock);coins.forEach(drawCoin);enemies.forEach(drawEnemy);items.forEach(drawItem);bones.forEach(drawBone);vines.forEach(drawVine);hazards.forEach(drawHazard);drawFinish();drawBoss();if(!(player.inv>0&&Math.floor(S.time*12)%2))drawPlayer();drawParticles();ctx.restore()}if(S.story)drawStoryScreen();else{drawHud();drawOverlay()}syncScreens()}
  function syncScreens(){modal.classList.toggle('mav-title-open',S.screen==='title');modal.classList.toggle('mav-paused',S.screen==='paused');modal.classList.toggle('mav-won',S.screen==='won');modal.classList.toggle('mav-game-over',S.screen==='gameover');modal.classList.toggle('mav-library-open',S.screen==='library');modal.classList.toggle('mav-library-detail-open',S.screen==='library-heimr'||S.screen==='library-prism');if(titleScreen)titleScreen.hidden=S.screen!=='title';if(pauseScreen)pauseScreen.hidden=S.screen!=='paused';if(winScreen)winScreen.hidden=S.screen!=='won';if(gameOverScreen)gameOverScreen.hidden=S.screen!=='gameover';if(libraryScreen)libraryScreen.hidden=S.screen!=='library';if(heimrScreen)heimrScreen.hidden=S.screen!=='library-heimr';if(prismScreen)prismScreen.hidden=S.screen!=='library-prism'}
  function frame(t){if(!running)return;const dt=Math.min(.033,(t-last)/1000||.016);last=t;if(S.screen==='playing')update(dt);else S.time+=dt;draw();raf=requestAnimationFrame(frame)}
  function start(){if(running)return;running=true;last=performance.now();raf=requestAnimationFrame(frame)}
  function stop(){if(S.screen==='playing')S.screen='paused';stopMusic();syncScreens();running=false;cancelAnimationFrame(raf);Object.assign(input,{left:false,right:false,jump:false,down:false});if(document.fullscreenElement===modal)document.exitFullscreen?.().catch(()=>{})}
  function beginAdventure(){if(S.screen==='title'){const saved=readRunSave();if(saved&&!saved.completed)restoreRunSave(saved);else reset();S.screen='playing';S.story=null}else if(S.screen==='paused')S.screen='playing';else if(S.screen==='won'){reset();S.screen='playing'}syncScreens();start();if(!S.story)startMusic();writeRunSave();refreshSaveSlots();tone(523,.09);document.getElementById('mavStartButton')?.blur()}
  function watchIntro(){if(S.screen!=='title')return;const saved=readRunSave();if(saved&&!saved.completed)restoreRunSave(saved);else reset();S.screen='playing';startStory('intro');syncScreens();start();tone(523,.09);document.getElementById('mavStoryButton')?.blur()}
  function togglePause(){if(S.screen==='playing'){S.screen='paused';stopMusic()}else if(S.screen==='paused'){S.screen='playing';startMusic()}syncScreens()}
  function restartAdventure(){reset();S.screen='playing';syncScreens();start();startMusic();writeRunSave();refreshSaveSlots()}
  // The Fort modal already covers the viewport. Forcing element fullscreen while
  // Safari rotates can detach or blank its Canvas 2D surface in in-app browsers.
  function open(){window.openModal?.('gameModal');if(S.screen==='closed')S.screen='paused';start();draw()}
  function refreshVisibleCanvas(){
    if(!modal.classList.contains('show'))return;
    if(!running)start();
    draw();
  }
  addEventListener('pageshow',refreshVisibleCanvas);
  addEventListener('resize',refreshVisibleCanvas);
  addEventListener('orientationchange',()=>setTimeout(refreshVisibleCanvas,180));
  function openLibrary(detail=''){window.openModal?.('gameModal');if(S.screen==='playing')stopMusic();S.screen=detail||'library';syncScreens();start();draw()}
  function launchCartridge(){window.openModal?.('gameModal');reset();S.screen='title';syncScreens();start();draw()}
  document.getElementById('gameBtn')?.addEventListener('click',open);document.getElementById('consoleBtn')?.addEventListener('click',()=>openLibrary());document.getElementById('mavCartridge')?.addEventListener('click',launchCartridge);document.getElementById('heimrCartridge')?.addEventListener('click',()=>openLibrary('library-heimr'));document.getElementById('prismCartridge')?.addEventListener('click',()=>openLibrary('library-prism'));document.getElementById('mavLibraryPlayButton')?.addEventListener('click',launchCartridge);document.getElementById('mavLibraryHeimrButton')?.addEventListener('click',()=>openLibrary('library-heimr'));document.getElementById('mavLibraryPrismButton')?.addEventListener('click',()=>openLibrary('library-prism'));document.getElementById('mavHeimrBackButton')?.addEventListener('click',()=>openLibrary());document.getElementById('mavPrismBackButton')?.addEventListener('click',()=>openLibrary());document.querySelector('[data-close="gameModal"]')?.addEventListener('click',stop);modal.addEventListener('click',e=>{if(e.target===modal)stop()});
  function kd(e){if(!modal.classList.contains('show'))return;const k=e.key;if(S.screen==='title'&&['Enter',' ','ArrowUp','w','W'].includes(k)){beginAdventure();e.preventDefault();return}if(S.story&&['Enter',' ','ArrowRight','e','E'].includes(k)){advanceStory();e.preventDefault();return}if(['Escape','p','P'].includes(k)){if(!e.repeat)togglePause();e.preventDefault();return}if(S.screen!=='playing')return;if(['ArrowLeft','a','A'].includes(k)){input.left=true;e.preventDefault()}if(['ArrowRight','d','D'].includes(k)){input.right=true;e.preventDefault()}if(['ArrowUp','w','W',' '].includes(k)){if(!input.jump)pressed.jump=true;input.jump=true;e.preventDefault()}if(['ArrowDown','s','S'].includes(k)){input.down=true;enterPipe();e.preventDefault()}if(['f','F','x','X'].includes(k)&&!e.repeat){pressed.bone=true;e.preventDefault()}if(['Shift','e','E'].includes(k)&&!e.repeat){pressed.dash=true;e.preventDefault()}}
  function ku(e){const k=e.key;if(['ArrowLeft','a','A'].includes(k))input.left=false;if(['ArrowRight','d','D'].includes(k))input.right=false;if(['ArrowUp','w','W',' '].includes(k))input.jump=false;if(['ArrowDown','s','S'].includes(k))input.down=false}addEventListener('keydown',kd);addEventListener('keyup',ku);addEventListener('blur',()=>Object.assign(input,{left:false,right:false,jump:false,down:false}));
  let controllerTimer=0;function wakeController(){modal.classList.add('controller-visible');clearTimeout(controllerTimer);controllerTimer=setTimeout(()=>modal.classList.remove('controller-visible'),850)}
  function hold(id,key,action){const el=document.getElementById(id);if(!el)return;const down=e=>{e.preventDefault();wakeController();el.classList.add('pressed');if(key)input[key]=true;if(action)action()};const up=e=>{e.preventDefault();el.classList.remove('pressed');if(key)input[key]=false};el.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,up))}
  hold('gameLeft','left');hold('gameRight','right');hold('gameJump','jump',()=>pressed.jump=true);hold('gameBone',null,()=>pressed.bone=true);hold('gameDash',null,()=>pressed.dash=true);hold('gamePipe','down',enterPipe);
  canvas.addEventListener('pointerdown',e=>{if(S.story){e.preventDefault();advanceStory()}});
  document.getElementById('mavStartButton')?.addEventListener('click',beginAdventure); document.getElementById('mavNewGameButton')?.addEventListener('click',startNewAdventure); document.querySelectorAll('[data-mav-save-slot]').forEach(button=>button.addEventListener('click',()=>{activeSaveSlot=Number(button.dataset.mavSaveSlot);try{localStorage.setItem('mavWorldActiveSlotV1',String(activeSaveSlot))}catch(_){ }refreshSaveSlots();tone(784,.08)}));
  document.getElementById('mavStoryButton')?.addEventListener('click',watchIntro);
  document.getElementById('mavResumeButton')?.addEventListener('click',beginAdventure);
  document.getElementById('mavAgainButton')?.addEventListener('click',restartAdventure);
  document.getElementById('mavTryAgainButton')?.addEventListener('click',restartAdventure);
  document.getElementById('mavRestartButton')?.addEventListener('click',restartAdventure);
  document.getElementById('mavPauseButton')?.addEventListener('click',togglePause);
  document.getElementById('mavSoundButton')?.addEventListener('click',()=>{soundEnabled=!soundEnabled;try{localStorage.setItem('mavWorldSoundV1',soundEnabled?'on':'off')}catch(_){ }refreshSoundButton();if(soundEnabled)startMusic();else stopMusic()});
  document.getElementById('gameScoresBtn')?.addEventListener('click',showHighScores);
  document.getElementById('closeHighScores')?.addEventListener('click',()=>scorePanel.classList.remove('show'));
  document.getElementById('saveHighScore')?.addEventListener('click',saveHighScore);
  document.getElementById('scoreInitials')?.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3));
  document.getElementById('gameRestart')?.addEventListener('click',e=>{const button=e.currentTarget,now=performance.now();if(now>restartArm){restartArm=now+1800;button.textContent='TAP AGAIN';msg('RESTART ARMED • TAP AGAIN TO CONFIRM',1.7);setTimeout(()=>{if(performance.now()>restartArm&&button.isConnected)button.textContent='RESTART'},1900);return}restartArm=0;button.textContent='RESTART';restartAdventure()});
  window.__mavGameTest={LEVELS,spriteSheets,activeSpriteFrame,drawStoryParty,state:()=>({...S,checkpointX,checkpointIndex,projectiles:hazards.map(h=>({x:h.x,y:h.y,vx:h.vx,life:h.life})),player:{...player},blocks:blocks.map(b=>({type:b.type,used:b.used,broken:b.broken})),counts:{blocks:blocks.length,coins:coins.length,enemies:enemies.filter(e=>e.alive).length,bones:bones.length,vines:vines.length,items:items.length}}),setPlayer:(x,y=330)=>Object.assign(player,{x,y,vx:0,vy:0,inv:0}),input,pressed,step:(dt=.016,n=1)=>{for(let i=0;i<n;i++)update(dt);draw()},loadLevel,activateFinn,activateBob,throwBone,doDash,enterPipe,hitBlockAt:i=>hitBlock(blocks[i]),win,reset,start,stop};
  reset();S.screen='title';S.transition=0;S.messageTime=0;refreshSoundButton();refreshSaveSlots();draw();if(new URLSearchParams(location.search).get('gamePreview')==='1')open();
})();
