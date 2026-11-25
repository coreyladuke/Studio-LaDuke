/* Development views for the House Guide walk. Picture picks are still open. */
(function () {
  "use strict";

  const opening = {name: "Main Hall Opening", rooms: ["foyer", "hall"]};
  const stairs = {name: "Main Stairs", rooms: ["hall", "landing"]};
  const frame = [620, 165, 360, 530];
  const views = {
    hall: {
      forward: {edge: stairs, bounds: frame, art: "up"},
      reverse: {edge: opening, bounds: frame, art: "opening"}
    },
    landing: {
      forward: {art: "landing"},
      reverse: {edge: stairs, bounds: [525, 180, 550, 565], art: "down"}
    }
  };

  const materials = `
    <defs>
      <linearGradient id="cedar" x2="0" y2="1"><stop stop-color="#996b46"/>
        <stop offset="1" stop-color="#523725"/></linearGradient>
      <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#947054"/>
        <stop offset="1" stop-color="#473328"/></linearGradient>
      <linearGradient id="ceiling" x2="0" y2="1"><stop stop-color="#3d2a20"/>
        <stop offset="1" stop-color="#755440"/></linearGradient>
      <linearGradient id="well" x2="0" y2="1"><stop stop-color="#614630"/>
        <stop offset="1" stop-color="#2a2018"/></linearGradient>
      <radialGradient id="light" cy=".32"><stop stop-color="#fff0c7" stop-opacity=".3"/>
        <stop offset="1" stop-color="#171410" stop-opacity=".36"/></radialGradient>
      <pattern id="boards" width="180" height="34" patternUnits="userSpaceOnUse">
        <path d="M0 33H180" stroke="#1f1710" stroke-opacity=".48" stroke-width="2"/>
        <path d="M5 9Q65 3 172 9M29 22Q115 28 175 18" fill="none" stroke="#f8d49a" stroke-opacity=".16"/>
      </pattern>
      <filter id="texture"><feTurbulence type="fractalNoise" baseFrequency=".28 .58" numOctaves="3" seed="17"/>
        <feColorMatrix type="saturate" values="0"/></filter>
      <clipPath id="threshold"><rect x="639" y="185" width="322" height="501"/></clipPath>
    </defs>`;

  function shell() {
    const floorboards = Array.from({length: 21}, (_, i) =>
      `<path d="M${i * 124 - 440} 900L${800 + (i * 124 - 1240) * .33} 650"/>`).join("");
    return `
      <path d="M0 0H1600V900H0Z" fill="url(#cedar)"/>
      <path d="M0 0H1600V900H0Z" fill="url(#boards)"/>
      <path d="M0 0H1600L1100 136H500Z" fill="url(#ceiling)"/>
      <path d="M0 900V760L500 650H1100L1600 760V900Z" fill="url(#floor)"/>
      <g stroke="#261b15" stroke-width="3" opacity=".48">${floorboards}</g>
      <path d="M0 0L500 136V650L0 760ZM1600 0L1100 136V650L1600 760Z" fill="#231910" opacity=".24"/>
      <path d="M0 743L500 642H1100L1600 743M0 19L500 145H1100L1600 19" fill="none" stroke="#3b291c" stroke-width="17"/>
      <path d="M0 733L500 635H1100L1600 733" fill="none" stroke="#ad7c52" stroke-width="3"/>`;
  }

  function stairFlight(down) {
    const steps = Array.from({length: 13}, (_, i) => {
      const y = 675 - i * (down ? 16 : 31);
      const half = (down ? 250 : 151) - i * (down ? 12 : 4.6);
      return `<path d="M${800-half} ${y}H${800+half}l-8 -12H${808-half}Z" fill="#a6754b"/>
        <path d="M${800-half} ${y}H${800+half}v8H${800-half}Z" fill="#573923"/>
        <path d="M${800-half+4} ${y-3}H${800+half-4}" stroke="#c39261" opacity=".7"/>`;
    }).reverse().join("");
    const left = down ? 543 : 642;
    const right = 1600 - left;
    const end = down ? 392 : 235;
    const rail = [left, right].map((x) => {
      const inner = x < 800 ? 709 : 891;
      return `<path d="M${x} 675V480L${inner} ${end}v102M${(x+inner)/2} ${(480+end)/2}v133"
        fill="none" stroke="#473023" stroke-width="12"/>
        <path d="M${x-3} 478L${inner} ${end-2}" stroke="#b38250" stroke-width="5"/>`;
    }).join("");
    return `<path d="M${left-19} 693V178H${right+19}V693Z" fill="#38291e" stroke="#342319" stroke-width="14"/>
      <path d="M${left} 681V195H${right}V681Z" fill="url(#well)" stroke="#916441" stroke-width="7"/>
      <path d="M${left} 681L708 425V254L${left} 195M${right} 681L892 425V254L${right} 195" fill="#231b16" opacity=".45"/>
      <path d="M722 235H878V${down ? 482 : 307}H722Z" fill="${down ? "#977052" : "#9a9e88"}" opacity=".75"/>
      ${steps}${rail}`;
  }

  function scene(room, facing) {
    const view = views[room]?.[facing];
    if (!view) return "";
    let feature;
    if (view.art === "up" || view.art === "down") {
      feature = stairFlight(view.art === "down");
    } else if (view.art === "opening") {
      feature = `<rect x="619" y="166" width="362" height="525" fill="#251a13" stroke="#39281e" stroke-width="20"/>
        <image href="assets/front-room-wide.webp" x="639" y="185" width="322" height="501"
          preserveAspectRatio="xMidYMid slice" clip-path="url(#threshold)"/>
        <path d="M637 687V184H963V687" fill="none" stroke="#90613d" stroke-width="13"/>
        <path d="M621 695H980" stroke="#38271e" stroke-width="14"/>`;
    } else {
      feature = `<path d="M604 650V213H996V650" fill="#463429" stroke="#654632" stroke-width="18"/>
        <rect x="663" y="244" width="274" height="269" fill="#8a9890" stroke="#3c2c24" stroke-width="18"/>
        <path d="M669 477L711 310L736 481L780 272L824 481L877 297L929 472V505H669Z" fill="#425a50"/>
        <path d="M800 244V513M663 386H937" stroke="#675444" stroke-width="12"/>
        <path d="M641 520H960" stroke="#9e7652" stroke-width="14"/>`;
    }
    return `<svg class="walk-view" viewBox="0 0 1600 900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${materials}${shell()}${feature}
      <rect width="1600" height="900" fill="url(#light)" pointer-events="none"/>
      <rect width="1600" height="900" fill="#fff" filter="url(#texture)" opacity=".14" style="mix-blend-mode:multiply" pointer-events="none"/>
    </svg>`;
  }

  window.StudioHouseWalk = {opening, stairs, views, scene};
})();
