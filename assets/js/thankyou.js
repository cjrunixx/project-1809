/* ==============================
   THANK YOU (FINAL PAGE) LOGIC
   ============================== */

(() => {
  const utils = window.ValentineUtils;
  if (!utils) return;

  // This page makes sense after the timeline/dashboard.
  if (!utils.requireProgress(["timelineDoneAt"], "timeline.html")) return;

  const root = document.body;
  const monthIndex = Number.parseInt(root.getAttribute("data-unlock-month") || "", 10);
  const day = Number.parseInt(root.getAttribute("data-unlock-day") || "", 10);

  const year = utils.getSiteYear();
  const today = utils.startOfToday();
  const debugUnlock = utils.isDebug();

  const unlockDate = utils.makeLocalDate(
    year,
    Number.isFinite(monthIndex) ? monthIndex : 1,
    Number.isFinite(day) ? day : 14
  );

  const unlocked = debugUnlock || today.getTime() >= unlockDate.getTime();

  const lockScreen = document.getElementById("lockScreen");
  const lockText = document.getElementById("lockText");
  const content = document.getElementById("thankyouContent");
  const backBtn = document.getElementById("backBtn");

  const dateLabel = utils.formatMonthDay(unlockDate);

  if (!unlocked) {
    if (lockText) lockText.textContent = `This unlocks on ${dateLabel}.`;
    if (lockScreen) lockScreen.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  backBtn?.addEventListener("click", () => {
    playTransition("fade", "dashboard.html");
  });

  const recapGrid = document.getElementById("recapGrid");
  const recapLine = document.getElementById("recapLine");

  const DAYS = [
    { key: "rose", title: "Rose Day", emoji: "🌹" },
    { key: "propose", title: "Propose Day", emoji: "💍" },
    { key: "chocolate", title: "Chocolate Day", emoji: "🍫" },
    { key: "teddy", title: "Teddy Day", emoji: "🧸" },
    { key: "promise", title: "Promise Day", emoji: "🤝" },
    { key: "hug", title: "Hug Day", emoji: "🫂" },
    { key: "kiss", title: "Kiss Day", emoji: "💋" },
  ];

  const progress = utils.getProgress();
  const completed = progress.completedDays || {};
  const completedCount = DAYS.filter((d) => Boolean(completed[d.key])).length;

  if (recapGrid) {
    recapGrid.innerHTML = "";
    for (const dayInfo of DAYS) {
      const isComplete = Boolean(completed[dayInfo.key]);
      const pill = document.createElement("div");
      pill.className = `recap-pill${isComplete ? " complete" : ""}`;
      pill.innerHTML = `
        <div class="left">
          <div class="emoji" aria-hidden="true">${dayInfo.emoji}</div>
          <div>${dayInfo.title}</div>
        </div>
        <div aria-hidden="true">${isComplete ? "✅" : "💗"}</div>
      `;
      recapGrid.appendChild(pill);
    }
  }

  if (recapLine) {
    recapLine.textContent =
      completedCount === 7
        ? "All 7 saved. You made my heart very, very happy."
        : `Saved: ${completedCount}/7 — and every single one means something to me.`;
  }
})();

