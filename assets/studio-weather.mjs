const station = "https://api.weather.gov/stations/PAKT/observations/latest";
const localDate = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sitka", month: "numeric" });
const weatherCacheKey = "studio-ketchikan-weather";
const soundKey = "studio-laduke-ambient-sound";

const radians = degrees => degrees * Math.PI / 180;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function ketchikanLight(date = new Date()) {
  const year = date.getUTCFullYear();
  const daysInYear = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const day = (date - Date.UTC(year, 0, 1)) / 86400000;
  const g = Math.PI * 2 * (day - .5) / daysInYear;
  const equation = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
  const declination = .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g);
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const solarMinutes = ((minutes + equation - 131.71 * 4) % 1440 + 1440) % 1440;
  const hourAngle = radians(solarMinutes / 4 - 180);
  const latitude = radians(55.36);
  const altitude = Math.asin(Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle)) * 180 / Math.PI;
  const month = Number(localDate.format(date));
  const season = ["winter","winter","spring","spring","spring","summer","summer","summer","autumn","autumn","autumn","winter"][month - 1];
  return { light: clamp((altitude + 8) / 17, 0, 1), season };
}

export function observedWeather(properties) {
  const time = Date.parse(properties?.timestamp);
  if (!Number.isFinite(time) || Date.now() - time > 3 * 3600000) return null;
  const report = String(properties.textDescription || "").toLowerCase();
  const codes = (properties.presentWeather || []).map(entry => entry.weather);
  let kind = "dry";
  if (/snow|sleet|ice pellets|wintry/.test(report) || codes.some(code => /snow|icePellets/i.test(code))) kind = "snow";
  else if (/rain|drizzle|shower|thunderstorm/.test(report) || codes.some(code => /rain|drizzle|thunderstorm/i.test(code))) kind = "rain";
  else if (!report && !codes.length) kind = "unknown";
  return { kind, time };
}

function getStored(store, key) {
  try { return store.getItem(key); } catch { return null; }
}

export function studioConditions(scene) {
  const light = () => {
    const now = ketchikanLight();
    scene.dataset.season = now.season;
    scene.style.setProperty("--outside-darkness", (1 - now.light).toFixed(2));
  };
  light();
  setInterval(light, 60000);

  let cached;
  try { cached = JSON.parse(getStored(sessionStorage, weatherCacheKey)); } catch {}
  function show(weather) {
    scene.dataset.weather = weather?.kind || "unknown";
    scene.dispatchEvent(new CustomEvent("studio-weather", { detail: scene.dataset.weather }));
  }
  if (cached && Date.now() - cached.time < 3 * 3600000) show(cached);
  else show(null);

  async function refreshWeather() {
    try {
      const response = await fetch(station, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) return;
      const conditions = observedWeather((await response.json()).properties);
      if (!conditions) return;
      show(conditions);
      try { sessionStorage.setItem(weatherCacheKey, JSON.stringify(conditions)); } catch {}
    } catch {}
  }
  refreshWeather();
  setInterval(refreshWeather, 15 * 60000);
}

export function ambientSound(control, audio, scene, { inside = false } = {}) {
  let enabled = getStored(sessionStorage, soundKey) === "on";
  audio.volume = inside ? .35 : .55;
  // Forest Stream (Loop) by Sound Effects Library, CC0 1.0.
  // https://www.free-stock-music.com/sound-effects-library-forest-stream.html
  function sync() {
    const raining = scene.dataset.weather === "rain";
    const source = raining ? "audio/front-room-rain.mp3" : "audio/woods-stream.mp3";
    if (audio.getAttribute("src") !== source) audio.src = source;
    const shouldPlay = enabled && (!inside || raining);
    if (shouldPlay) audio.play().catch(() => updateLabel());
    else audio.pause();
    updateLabel();
  }
  function updateLabel() {
    const playing = !audio.paused;
    const waitingForRain = inside && scene.dataset.weather !== "rain" && enabled;
    control.textContent = playing ? "Mute ambience" : waitingForRain ? "Rain sound on" : "Sound on";
    control.setAttribute("aria-pressed", String(playing || waitingForRain));
  }
  control.addEventListener("click", () => {
    // A saved preference cannot bypass a new browser page’s audio policy.
    enabled = !enabled || (audio.paused && (!inside || scene.dataset.weather === "rain"));
    try { sessionStorage.setItem(soundKey, enabled ? "on" : "off"); } catch {}
    sync();
  });
  audio.addEventListener("play", updateLabel);
  audio.addEventListener("pause", updateLabel);
  scene.addEventListener("studio-weather", sync);
  window.addEventListener("pagehide", () => audio.pause());
  window.addEventListener("pageshow", event => { if (event.persisted) sync(); });
  sync();
  return () => !audio.paused;
}
