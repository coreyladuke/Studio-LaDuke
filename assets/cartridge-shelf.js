const consoleDialog = document.getElementById("cartridge-console");
const consoleDeck = consoleDialog.querySelector(".console-deck");
const consoleCart = document.getElementById("selected-cartridge");
const consoleTitle = document.getElementById("console-title");
const consoleStatus = document.getElementById("console-status");
const consoleAction = document.getElementById("console-action");
const consoleSkip = document.getElementById("console-skip");

const consoleSteps = {
  insert: ["Push it in", "The console’s empty slot is waiting.", "stuck"],
  stuck: ["Pull it out", "Nothing. The screen stays blank.", "blow"],
  blow: ["Blow into the cartridge", "The old ritual. You know what to do.", "retry"],
  retry: ["Push it back in", "There. Now pretend that helped.", "booting"],
  booting: ["Starting…", "The power light comes on."]
};

let opener;
let launchTimer;

function showConsoleStep(step) {
  const [action, status] = consoleSteps[step];
  consoleDeck.dataset.step = step;
  consoleAction.textContent = action;
  consoleStatus.textContent = status;
  consoleAction.disabled = step === "booting";
}

if (typeof consoleDialog.showModal === "function") {
  document.querySelectorAll(".game-cart").forEach(link => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const image = link.querySelector("img");
      opener = link;
      consoleCart.src = image.src;
      consoleTitle.textContent = image.alt;
      consoleSkip.href = link.href;
      showConsoleStep("insert");
      consoleDialog.showModal();
      event.preventDefault();
    });
  });
}

consoleAction.addEventListener("click", () => {
  const next = consoleSteps[consoleDeck.dataset.step][2];
  if (!next) return;

  showConsoleStep(next);
  if (next === "booting") {
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360;
    launchTimer = window.setTimeout(() => {
      if (consoleDialog.open) window.location.assign(consoleSkip.href);
    }, delay);
  }
});

consoleDeck.addEventListener("click", event => {
  if (event.target instanceof HTMLImageElement) consoleAction.click();
});

consoleDialog.addEventListener("close", () => {
  window.clearTimeout(launchTimer);
  opener?.focus({ preventScroll: true });
});

window.addEventListener("pageshow", event => {
  if (event.persisted && consoleDialog.open) consoleDialog.close();
});
