/* Studio LaDuke House: physical scene rebuild, November 2026.
   Keeps the existing room graph, history, floor plan and keyboard navigation. */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const css = [
'body.scene-living .room-sign,body.scene-foyer .room-sign,body.scene-coat .room-sign{display:none}',
'body.scene-living #painting,body.scene-foyer #painting,body.scene-coat #painting{background:#1c1713}',
'body.scene-living #plate::after,body.scene-foyer #plate::after,body.scene-coat #plate::after{box-shadow:inset 0 0 95px 12px #050707a9}',
'body.scene-living .door .doorface,body.scene-living .door .plaque,body.scene-foyer .door .doorface,body.scene-foyer .door .plaque,body.scene-coat .door .doorface,body.scene-coat .door .plaque{display:none}',
'body.scene-living .door,body.scene-foyer .door,body.scene-coat .door{top:244px;height:454px;width:178px;border:0;outline-offset:-9px;filter:none;background:transparent}',
'body.scene-living .door:hover,body.scene-foyer .door:hover,body.scene-coat .door:hover{background:linear-gradient(90deg,transparent,#e8c78a24,transparent);box-shadow:inset 0 0 0 2px #e4b97999}',
'body.scene-living .door:focus-visible,body.scene-foyer .door:focus-visible,body.scene-coat .door:focus-visible{outline:5px solid #e6cb8f;background:#e6cb8f2b}',
'body.scene-living .prop,body.scene-foyer .prop,body.scene-coat .prop{width:112px;height:112px;filter:none}',
'body.scene-living .prop>svg,body.scene-living .prop>img,body.scene-foyer .prop>svg,body.scene-foyer .prop>img,body.scene-coat .prop>svg,body.scene-coat .prop>img{opacity:0;pointer-events:none}',
'body.scene-living .prop:hover,body.scene-foyer .prop:hover,body.scene-coat .prop:hover{outline:3px solid #efd99a66;outline-offset:1px;border-radius:50%}',
'body.scene-living .prop:focus-visible,body.scene-foyer .prop:focus-visible,body.scene-coat .prop:focus-visible{outline:4px solid #ffe0a0;border-radius:50%}',
'body.scene-living .prop .hint,body.scene-foyer .prop .hint,body.scene-coat .prop .hint{top:70%;border:1px solid #c2a678a6;border-radius:2px;background:#1a1b1bdd;padding:8px 11px;font:14px Georgia,serif}',
'body.scene-living #lookbar,body.scene-foyer #lookbar,body.scene-coat #lookbar{bottom:max(15px,env(safe-area-inset-bottom))}',
'body.scene-living #floorTag,body.scene-foyer #floorTag,body.scene-coat #floorTag{border-radius:3px;border:1px solid #bba47b65;background:#141c1be0}',
'#painting svg.house-scene{filter:saturate(.93) contrast(1.08)}',
'#painting svg.house-scene .light-flicker{animation:houseLamp 5s ease-in-out infinite}',
'@keyframes houseLamp{50%{opacity:.67}}',
'#painting .rainline{animation:houseRain 5s linear infinite}',
'@keyframes houseRain{to{transform:translateY(280px)}}',
'#plate.lamp-dim #room-lamp-glow{opacity:.04}',
'#plate.tv-playing #tv-on{opacity:1}',
'#plate.tv-playing #tv-off{opacity:0}',
'#plate.pick-found #found-pick{opacity:1;transform:translateY(0)}',
'#plate.pocket-open #pocket-contents{opacity:1;transform:translateY(-20px)}',
'#plate.pocket-open #coat-pocket-flap{transform:translateY(46px) rotate(8deg)}',
'#plate.star-awake #scene-star-glow{opacity:1}',
'#plate.yellow-spot #guitar-yellow-halo,#plate.pink-spot #guitar-pink-halo{opacity:.94}',
'#painting #pocket-contents,#painting #found-pick{opacity:0;transform:translateY(12px);transition:opacity .4s,transform .45s}',
'#painting #coat-pocket-flap{transform-origin:center 560px;transition:transform .55s}',
'#painting #tv-on,#painting #scene-star-glow,#painting #guitar-yellow-halo,#painting #guitar-pink-halo{opacity:0;transition:opacity .4s}',
'#painting #tv-off{opacity:1;transition:opacity .4s}',
'#painting #room-lamp-glow{transition:opacity .4s}',
'@media(prefers-reduced-motion:reduce){#painting .rainline,#painting .light-flicker{animation:none!important}#painting *{transition:none!important}}'
].join("\n");
document.head.appendChild(Object.assign(document.createElement("style"),{textContent:css}));
function el(s){return s;}
function grad(){return '<defs>'+
'<linearGradient id="wal" x2="0" y2="1"><stop stop-color="#3c332f"/><stop offset=".58" stop-color="#5a4133"/><stop offset="1" stop-color="#261d1b"/></linearGradient>'+
'<linearGradient id="floor" x2="0" y2="1"><stop stop-color="#a4774a"/><stop offset=".65" stop-color="#62452f"/><stop offset="1" stop-color="#271e19"/></linearGradient>'+
'<linearGradient id="cedar" x2="0" y2="1"><stop stop-color="#b0b1a1"/><stop offset=".45" stop-color="#436366"/><stop offset="1" stop-color="#0e3239"/></linearGradient>'+
'<linearGradient id="leather" x2="0" y2="1"><stop stop-color="#8d6550"/><stop offset=".35" stop-color="#624537"/><stop offset="1" stop-color="#322821"/></linearGradient>'+
'<linearGradient id="wood" x2="1" y2="1"><stop stop-color="#9e6e45"/><stop offset=".5" stop-color="#664129"/><stop offset="1" stop-color="#2b1b15"/></linearGradient>'+
'<radialGradient id="glow"><stop stop-color="#f8c67d" stop-opacity=".8"/><stop offset=".45" stop-color="#e9a656" stop-opacity=".32"/><stop offset="1" stop-color="#ee9d35" stop-opacity="0"/></radialGradient>'+
'<radialGradient id="night"><stop stop-color="#30464a" stop-opacity="0"/><stop offset="1" stop-color="#060d10" stop-opacity=".84"/></radialGradient>'+
'<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence baseFrequency=".48" numOctaves="3" seed="8" type="fractalNoise" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="mono"/><feComponentTransfer in="mono"><feFuncA type="linear" slope=".14"/></feComponentTransfer></filter>'+
'<filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>'+
'</defs>';}
function trees(x,y,w,h){let s='<g>';for(let i=0;i<18;i++){let px=x+(i*113%w),height=h*(.47+((i*7)%9)/17);s+='<path d="M'+px+' '+(y+h)+'V'+(y+h-height)+'" stroke="#152d2c" stroke-width="'+(8+(i%4)*5)+'"/>';for(let j=0;j<6;j++){let yy=y+h-height+j*height/8;let ww=(j+2)*8+(i%3)*3;s+='<path d="M'+px+' '+yy+'l-'+ww+' '+(height*.16)+' M'+px+' '+yy+'l'+ww+' '+(height*.16)+'" stroke="'+(i%3===0?'#244442':'#1a3536')+'" stroke-linecap="round" stroke-width="'+(7+(i%3)*3)+'"/>';}}return s+'</g>';}
function windowArt(x,y,w,h){let s='<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" fill="#2d2823" stroke="#2c1b16" stroke-width="27"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#cedar)"/>'+trees(x+8,y+23,w-16,h-33);s+='<path d="M'+(x+w/2)+' '+y+'v'+h+'M'+x+' '+(y+h*.53)+'h'+w+'" stroke="#b28c5c" stroke-width="19"/><path d="M'+(x+w/2+7)+' '+y+'v'+h+'M'+x+' '+(y+h*.54)+'h'+w+'" stroke="#211812" stroke-opacity=".52" stroke-width="5"/>';for(let i=0;i<32;i++){let xx=x+14+(i*47%(w-28)),yy=y+25+(i*71%(h-55));s+='<path class="rainline" d="M'+xx+' '+yy+'l-4 '+(13+i%17)+'" stroke="#dce5dc" stroke-opacity="'+(.13+(i%5)*.04)+'" stroke-width="1.8" style="animation-delay:-'+i%5+'s"/>';}return s+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#night)" opacity=".45"/><path d="M'+(x-18)+' '+(y+h+17)+'h'+(w+36)+'" stroke="#9a704b" stroke-width="23"/></g>';}
function woodgrain(y){let s='<g>';for(let i=0;i<15;i++){let yy=110+i*37;s+='<path d="M0 '+yy+'H1600" stroke="#000" opacity=".09" stroke-width="4"/>';};for(let i=0;i<25;i++){let xx=i*73;s+='<path d="M800 600 L'+(xx*1.2-170)+' 920" stroke="#20140f" stroke-opacity=".20" stroke-width="5"/>';}return s+'</g>';}
function guitar(x,y,color,which){let bg=which==="yellow"?'guitar-yellow-halo':'guitar-pink-halo';return '<g transform="translate('+x+' '+y+')"><ellipse id="'+bg+'" cx="0" cy="123" rx="80" ry="180" fill="url(#glow)"/><path d="M-5 9L-6 206H12L10 9Z" fill="#ad8b62" stroke="#271d14" stroke-width="5"/><path d="M-5 28H11M-5 54H11M-5 80H11M-5 106H11M-5 132H11M-5 159H11M-5 185H11" stroke="#4c3525" stroke-width="3"/><path d="M-7 10L-10 -12L-2 -27L10 -18L16 9Z" fill="#c29a6b" stroke="#22190f" stroke-width="3"/><path d="M-26 197Q-66 171 -59 233Q-62 293 -21 318L49 318Q82 280 54 230Q42 206 28 217L18 235L-7 231Z" fill="'+color+'" stroke="#201b18" stroke-width="7"/><path d="M-18 225Q8 213 36 233L28 290L-19 286Z" fill="#d6c9af" stroke="#3b3832" stroke-width="3"/><rect x="-12" y="246" width="38" height="12" rx="2" fill="#202225"/><path d="M-6 -19V295M0 -19V295M6 -19V295" stroke="#f0e4ce" stroke-width="1.3" stroke-opacity=".88"/><circle cx="49" cy="282" r="5" fill="#262626"/><path d="M-42 -9V-37H39V-9" stroke="#987452" stroke-width="8" fill="none"/><ellipse cx="0" cy="345" rx="38" ry="7" fill="#000" opacity=".26"/></g>';}
function door(x,y,w,h,kind){let arch=kind==="arch";return '<g><path d="M'+x+' '+(y+h)+'V'+(y+18)+'Q'+(x+w/2)+' '+(y-(arch?32:2))+' '+(x+w)+' '+(y+18)+'V'+(y+h)+'" fill="'+(arch?'#231e17':'url(#wood)')+'" stroke="#281b16" stroke-width="25"/><path d="M'+(x+13)+' '+(y+h)+'V'+(y+26)+'Q'+(x+w/2)+' '+(y+2)+' '+(x+w-13)+' '+(y+26)+'V'+(y+h)+'" fill="'+(arch?'#293531':'#523a2c')+'" stroke="#9a754c" stroke-width="7"/>'+(arch?'<path d="M'+(x+23)+' '+(y+h-20)+'L'+(x+78)+' '+(y+120)+'L'+(x+w-23)+' '+(y+h-40)+'" fill="#7d684e" opacity=".38"/>': '<path d="M'+(x+42)+' '+(y+80)+'h'+(w-84)+'v100h-'+(w-84)+'ZM'+(x+42)+' '+(y+208)+'h'+(w-84)+'v145h-'+(w-84)+'Z" fill="#412c22" stroke="#775035" stroke-width="9"/><circle cx="'+(x+w-36)+'" cy="'+(y+h*.58)+'" r="10" fill="#d8ae67" stroke="#483320" stroke-width="4"/>')+'</g>';}
function sceneBase(floor){let s= '<svg class="house-scene" xmlns="'+NS+'" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">'+grad()+'<rect width="1600" height="900" fill="url(#wal)"/><path d="M0 0L230 110V595L0 900ZM1600 0L1370 110V595L1600 900Z" fill="#231c1b" opacity=".52"/><path d="M0 0H1600V130L0 87Z" fill="#251b18"/><path d="M0 130H1600" stroke="#ac7d4b" stroke-width="22"/><path d="M0 588L800 552L1600 588V900H0Z" fill="url(#floor)"/><path d="M0 589L800 559L1600 589" fill="none" stroke="#221713" stroke-width="19"/>';s+=woodgrain();for(let i=0;i<8;i++){let x=i*225;s+='<path d="M'+x+' 0L'+(x+18)+' 127" stroke="#b48750" stroke-opacity=".27" stroke-width="13"/>';};s+='<rect x="0" y="0" width="1600" height="900" fill="#fff" filter="url(#grain)" opacity=".45" pointer-events="none"/>';return s;}
function living(){let s=sceneBase();s+=windowArt(660,215,282,325);
s+=door(90,224,175,438,false)+door(463,248,175,398,true)+door(955,248,166,398,true)+door(1344,224,175,438,false);
s+='<g opacity=".92"><rect x="635" y="160" width="330" height="26" fill="#2c1c18"/><path d="M639 190h326" stroke="#b99262" stroke-width="8"/><path d="M672 155l-3 -50m148 50v-47m145 47l4 -45" stroke="#6b503b" stroke-width="7"/></g>';
s+='<g><path d="M355 558l72 -245 130 0 66 245Z" fill="#292622" stroke="#ae8955" stroke-width="18"/><rect x="388" y="350" width="137" height="144" fill="#344039"/><path d="M395 425h123M454 352v140" stroke="#8b6c51" stroke-width="7"/><path d="M370 556h210" stroke="#30201a" stroke-width="28"/></g>';
s+=guitar(380,236,"#e5c322","yellow");s+=guitar(1245,236,"#c995aa","pink");
s+='<g><rect x="1131" y="212" width="166" height="114" fill="#b18a59" stroke="#32241e" stroke-width="16"/><rect x="1142" y="224" width="143" height="88" fill="#20292a"/><text x="1214" y="256" text-anchor="middle" font-family="Georgia" font-size="17" fill="#f0dbb6">STUDIO</text><text x="1214" y="283" text-anchor="middle" font-family="Georgia" font-size="28" fill="#e7bd76">LaDuke</text></g>';
s+='<g><path d="M320 770l100 -220h152l65 220" fill="#3f2f28" stroke="#251b18" stroke-width="18"/><path d="M339 736l107 -166h96l50 166" fill="#6e4833"/><path d="M350 758h240" stroke="#c09360" stroke-width="12"/><ellipse cx="474" cy="786" rx="165" ry="24" fill="#130e0b" opacity=".35"/></g>';
s+='<g><path d="M530 719v126m160 -128v129" stroke="#3d2720" stroke-width="23"/><rect x="500" y="702" width="215" height="31" rx="6" fill="url(#wood)" stroke="#271a16" stroke-width="9"/><rect x="536" y="567" width="153" height="122" rx="10" fill="#2a231e" stroke="#6d4b32" stroke-width="18"/><ellipse cx="612" cy="625" rx="46" ry="47" fill="#101519" stroke="#b29a77" stroke-width="7"/><ellipse cx="612" cy="625" rx="9" ry="9" fill="#c6a46a"/><path d="M612 626l32 -45" stroke="#c6bb9b" stroke-width="5"/></g>';
s+='<g id="room-lamp-glow"><ellipse cx="1081" cy="530" rx="225" ry="310" fill="url(#glow)" class="light-flicker"/></g><path d="M1095 600v-177" stroke="#856947" stroke-width="16"/><path d="M1039 433l-29 75h143l-29 -75Z" fill="#d5ae76" stroke="#503a2d" stroke-width="10"/><path d="M1062 617h69" stroke="#8b6e52" stroke-width="20"/>';
s+='<g><ellipse cx="826" cy="857" rx="330" ry="53" fill="#130f0d" opacity=".52"/><rect x="583" y="643" width="481" height="188" rx="40" fill="url(#leather)" stroke="#271b18" stroke-width="19"/><rect x="603" y="582" width="443" height="147" rx="35" fill="#8f684c" stroke="#493326" stroke-width="14"/><rect x="618" y="610" width="194" height="128" rx="27" fill="#967558" stroke="#4a3329" stroke-width="9"/><rect x="827" y="610" width="196" height="128" rx="27" fill="#977152" stroke="#4a3329" stroke-width="9"/><path d="M819 626v108" stroke="#432c24" stroke-width="12"/><path d="M606 709l-58 -6v129h78m419 -123l60 -4v125h-80" fill="#71513b" stroke="#33241c" stroke-width="12"/><path d="M899 623l30 6 50 96 -45 30 -49 -73Z" fill="#a34f40" stroke="#542b2a" stroke-width="5"/><path d="M912 635l20 63" stroke="#e1ab78" stroke-width="8"/></g>';
s+='<g><ellipse cx="777" cy="833" rx="232" ry="32" fill="#191410" opacity=".6"/><path d="M590 790l26 104m314 -104l-24 104" stroke="#5f3c29" stroke-width="23"/><ellipse cx="762" cy="777" rx="188" ry="54" fill="url(#wood)" stroke="#39231b" stroke-width="14"/><path d="M712 763l54 -20 44 31 -51 14Z" fill="#ddc2a1" stroke="#54402b" stroke-width="3"/><path d="M726 771l22 -8m29 7l16 1" stroke="#554232" stroke-width="3"/><path id="found-pick" d="M815 745Q848 743 844 766Q838 785 827 795Q805 773 808 758Z" fill="#e9c17c" stroke="#3a2d28" stroke-width="4"/></g>';
s+='<g><rect x="1134" y="421" width="178" height="130" rx="8" fill="#171b19" stroke="#79563d" stroke-width="20"/><rect id="tv-off" x="1150" y="437" width="145" height="94" fill="#1c2a2b"/><g id="tv-on"><rect x="1150" y="437" width="145" height="94" fill="#435455"/><image href="assets/archive-maverick.webp" x="1150" y="437" width="145" height="94" preserveAspectRatio="xMidYMid slice"/><text x="1223" y="520" font-family="Georgia" font-size="12" fill="#fff" text-anchor="middle" paint-order="stroke" stroke="#171818" stroke-width="4">STUDIO SHORTS</text></g><path d="M1160 556h130" stroke="#4e3224" stroke-width="20"/><path d="M1180 559l-16 106m105 -106l12 106" stroke="#3d271e" stroke-width="15"/></g>';
s+='<rect width="1600" height="900" fill="url(#night)" opacity=".40" pointer-events="none"/>';
return s+'</svg>';}
function foyer(){let s=sceneBase();s+=door(80,205,220,465,false)+door(1245,205,215,465,false)+door(395,255,190,412,false);
s+=windowArt(955,245,180,275);
s+='<g><path d="M595 485Q800 428 1025 485" fill="none" stroke="#cda66a" stroke-width="22"/><rect x="685" y="316" width="250" height="238" rx="10" fill="#3c2c25" stroke="#b18d61" stroke-width="18"/><image href="assets/studio-note-star.webp" x="765" y="350" width="96" height="106"/><circle id="scene-star-glow" cx="815" cy="404" r="116" fill="url(#glow)"/></g>';
s+='<path d="M0 560h1600" stroke="#d0a66f" opacity=".24" stroke-width="24"/><g><rect x="670" y="685" width="340" height="34" rx="7" fill="#81593d" stroke="#2c1e19" stroke-width="14"/><path d="M710 720v165m265 -165v165" stroke="#5b3c2b" stroke-width="23"/><path d="M716 693Q733 621 761 676h110Q919 628 943 691" fill="#7a4b34" stroke="#34271e" stroke-width="12"/><path d="M730 811h115m65 -10h75" stroke="#c5ad7c" stroke-width="11"/></g>';
s+='<g opacity=".92"><path d="M1093 631v-220" stroke="#75593c" stroke-width="16"/><path d="M1049 415l-35 93h152l-32 -93Z" fill="#dcc391" stroke="#654631" stroke-width="9"/><ellipse cx="1091" cy="513" rx="155" ry="185" fill="url(#glow)"/></g>';
return s+'</svg>';}
function coat(){let s=sceneBase();s+=door(80,238,210,433,false);s+='<g><rect x="425" y="185" width="744" height="470" fill="#3b2921" stroke="#271711" stroke-width="22"/><path d="M458 242h680M455 364h685" stroke="#8e6546" stroke-width="18"/><path d="M480 272v72m105 -72v72m110 -72v72m105 -72v72m110 -72v72m105 -72v72" stroke="#634b37" stroke-width="11"/></g>';
s+='<g><path d="M645 344Q676 270 708 309L760 343Q808 368 855 344L924 305Q964 280 976 344L1049 668H550Z" fill="#304c4c" stroke="#203031" stroke-width="23"/><path d="M732 321l61 80 -45 120m143 -198l-91 78 53 118" stroke="#648182" stroke-width="10" fill="none"/><path d="M691 455h113v117H691ZM832 456h119v117H832Z" fill="#375757" stroke="#92aaa4" stroke-width="5"/><path d="M665 411L583 629M966 410l58 213" stroke="#89a29b" stroke-width="12"/><path id="coat-pocket-flap" d="M727 531Q801 513 870 534L855 595H741Z" fill="#385b5b" stroke="#abb9aa" stroke-width="9"/><g id="pocket-contents"><path d="M755 524l5 -104 55 13 6 106Z" fill="#d9c39f" stroke="#654c35" stroke-width="4"/><path d="M781 441h23M773 454h35M774 465h23" stroke="#755b44" stroke-width="4"/><path d="M837 525Q879 514 876 550Q863 580 848 587Q815 547 837 525Z" fill="#c8a775" stroke="#4f3528" stroke-width="5"/><text x="850" y="548" text-anchor="middle" font-size="11" fill="#30251b" font-family="Georgia">♫</text></g></g>';
s+='<g><rect x="585" y="697" width="512" height="67" fill="url(#wood)" stroke="#281a16" stroke-width="16"/><path d="M633 767v120m418 -120v120" stroke="#573b2b" stroke-width="25"/><path d="M620 687q25 -40 52 0m85 0q25 -40 52 0m86 0q25 -40 52 0" fill="#524c36" stroke="#a38d68" stroke-width="14"/></g><rect width="1600" height="900" fill="url(#night)" opacity=".36"/>';
return s+'</svg>';}
function scene(which){if(which==="living")return living();if(which==="foyer")return foyer();if(which==="coat")return coat();return "";}
function activate(which,type,ctx){
  const plate=ctx.plate;
  if(which==="coat"&&type==="chest"){plate.classList.toggle("pocket-open");ctx.toast(plate.classList.contains("pocket-open")?"A ticket and a guitar pick. Both worth keeping.":"The pocket folds shut.");return true;}
  if(which==="foyer"&&type==="star"){plate.classList.toggle("star-awake");ctx.toast("Five music notes. One star. This one belongs here.");return true;}
  if(which!=="living")return false;
  if(type==="sofa"){plate.classList.toggle("pick-found");ctx.toast(plate.classList.contains("pick-found")?"A guitar pick was tucked between the cushions.":"The cushions settle back into place.");return true;}
  if(type==="tv"){plate.classList.toggle("tv-playing");ctx.toast(plate.classList.contains("tv-playing")?"A little original Studio LaDuke magic on the screen.":"The television clicks off.");return true;}
  if(type==="pick"){plate.classList.toggle("pick-found");ctx.toast("A lucky pick. The music hasn't gone anywhere.");return true;}
  if(type==="lamp"){plate.classList.toggle("lamp-dim");ctx.toast(plate.classList.contains("lamp-dim")?"The lamplight falls away.":"Warm light fills the corner.");return true;}
  if(type==="yellow"||type==="pink"){const cls=type+"-spot";plate.classList.toggle(cls);ctx.toast(type==="yellow"?"The yellow Strat: the guitar bought at sixteen.":"The pink guitar: the newer addition to the family.");return true;}
  return false;
}
window.StudioHouseV2={scene:scene,activate:activate};
})();