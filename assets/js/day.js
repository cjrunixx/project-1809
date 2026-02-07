/* ==============================
   DAY PAGE (SHARED) LOGIC
   ============================== */

(() => {
  const utils = window.ValentineUtils;
  if (!utils) return;

  if (!utils.requireProgress(["timelineDoneAt"], "../timeline.html")) return;

  const root = document.querySelector("[data-day-key]");
  if (!root) return;

  const dayKey = root.getAttribute("data-day-key");
  const monthIndex = Number.parseInt(root.getAttribute("data-unlock-month") || "", 10);
  const day = Number.parseInt(root.getAttribute("data-unlock-day") || "", 10);

  const year = utils.getSiteYear();
  const today = utils.startOfToday();
  const debugUnlock = utils.isDebug();

  const unlockDate = utils.makeLocalDate(year, Number.isFinite(monthIndex) ? monthIndex : 1, Number.isFinite(day) ? day : 1);
  const unlocked = debugUnlock || today.getTime() >= unlockDate.getTime();

  const content = document.getElementById("dayContent");
  const lockScreen = document.getElementById("lockScreen");
  const lockText = document.getElementById("lockText");

  const dateLabel = utils.formatMonthDay(unlockDate);

  if (!unlocked) {
    if (lockText) lockText.textContent = `This one unlocks on ${dateLabel}.`;
    if (lockScreen) lockScreen.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  utils.markDayVisited(dayKey);

  const note = document.getElementById("loveNote");
  const noteCover = document.getElementById("noteCover");
  const completeBtn = document.getElementById("completeBtn");
  const backBtn = document.getElementById("backBtn");

  function openNote() {
    if (note) note.classList.add("is-open");
    if (noteCover) noteCover.setAttribute("aria-expanded", "true");
  }

  if (noteCover) {
    noteCover.addEventListener("click", openNote);
    noteCover.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openNote();
      }
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      utils.markDayCompleted(dayKey);
      playTransition("fade", "../dashboard.html");
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      playTransition("fade", "../dashboard.html");
    });
  }
})();
