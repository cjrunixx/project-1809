/* =================================
   TRANSITION ENGINE (GLOBAL)
   Supports: fade | hearts | balloons
   ================================= */

(() => {
  let isTransitioning = false;

  const DURATIONS_MS = {
    fade: 600,
    hearts: 1250,
    balloons: 1100,
  };

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function createOverlay() {
    let overlay = document.getElementById("transition-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "transition-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function resetOverlay(overlay) {
    overlay.className = "";
    overlay.innerHTML = "";
  }

  function navigate(targetUrl) {
    window.location.href = targetUrl;
  }

  function after(ms, fn) {
    window.setTimeout(fn, ms);
  }

  function playFadeTransition(targetUrl, durationMs = DURATIONS_MS.fade) {
    const overlay = createOverlay();
    resetOverlay(overlay);
    overlay.className = "fade-overlay";

    // Force reflow so the transition reliably triggers.
    void overlay.offsetWidth;

    overlay.classList.add("active");
    after(durationMs, () => navigate(targetUrl));
  }

  function playHeartsCurtainTransition(targetUrl) {
    const overlay = createOverlay();
    resetOverlay(overlay);
    overlay.className = "hearts-curtain-overlay";

    const fragment = document.createDocumentFragment();

    // Dense enough to feel like a “curtain”, but not so many that it lags.
    const columns = 22;
    const rows = 14;
    const total = columns * rows;

    for (let i = 0; i < total; i++) {
      const heart = document.createElement("div");
      heart.className = "css-heart";

      const size = Math.round(Math.random() * 10 + 12); // px
      heart.style.setProperty("--heart-size", `${size}px`);
      heart.style.setProperty("--heart-half", `${Math.round(size / 2)}px`);

      const col = i % columns;
      const row = Math.floor(i / columns);

      heart.style.left = `${(col / (columns - 1)) * 100}%`;
      heart.style.bottom = `${-18 - row * 10}%`;
      heart.style.animationDelay = `${Math.random() * 0.35}s`;

      fragment.appendChild(heart);
    }

    overlay.appendChild(fragment);

    after(DURATIONS_MS.hearts, () => navigate(targetUrl));
  }

  function playBalloonTransition(targetUrl) {
    const overlay = createOverlay();
    resetOverlay(overlay);
    overlay.className = "balloon-overlay";

    const fragment = document.createDocumentFragment();
    const count = 28;

    const colors = ["#ff4d6d", "#ffafcc", "#ffc8dd", "#f8cdda", "#cdb4db"];

    for (let i = 0; i < count; i++) {
      const balloon = document.createElement("div");
      balloon.className = "balloon";

      const size = Math.round(Math.random() * 26 + 26); // px
      const left = Math.random() * 100;
      const delay = Math.random() * 0.25;
      const duration = Math.random() * 0.6 + 1.9;

      balloon.style.width = `${size}px`;
      balloon.style.height = `${size * 1.2}px`;
      balloon.style.left = `${left}%`;
      balloon.style.background = colors[i % colors.length];
      balloon.style.animationDelay = `${delay}s`;
      balloon.style.animationDuration = `${duration}s`;

      fragment.appendChild(balloon);
    }

    overlay.appendChild(fragment);

    after(DURATIONS_MS.balloons, () => navigate(targetUrl));
  }

  function normalizeType(type) {
    if (!type) return "fade";
    const t = String(type).toLowerCase();
    if (t === "heart" || t === "hearts" || t === "heart-curtain" || t === "curtain") return "hearts";
    if (t === "balloon" || t === "balloons") return "balloons";
    if (t === "fade") return "fade";
    return "fade";
  }

  window.playTransition = function playTransition(type, targetUrl) {
    if (isTransitioning) return;
    isTransitioning = true;

    if (!targetUrl) {
      console.error("Transition target URL missing");
      isTransitioning = false;
      return;
    }

    // Accessibility: respect reduced motion.
    if (prefersReducedMotion()) {
      playFadeTransition(targetUrl, 250);
      return;
    }

    const normalized = normalizeType(type);
    if (normalized === "hearts") {
      playHeartsCurtainTransition(targetUrl);
      return;
    }

    if (normalized === "balloons") {
      playBalloonTransition(targetUrl);
      return;
    }

    playFadeTransition(targetUrl);
  };
})();
