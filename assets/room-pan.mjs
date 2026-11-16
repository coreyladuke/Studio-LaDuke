// Keep tap targets active until a gesture crosses the drag threshold.
export function bindRoomPan(surface, { getPosition, setPosition, canPan, scale = 1 }) {
  let gesture;
  let suppressClickUntil = 0;

  surface.addEventListener("pointerdown", event => {
    if (gesture || !event.isPrimary || event.button !== 0) return;
    suppressClickUntil = 0;
    if (!canPan() || event.target.closest("input, textarea, select, [contenteditable]")) return;
    const target = event.target.closest("a, button");
    target?.classList.add("touching");
    gesture = {
      id: event.pointerId, target, x: event.clientX, y: event.clientY,
      position: getPosition(), dragging: false
    };
  });

  window.addEventListener("pointermove", event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging && Math.abs(dx) < 9) return;
    if (!gesture.dragging && Math.abs(dy) > Math.abs(dx)) return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      gesture.target?.classList.remove("touching");
      surface.classList.add("dragging");
      // Listen on the window even if WebKit drops capture on a moving hotspot.
      try { surface.setPointerCapture(event.pointerId); } catch {}
    }
    if (event.cancelable) event.preventDefault();
    setPosition(gesture.position + dx * scale);
  }, { passive: false });

  function endGesture(event) {
    if (!gesture || (event && event.pointerId !== gesture.id)) return;
    if (gesture.dragging) suppressClickUntil = performance.now() + 450;
    gesture.target?.classList.remove("touching");
    surface.classList.remove("dragging");
    gesture = null;
  }

  window.addEventListener("pointerup", endGesture);
  window.addEventListener("pointercancel", endGesture);
  window.addEventListener("blur", () => endGesture());
  surface.addEventListener("click", event => {
    if (!event.detail || performance.now() >= suppressClickUntil) return;
    suppressClickUntil = 0;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}
