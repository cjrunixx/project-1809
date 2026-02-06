/* ==============================
   CURSOR + HEART TRAIL
   ============================== */

(() => {
  const canUseTrail =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canUseTrail) return;

  const hearts = ["💖", "💗", "💘", "💕", "❤"];
  let last = 0;

  function spawn(x, y) {
    const el = document.createElement("span");
    el.className = "heart-trail";
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${Math.round(Math.random() * 26 - 13)}px`);
    el.style.setProperty("--rot", `${Math.round(Math.random() * 24 - 12)}deg`);

    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 1000);
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      const now = performance.now();
      if (now - last < 24) return;
      last = now;
      spawn(e.clientX, e.clientY);
    },
    { passive: true }
  );
})();
