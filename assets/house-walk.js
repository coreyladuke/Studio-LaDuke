/* Development views for the House Guide walk. Picture picks are still open. */
(function () {
  "use strict";

  const opening = {name: "Main Hall Opening", rooms: ["foyer", "hall"]};
  const stairs = {name: "Main Stairs", rooms: ["hall", "landing"]};
  const hallBounds = {
    foyer: [48, 55, 188, 824, "polygon(0 0,100% 16%,100% 80%,0 100%)"],
    landing: [678, 161, 286, 521],
    art: [1286, 103, 257, 740, "polygon(0 17%,100% 0,100% 100%,0 75%)"]
  };
  const views = {
    hall: {
      forward: {bounds: hallBounds.landing, provisional: true},
      reverse: {bounds: hallBounds.foyer, provisional: true}
    },
    landing: {
      forward: {art: "landing", provisional: true},
      reverse: {bounds: [525, 190, 550, 545], art: "down", provisional: true}
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
      <linearGradient id="stair-wood" x2="0" y2="1">
        <stop stop-color="#745137"/><stop offset=".45" stop-color="#ba8b58"/><stop offset="1" stop-color="#513323"/>
      </linearGradient>
      <linearGradient id="window-light" x2="0" y2="1">
        <stop stop-color="#c9d7cc"/><stop offset="1" stop-color="#66786c"/>
      </linearGradient>
      <clipPath id="walk-window"><rect x="668" y="249" width="264" height="259"/></clipPath>

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

  function stairFlight() {
    const steps = Array.from({length: 13}, (_, i) => {
      const y = 727 - i * 18;
      const half = 247 - i * 12;
      return `<path d="M${800-half} ${y}H${800+half}l-8 -14H${808-half}Z" fill="url(#stair-wood)"/>
        <path d="M${800-half} ${y}H${800+half}v5H${800-half}Z" fill="#573923"/>
        <path d="M${800-half+4} ${y-3}H${800+half-4}" stroke="#c39261" opacity=".7"/>`;
    }).reverse().join("");
    const rails = [543, 1057].map((x) => {
      const inner = x < 800 ? 706 : 894;
      return `<path d="M${x} 742V393L${inner} 429v83M${(x+inner)/2} 411v207"
        fill="none" stroke="#473023" stroke-width="14"/>
        <path d="M${x} 389L${inner} 425" stroke="#ba8959" stroke-width="8"/>`;
    }).join("");
    return `<path d="M528 738V201H1072V738Z" fill="#38291e" stroke="#342319" stroke-width="14"/>
      <path d="M543 729V217H1057V729Z" fill="url(#well)" stroke="#916441" stroke-width="7"/>
      <path d="M543 729L699 507V374L543 217M1057 729L901 507V374L1057 217" fill="#231b16" opacity=".55"/>
      <path d="M699 482V379H901V482Z" fill="#81644a" stroke="#4c3829" stroke-width="9"/>
      <path d="M708 463H892V491H708Z" fill="#754932"/>
      <path d="M708 468H892M731 465V487M759 465V487M785 465V487M814 465V487M843 465V487M872 465V487" stroke="#c6916d" opacity=".75"/>
      ${steps}
      <path d="M548 724L700 506H721L566 730ZM1052 724L900 506H879L1034 730Z" fill="#2b1b13" opacity=".48"/>
      ${rails}
      <path d="M542 550V745M1058 550V745" stroke="#795234" stroke-width="25"/>
      <path d="M537 559V745M1053 559V745" stroke="#a7774f" stroke-width="5"/>
      <ellipse cx="542" cy="550" rx="19" ry="9" fill="#a8754c"/>
      <ellipse cx="1058" cy="550" rx="19" ry="9" fill="#a8754c"/>
      <path d="M527 746H1073" stroke="#3a291e" stroke-width="15"/>
      <path d="M527 741H1073" stroke="#bc8b5d" stroke-width="4"/>`;
  }

  function scene(room, facing) {
    if (room === "hall") return '<img src="assets/house-plates/main-hall-cedar.webp" alt="">';
    const view = views[room]?.[facing];
    if (!view) return "";
    let feature;
    if (view.art === "down") {
      feature = stairFlight();
    } else {
      const rain = Array.from({length: 42}, (_, i) => {
        const x = 670 + (i * 43 % 262);
        const y = 158 + (i * 59 % 355);
        return `<path d="M${x} ${y}l-3 21" stroke="#e5efdf" opacity="${.10 + (i % 4) * .045}"/>`;
      }).join("");
      feature = `<path d="M604 650V213H996V650" fill="#463429" stroke="#654632" stroke-width="18"/>
        <rect x="663" y="244" width="274" height="269" fill="url(#window-light)" stroke="#3c2c24" stroke-width="18"/>
        <path d="M669 477L711 310L736 481L780 272L824 481L877 297L929 472V505H669Z" fill="#425a50"/>
        <g clip-path="url(#walk-window)"><g class="walk-rain">${rain}</g></g>
        <path d="M800 244V513M663 386H937" stroke="#675444" stroke-width="12"/>
        <path d="M651 523H949L1080 761H520Z" fill="#d4d8b3" opacity=".08"/>
        <path d="M641 520H960" stroke="#9e7652" stroke-width="14"/>
        <path d="M641 527H960" stroke="#3b291d" stroke-width="5"/>`;
    }
    return `<svg class="walk-view" viewBox="0 0 1600 900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${materials}${shell()}${feature}
      <rect width="1600" height="900" fill="url(#light)" pointer-events="none"/>

    </svg>`;
  }

  window.StudioHouseWalk = {opening, stairs, hallBounds, views, scene};
})();
