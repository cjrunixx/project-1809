/* ==============================
   MUSIC CONTROLLER (GLOBAL)
   Persists toggle via localStorage.
   ============================== */

(() => {
  const STORAGE_KEY = "valentine_music_v1";

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return { enabled: false, volume: 0.55 };
      return {
        enabled: Boolean(parsed.enabled),
        volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(1, parsed.volume)) : 0.55,
      };
    } catch {
      return { enabled: false, volume: 0.55 };
    }
  }

  function writeState(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function pageFile() {
    const parts = window.location.pathname.split("/");
    return parts[parts.length - 1] || "";
  }

  function inDaysFolder() {
    return /\/days\/[^/]+\.html$/i.test(window.location.pathname);
  }

  function resolveTrackSrc() {
    const file = pageFile().toLowerCase();
    const prefix = inDaysFolder() ? "../assets/audio/" : "assets/audio/";

    if (file === "proposal.html") return `${prefix}proposal.mp3`;
    if (file === "timeline.html") return `${prefix}timeline.mp3`;
    if (file === "dashboard.html") return `${prefix}dashboard.mp3`;
    if (file === "thankyou.html") return `${prefix}thankyou.mp3`;

    if (inDaysFolder()) {
      const base = file.replace(/\.html$/i, "");
      if (!base) return null;
      return `${prefix}${base}.mp3`;
    }

    return null;
  }

  const trackSrc = resolveTrackSrc();
  if (!trackSrc) return;

  const state = readState();

  const audio = document.createElement("audio");
  audio.src = trackSrc;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = state.volume;

  document.body.appendChild(audio);

  const controls = document.createElement("div");
  controls.className = "floating-controls";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "music-toggle";
  toggle.setAttribute("aria-label", "Toggle music");
  toggle.textContent = "♪";

  controls.appendChild(toggle);
  document.body.appendChild(controls);

  function setToggleUI(enabled) {
    toggle.classList.toggle("is-on", enabled);
    toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggle.title = enabled ? "Music: on" : "Music: off";
  }

  async function tryPlay() {
    try {
      await audio.play();
    } catch {
      // Autoplay can be blocked until the user interacts; we'll retry on first gesture.
    }
  }

  function enable() {
    const next = { ...state, enabled: true };
    state.enabled = true;
    writeState(next);
    setToggleUI(true);
    tryPlay();
  }

  function disable() {
    const next = { ...state, enabled: false };
    state.enabled = false;
    writeState(next);
    setToggleUI(false);
    audio.pause();
  }

  toggle.addEventListener("click", () => {
    if (state.enabled) disable();
    else enable();
  });

  // If the user previously enabled music, attempt to resume.
  setToggleUI(state.enabled);
  if (state.enabled) {
    tryPlay();
    const resumeOnce = () => {
      if (!state.enabled || !audio.paused) return;
      tryPlay();
    };
    window.addEventListener("pointerdown", resumeOnce, { once: true, passive: true });
  }
})();
