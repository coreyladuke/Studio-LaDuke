/* Studio LaDuke room-specific physical character.
   Scenery studies use original SVG geometry. No personal object is fabricated. */
(function(){
"use strict";
const livingFurniture=String.raw;
function sofa(){
return '<defs>'+
 '<linearGradient id="sofaOrange" x1="0" x2=".35" y1="0" y2="1"><stop stop-color="#ffa14e"/><stop offset=".18" stop-color="#ed6f24"/><stop offset=".55" stop-color="#c74818"/><stop offset="1" stop-color="#7e2c16"/></linearGradient>'+
 '<linearGradient id="sofaPlum" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#b07ce6"/><stop offset=".34" stop-color="#7440aa"/><stop offset=".76" stop-color="#442461"/><stop offset="1" stop-color="#271635"/></linearGradient>'+
 '<linearGradient id="sofaSeat" x1="0" x2=".3" y1="0" y2="1"><stop stop-color="#f9873c"/><stop offset=".38" stop-color="#de571e"/><stop offset="1" stop-color="#9e351a"/></linearGradient>'+
 '<linearGradient id="sofaChrome" x1="0" x2="1"><stop stop-color="#372f31"/><stop offset=".42" stop-color="#e0d9c5"/><stop offset=".55" stop-color="#aaa8a4"/><stop offset="1" stop-color="#2d2930"/></linearGradient>'+
 '<filter id="sofaShadow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="17"/></filter>'+
 '</defs>'+
 '<g id="vinyl-modular-sofa" aria-hidden="true" pointer-events="none">'+
 '<ellipse cx="832" cy="826" rx="509" ry="66" fill="#0f090b" opacity=".72" filter="url(#sofaShadow)"/>'+
 '<path d="M350 645Q335 572 386 547L446 524Q600 489 837 510Q1082 493 1231 551Q1279 568 1271 651L1265 789Q1248 823 1198 822L443 820Q361 819 350 778Z" fill="#431a2e" stroke="#24111a" stroke-width="16"/>'+
 '<path d="M423 558Q437 522 516 522L740 523Q789 528 816 558L810 706L422 714Z" fill="url(#sofaPlum)" stroke="#321a42" stroke-width="12"/>'+
 '<path d="M822 556Q862 518 934 522L1156 531Q1217 543 1224 584L1211 718L821 709Z" fill="url(#sofaPlum)" stroke="#331a45" stroke-width="12"/>'+
 '<path d="M450 574Q575 535 769 582M856 583Q1019 543 1192 582" fill="none" stroke="#e1b7ff" stroke-opacity=".27" stroke-width="9"/>'+
 '<g fill="#d3b4ec" stroke="#3b2356" stroke-width="5"><circle cx="515" cy="624" r="9"/><circle cx="640" cy="617" r="9"/><circle cx="756" cy="637" r="9"/><circle cx="894" cy="631" r="9"/><circle cx="1038" cy="618" r="9"/><circle cx="1167" cy="644" r="9"/></g>'+
 '<path d="M399 696Q440 674 523 684L798 692Q826 703 823 738L809 788Q777 807 701 805L442 801Q403 789 399 753Z" fill="url(#sofaSeat)" stroke="#702b1d" stroke-width="11"/>'+
 '<path d="M823 701Q857 682 948 682L1190 691Q1235 697 1243 743L1217 795Q1150 806 1050 803L876 804Q827 792 821 767Z" fill="url(#sofaOrange)" stroke="#712a1a" stroke-width="11"/>'+
 '<path d="M440 700Q620 696 792 716M861 711Q1028 691 1195 719" stroke="#ffd6a0" stroke-opacity=".43" fill="none" stroke-width="5"/>'+
 '<path d="M813 699L819 787" stroke="#642219" stroke-width="11"/>'+
 '<path d="M340 655Q337 580 381 561Q429 539 454 580L492 743Q500 805 459 825Q399 828 378 795Z" fill="url(#sofaOrange)" stroke="#6e2a1b" stroke-width="13"/>'+
 '<path d="M1222 595Q1237 544 1288 572Q1332 600 1319 681L1296 783Q1284 833 1233 816L1180 741Z" fill="url(#sofaPlum)" stroke="#40214c" stroke-width="14"/>'+
 '<path d="M372 604Q404 581 422 625M1271 603Q1298 640 1276 705" fill="none" stroke="#ffd2a2" stroke-opacity=".43" stroke-width="7"/>'+
 '<path d="M445 795L440 845M1190 801L1194 845" stroke="url(#sofaChrome)" stroke-width="24" stroke-linecap="round"/>'+
 '<path d="M440 834L429 852M1193 835L1205 852" stroke="#e2cfba" stroke-width="5" stroke-linecap="round"/>'+
 '<path d="M978 598L1042 615L1079 710L1007 730L951 664Z" fill="#e6b85f" stroke="#563624" stroke-width="5"/>'+
 '<path d="M984 615L1048 700M1020 621L1064 692" stroke="#d34d67" stroke-width="12" opacity=".83"/>'+
 '<path d="M978 642L1053 668" stroke="#5c326c" stroke-width="8"/>'+
 '</g>';
}
function enhance(room,svg){
 if(room!=="living"||!svg||!svg.endsWith("</svg>"))return svg;
 // Place furniture behind the found guitar pick, keeping the discovery visible.
 const furniture=sofa();
 const anchor='<path id="found-pick"';
 if(svg.includes(anchor))return svg.replace(anchor,furniture+anchor);
 return svg.replace("</svg>",furniture+"</svg>");
}
window.StudioHouseCharacter={enhance};
})();