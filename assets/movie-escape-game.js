/* Studio LaDuke Movie Maze. Original interactive puzzles and room structure.
   Film names identify inspirations; no movie footage, dialogue tracks or official logos.
   No accounts, analytics, paywalls or external requests. */
(function(){
"use strict";
const PROGRESS_KEY="studioladuke.movie.maze.v1", ENTRY_KEY="laduke-escape-done";
const stages=[
 {id:"ghost",film:"GHOSTBUSTERS",subtitle:"The Containment Room",name:"Ghostbusters · Containment",goal:"The containment system has three relays. Study the wall directions, then prime the switches in the correct order.",
  clue:"COLD → HOT → SAFE. The final light should be green.",
  type:"sequence",order:["blue","red","green"],
  props:[["blue","Blue cold relay"],["red","Red hot relay"],["green","Green safe relay"],["trap","Inspect the ghost trap"]],
  hints:["Follow the painted relay diagram, not the order of the switches.","Start with the cold blue cell, then the red one.","Press BLUE, then RED, then GREEN."],
  success:"The containment grid glows green. A door clicks open in the dark."},
 {id:"shining",film:"THE SHINING",subtitle:"The Overlook Corridor",name:"The Shining · Corridor",goal:"A room number has disappeared. Count the motifs on the carpet, in the order written beside the mysterious door.",
  clue:"FIRST: red diamonds. SECOND: cream circles. THIRD: gold bars.",
  type:"code",code:"237",props:[["diamonds","Count the red diamonds"],["circles","Count the cream circles"],["bars","Count the gold carpet bars"],["door","Inspect the numbered door"]],
  hints:["The pattern on the carpet is the combination. The plaque describes the order.","There are two red diamonds, three cream circles, and seven gold bars.","Enter 237 on the door keypad."],
  success:"The old hotel lock turns. The corridor grows strangely quiet."},
 {id:"beetle",film:"BEETLEJUICE",subtitle:"The Waiting Room",name:"Beetlejuice · Waiting Room",goal:"The exit clerk is absent. Find the order of the three things on the waiting-room notice, then wake the peculiar doorway.",
  clue:"ANNOUNCEMENT → NUMBER → ODDITY.",
  type:"sequence",order:["bell","ticket","sculpture"],props:[["bell","Ring the desk bell"],["ticket","Take a waiting ticket"],["sculpture","Turn the odd sculpture"],["door","Inspect the strange green door"]],
  hints:["The notice uses three words for three physical objects.","The bell announces you; the ticket gives your number; the sculpture is the oddity.","Ring BELL, take TICKET, turn SCULPTURE."],
  success:"The crooked door turns green. The waiting line has finally moved."},
 {id:"wayne",film:"WAYNE'S WORLD",subtitle:"The Basement Broadcast",name:"Wayne's World · Basement",goal:"Get the basement broadcast running. Trace the signal from the instrument through the sound gear to the video.",
  clue:"STRING → SOUND → SCREEN. CRUCIAL TAUNT plays here.",
  type:"sequence",order:["guitar","amp","camera"],props:[["guitar","Pick up the guitar"],["amp","Switch on the amplifier"],["camera","Start the video camera"],["poster","Read the Crucial Taunt poster"]],
  hints:["A signal must begin somewhere. The camera cannot hear an unplugged guitar.","Instrument first, amplifier second, recording equipment last.","Touch GUITAR, then AMP, then CAMERA."],
  success:"A red recording light shines. The basement show is on."},
 {id:"stand",film:"STAND BY ME",subtitle:"The Pie-Eating Contest",name:"Stand by Me · Contest",goal:"The trophy sits beside three pies. The judges' note says how to serve the last round.",
  clue:"RED FIRST. GOLD SECOND. BLUE LAST. Don't touch the trophy until the pies are served.",
  type:"sequence",order:["cherry","apple","blueberry"],props:[["cherry","Serve cherry pie"],["apple","Serve apple pie"],["blueberry","Serve blueberry pie"],["trophy","Inspect the pie-contest trophy"]],
  hints:["The judges' handwritten note uses the colors of the pies.","Cherry is red; apple is golden; blueberry is blue.","Serve CHERRY, then APPLE, then BLUEBERRY."],
  success:"The contest trophy rattles. Behind it, the Curiosity Vault opens."}
];
let saved={stage:0,solved:[],steps:{},elapsed:{},hints:{}};
try{const raw=JSON.parse(localStorage.getItem(PROGRESS_KEY)||"null");if(raw&&typeof raw==="object"){
 saved={...saved,...raw};saved.stage=Number.isInteger(saved.stage)?Math.max(0,Math.min(4,saved.stage)):0;
 saved.solved=Array.isArray(saved.solved)?saved.solved.filter(x=>Number.isInteger(x)&&x>=0&&x<5):[];
 saved.steps=saved.steps&&typeof saved.steps==="object"?saved.steps:{};
 saved.elapsed=saved.elapsed&&typeof saved.elapsed==="object"?saved.elapsed:{};
 saved.hints=saved.hints&&typeof saved.hints==="object"?saved.hints:{};
}}catch(_){}
let stageIndex=saved.stage,renderStage=()=>{},messageTimer=0,frameLast=performance.now(),lastSaved=0;
const hintTimes=[90000,180000,270000];
const $=id=>document.getElementById(id);
function save(){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(saved))}catch(_){}}
function toast(msg){const el=$("message");el.textContent=msg;el.classList.add("show");clearTimeout(messageTimer);messageTimer=setTimeout(()=>el.classList.remove("show"),3400)}
function chapter(){return stages[stageIndex]}
function isSolved(){return saved.solved.includes(stageIndex)}
function elapsed(){return Math.max(0,Number(saved.elapsed[stageIndex])||0)}
function hintCount(){return Math.max(0,Math.min(3,Number(saved.hints[stageIndex])||0))}
function step(){return Math.max(0,Number(saved.steps[stageIndex])||0)}
function safeSession(k,value){try{if(value!==undefined)sessionStorage.setItem(k,value);return sessionStorage.getItem(k)}catch(_){return null}}
function syncGate(){
 const allowed=safeSession(ENTRY_KEY)==="1";
 $("gate").hidden=allowed;
 return allowed;
}
function timeText(ms){const v=Math.ceil(Math.max(0,ms)/1000);return Math.floor(v/60)+":"+String(v%60).padStart(2,"0")}
function updateHint(){
 const b=$("hint");if(isSolved()){b.textContent="Room solved";b.disabled=true;return;}
 const n=hintCount();if(n>=3){b.textContent="All hints read";b.disabled=true;return;}
 const remain=hintTimes[n]-elapsed();
 if(remain<=0){b.disabled=false;b.textContent="Read hint "+(n+1)+" of 3";}
 else{b.disabled=true;b.textContent="Hint in "+timeText(remain);}
}
function enter(index){
 stageIndex=Math.max(0,Math.min(4,index));saved.stage=stageIndex;save();
 const c=chapter(),letters=["I","II","III","IV","V"];
 $("theater").dataset.film=c.id;$("act").textContent="ACT "+letters[stageIndex]+" / V";
 $("filmTitle").textContent=c.film;$("filmSubtitle").textContent=c.subtitle;
 $("goal").textContent=c.goal;$("progress").textContent=(stageIndex+1)+" / 5";
 $("number").value="";$("roomCode").hidden=true;$("hintNote").hidden=true;closeProps();
 $("doorReveal").hidden=!isSolved();
 $("successText").textContent=c.success;
 $("nextRoom").innerHTML=stageIndex===4?"Enter the Curiosity Vault <span aria-hidden='true'>➜</span>":"Open the next door <span aria-hidden='true'>➜</span>";
 const propBox=$("props");propBox.replaceChildren();
 for(const [action,label]of c.props){
  const btn=document.createElement("button");btn.type="button";btn.textContent=label;btn.dataset.action=action;
  btn.addEventListener("click",()=>{interact(action);if(!isSolved()){}});
  propBox.append(btn);
 }
 updateHint();
 renderStage(stageIndex);
 frameLast=performance.now();
}
function closeProps(){$("propDrawer").hidden=true;$("inspect").setAttribute("aria-expanded","false");}
function interact(action){
 if(!syncGate()||isSolved())return;
 const c=chapter();
 if(action==="door"&&c.id==="shining"){$("roomCode").hidden=false;$("number").focus();return;}
 if(action==="door"&&c.id==="beetle"){toast("The green door is waiting for three things to happen first.");return;}
 if(action==="trap"){toast(c.clue);return;}
 if(action==="poster"){toast(c.clue);return;}
 if(action==="trophy"){toast("The trophy won't move. Three pies first, says the judge's note.");return;}
 if(c.type==="code"){
  const info={diamonds:"Two red diamonds. A tiny 2 is scratched on the wall.",circles:"Three cream circles. Each is carefully carved.",bars:"Seven golden bars, all in the same row."}[action];
  if(info)toast(info);return;
 }
 const expected=c.order[step()];
 if(action===expected){
  saved.steps[stageIndex]=step()+1;save();
  if(step()>=c.order.length){complete();return;}
  toast(["A relay snaps into place.","One piece of the sequence is right.","The mechanism is listening."][Math.min(2,step()-1)]);
 }else if(c.order.includes(action)){
  saved.steps[stageIndex]=0;save();toast("The mechanism resets. Read the room and begin again.");
 }else toast(c.clue);
}
function complete(){
 if(isSolved())return;
 saved.solved=[...new Set([...saved.solved,stageIndex])].sort((a,b)=>a-b);save();
 updateHint();$("roomCode").hidden=true;closeProps();$("hintNote").hidden=true;
 $("doorReveal").hidden=false;$("successText").textContent=chapter().success;
 toast("The next door has opened.");
 if(stageIndex===4){safeSession("laduke-movie-gauntlet-done","1");safeSession(ENTRY_KEY,"1");
   try{localStorage.setItem("studioladuke.movie.maze.finished.v1","true")}catch(_){}
 }
 try{const key="studioladuke.house.discovery.v1",list=JSON.parse(localStorage.getItem(key)||"[]");
  if(Array.isArray(list)){const id="escape:movie-"+chapter().id;if(!list.includes(id)){list.push(id);localStorage.setItem(key,JSON.stringify(list));}}
 }catch(_){}
}
function submitCode(value){
 const c=chapter();if(c.type!=="code")return;
 if(value===c.code)complete();else{toast("The lock refuses that number. Inspect the carpet again.");$("number").value="";$("number").focus();}
}
function onHint(){
 if(isSolved())return;
 const n=hintCount();if(n>=3||elapsed()<hintTimes[n])return;
 saved.hints[stageIndex]=n+1;save();
 $("hintText").textContent=chapter().hints[n];
 $("hintNote").hidden=false;updateHint();$("closeHint").focus();
}
function next(){
 if(!isSolved())return;
 if(stageIndex===4){window.location.href="house.html?room=vault";return;}
 enter(stageIndex+1);
}
$("inspect").addEventListener("click",()=>{
 const opening=$("propDrawer").hidden;closeProps();
 if(opening){$("propDrawer").hidden=false;$("inspect").setAttribute("aria-expanded","true");$("props").querySelector("button")?.focus();}
});
$("closeProps").addEventListener("click",()=>{closeProps();$("inspect").focus()});
$("hint").addEventListener("click",onHint);
$("closeHint").addEventListener("click",()=>{$("hintNote").hidden=true;$("hint").focus()});
$("closeCode").addEventListener("click",()=>{$("roomCode").hidden=true});
$("roomCode").addEventListener("submit",e=>{e.preventDefault();submitCode($("number").value.trim())});
$("nextRoom").addEventListener("click",next);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){
 if(!$("hintNote").hidden){$("hintNote").hidden=true;$("hint").focus();}
 else if(!$("roomCode").hidden){$("roomCode").hidden=true;$("inspect").focus();}
 else if(!$("propDrawer").hidden)closeProps();
}});
function tick(now){
 const delta=Math.max(0,Math.min(140,now-frameLast));frameLast=now;
 if(!document.hidden&&!isSolved()&&syncGate()&&$("hintNote").hidden&&$("roomCode").hidden){
  saved.elapsed[stageIndex]=elapsed()+delta;
 }
 if(now-lastSaved>4000){save();lastSaved=now;}
 updateHint();
 requestAnimationFrame(tick);
}
document.addEventListener("visibilitychange",()=>frameLast=performance.now());
addEventListener("pagehide",save);
function attachRenderer(draw){renderStage=typeof draw==="function"?draw:()=>{};renderStage(stageIndex)}
function revealFallback(){const a=$("filmFallback");a.hidden=false;$("loading").hidden=true;}
function reset(){saved={stage:0,solved:[],steps:{},elapsed:{},hints:{}};save();enter(0)}
window.StudioMovieMaze={stages,get stageIndex(){return stageIndex},get stage(){return chapter()},get solved(){return isSolved()},get step(){return step()},get elapsed(){return elapsed()},get hintCount(){return hintCount()},interact,submitCode,attachRenderer,revealFallback,toast,enter,next,reset};
if(!syncGate()){$("loading").hidden=true;$("filmFallback").hidden=true;}
enter(stageIndex);
requestAnimationFrame(tick);
})();