"use strict";

const room = document.querySelector(".front-room");
const narrowRoom = matchMedia("(max-width: 650px)");
const wall = document.querySelector(".mounted-art-wall");
const rainGlass = document.querySelector(".rain-layer");

const artwork = {
  "ktn-crab": ["Ketchikan crab", "3ABA2FB4-184C-4FB1-8D85-4118FA503931.png"],
  nightlight: ["Nightlight", "7528563F-9204-4651-A65A-2A7450DCE740.png"],
  "hump-day": ["Hump Day", "9EAA20AB-901D-41E1-AC98-64455D1A291D.png"],
  detail: ["Painted work from the Studio LaDuke gallery", "IMG_0082.jpeg"],
  salmon: ["King salmon", "5009BA2B-780C-4A6C-A6AA-4B5CDD3174C6.png"],
  buoy: ["Oh Buoy", "650B0A6A-1B85-4665-82D7-95FF79C8761E.png"],
  tablet: ["Circular black-and-white design", "9258DAB5-6EFA-4099-8DC9-EAD700BDA166.png"]
};

// Each mount is measured on its own room plate, clockwise from the upper left.
const wide = {
  size: [1535, 1024],
  art: [
    ["ktn-crab", [[1122, 60], [1267, 52], [1268, 191], [1122, 193]]],
    ["nightlight", [[1330, 51], [1481, 42], [1481, 191], [1332, 195]]],
    ["hump-day", [[1114, 256], [1293, 257], [1294, 367], [1112, 356]]],
    ["detail", [[1350, 260], [1432, 262], [1431, 377], [1349, 371]], "lamp"],
    ["salmon", [[1107, 410], [1212, 420], [1211, 490], [1107, 486]]],
    ["buoy", [[1275, 429], [1382, 436], [1378, 520], [1273, 504]], "pencils"],
    ["tablet", [[1297, 648], [1414, 682], [1341, 752], [1210, 705]]]
  ],
  panes: [[480, 68, 148, 325], [645, 59, 231, 361], [899, 55, 146, 340]]
};
const tall = {
  size: [876, 1795],
  art: [
    ["ktn-crab", [[730, 123], [829, 114], [831, 234], [727, 238]]],
    ["hump-day", [[723, 295], [833, 290], [831, 371], [722, 369]]]
  ],
  panes: [[270, 153, 72, 283], [356, 144, 79, 323], [448, 136, 94, 346], [563, 129, 92, 341]]
};

let scene;

function setMount(link, points, scaleX, scaleY) {
  const [p0, p1, p2, p3] = points.map(([x, y]) => ({ x: x * scaleX, y: y * scaleY }));
  const width = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const height = Math.hypot(p3.x - p0.x, p3.y - p0.y);
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const ex = p0.x - p1.x + p2.x - p3.x;
  const ey = p0.y - p1.y + p2.y - p3.y;
  const cross = dx1 * dy2 - dx2 * dy1;
  const g = (ex * dy2 - dx2 * ey) / cross;
  const h = (dx1 * ey - ex * dy1) / cross;
  const a = (p1.x - p0.x + g * p1.x) / width;
  const b = (p3.x - p0.x + h * p3.x) / height;
  const d = (p1.y - p0.y + g * p1.y) / width;
  const e = (p3.y - p0.y + h * p3.y) / height;

  link.style.width = `${width}px`;
  link.style.height = `${height}px`;
  link.style.transform = `matrix3d(${a},${d},0,${g / width},${b},${e},0,${h / height},0,0,1,0,${p0.x},${p0.y},0,1)`;
}

function placeFrontRoom() {
  const next = narrowRoom.matches ? tall : wide;
  const [width, height] = next.size;
  if (scene !== next) {
    scene = next;
    wall.replaceChildren(...scene.art.map(([name, , mask]) => {
      const [label, filename] = artwork[name];
      const link = document.createElement("a");
      const image = new Image();
      link.className = ["mounted-art", name, mask].filter(Boolean).join(" ");
      link.href = `gallery.html?from=front-room&art=${encodeURIComponent(filename)}`;
      image.src = `assets/front-art/${name}.webp`;
      image.alt = label;
      image.decoding = "async";
      link.append(image);
      return link;
    }));

    rainGlass.replaceChildren(...scene.panes.map(([x, y, w, h], i) => {
      const pane = document.createElement("div");
      pane.className = "wet-pane";
      pane.style.cssText = `left:${x / width * 100}%;top:${y / height * 100}%;width:${w / width * 100}%;height:${h / height * 100}%;`;
      for (let j = 0; j < 24; j += 1) {
        const bead = document.createElement("i");
        bead.className = "bead";
        const x = 2 + ((j * 37 + i * 13 + j * j * 3) % 96);
        const y = 3 + ((j * 19 + i * 31 + j * j) % 90);
        bead.style.cssText = `left:${x}%;top:${y}%;--size:${1 + (j * 3 % 7) * .45}px;--alpha:${.28 + (j % 6) * .08}`;
        pane.append(bead);
      }
      for (let j = 0; j < 4; j += 1) {
        const run = document.createElement("i");
        run.className = "rivulet";
        run.style.cssText = `left:${17 + j * 22 + (i % 3) * 3}%;top:${13 + ((j * 23 + i * 17) % 65)}%;height:${7 + ((j * 11 + i * 3) % 14)}px;--delay:${-(j * 2.2 + i)}s;--speed:${7 + j * 1.3 + i * .6}s`;
        pane.append(run);
      }
      return pane;
    }));
  }

  Array.from(wall.children).forEach((link, i) => {
    setMount(link, scene.art[i][1], room.clientWidth / width, room.clientHeight / height);
  });
}

placeFrontRoom();
new ResizeObserver(placeFrontRoom).observe(room);
narrowRoom.addEventListener("change", placeFrontRoom);
