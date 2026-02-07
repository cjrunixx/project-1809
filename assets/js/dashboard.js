/* ==============================
   DASHBOARD PAGE LOGIC
   ============================== */

(() => {
  const utils = window.ValentineUtils;

  if (!utils) return;

  // Gentle gating: dashboard comes after the timeline.
  if (!utils.requireProgress(["timelineDoneAt"], "timeline.html")) return;

  const progress = utils.getProgress();
  const year = utils.getSiteYear();
  const today = utils.startOfToday();
  const debugUnlock = utils.isDebug();

  const DAYS = [
    { key: "rose", title: "Rose Day", emoji: "🌹", monthIndex: 1, day: 7, href: "days/rose.html", desc: "A small “I thought of you.”" },
    { key: "propose", title: "Propose Day", emoji: "💍", monthIndex: 1, day: 8, href: "days/propose.html", desc: "One sweet little promise." },
    { key: "chocolate", title: "Chocolate Day", emoji: "🍫", monthIndex: 1, day: 9, href: "days/chocolate.html", desc: "A treat + a tender note." },
    { key: "teddy", title: "Teddy Day", emoji: "🧸", monthIndex: 1, day: 10, href: "days/teddy.html", desc: "Something soft and safe." },
    { key: "promise", title: "Promise Day", emoji: "🤝", monthIndex: 1, day: 11, href: "days/promise.html", desc: "A vow I want to keep." },
    { key: "hug", title: "Hug Day", emoji: "🫂", monthIndex: 1, day: 12, href: "days/hug.html", desc: "A warm, long, quiet hug." },
    { key: "kiss", title: "Kiss Day", emoji: "💋", monthIndex: 1, day: 13, href: "days/kiss.html", desc: "A blush + a smile." },
  ];

  const FINAL = {
    key: "thankyou",
    title: "Final Thank You",
    emoji: "💌",
    monthIndex: 1,
    day: 14,
    href: "thankyou.html",
    desc: "A note for Valentine’s Day.",
  };

  const daysGrid = document.getElementById("daysGrid");
  const finalCard = document.getElementById("finalCard");
  const progressLine = document.getElementById("progressLine");
  const toast = document.getElementById("toast");
  const devPanel = document.getElementById("devPanel");
  const resetBtn = document.getElementById("resetBtn");

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function lockLine(unlockDate) {
    const remaining = utils.daysUntil(unlockDate);
    if (remaining <= 0) return "Unlocks today";
    if (remaining === 1) return "Unlocks tomorrow";
    return `Unlocks in ${remaining} days`;
  }

  function isUnlocked(unlockDate) {
    return debugUnlock || today.getTime() >= unlockDate.getTime();
  }

  function statusEmoji({ unlocked, complete }) {
    if (complete) return "✅";
    if (!unlocked) return "🔒";
    return "💗";
  }

  function buildDayCard(day) {
    const unlockDate = utils.makeLocalDate(year, day.monthIndex, day.day);
    const unlocked = isUnlocked(unlockDate);
    const complete = Boolean((progress.completedDays || {})[day.key]);

    const card = document.createElement("a");
    card.className = "day-card";
    card.dataset.dayKey = day.key;

    if (!unlocked) card.classList.add("is-locked");
    if (complete) card.classList.add("is-complete");

    card.href = unlocked ? day.href : "#";
    if (!unlocked) {
      card.setAttribute("aria-disabled", "true");
      card.setAttribute("role", "link");
    }

    const dateLabel = utils.formatMonthDay(unlockDate);

    card.innerHTML = `
      <div class="day-top">
        <div class="day-emoji" aria-hidden="true">${day.emoji}</div>
        <div class="day-status" aria-hidden="true">${statusEmoji({ unlocked, complete })}</div>
      </div>
      <h2>${day.title}</h2>
      <p class="day-date">${dateLabel}</p>
      <p class="day-desc">${day.desc}</p>
      <p class="day-lockline">${unlocked ? (complete ? "Saved in our little collection." : "Open when you’re ready.") : lockLine(unlockDate)}</p>
    `;

    card.addEventListener("click", (e) => {
      if (unlocked) return;
      e.preventDefault();
      showToast(`Not yet — come back on ${dateLabel}.`);
    });

    return card;
  }

  function buildFinalCard() {
    const unlockDate = utils.makeLocalDate(year, FINAL.monthIndex, FINAL.day);
    const unlocked = isUnlocked(unlockDate);

    const card = document.createElement("a");
    card.className = "final-card";
    card.href = unlocked ? FINAL.href : "#";

    if (!unlocked) card.classList.add("is-locked");

    const dateLabel = utils.formatMonthDay(unlockDate);

    card.innerHTML = `
      <div class="final-left">
        <h2>${FINAL.emoji} ${FINAL.title}</h2>
        <p>${FINAL.desc} • ${dateLabel}</p>
      </div>
      <div class="final-status" aria-hidden="true">${unlocked ? "✨" : "🔒"}</div>
    `;

    card.addEventListener("click", (e) => {
      if (unlocked) return;
      e.preventDefault();
      showToast(`This unlocks on ${dateLabel}.`);
    });

    return card;
  }

  function render() {
    if (!daysGrid || !finalCard) return;

    daysGrid.innerHTML = "";
    for (const day of DAYS) {
      daysGrid.appendChild(buildDayCard(day));
    }

    finalCard.innerHTML = "";
    finalCard.appendChild(buildFinalCard());

    const completedCount = Object.keys(progress.completedDays || {}).length;
    if (progressLine) {
      progressLine.textContent =
        completedCount > 0 ? `Collected: ${Math.min(completedCount, 7)}/7` : "Your week is waiting.";
    }

    if (debugUnlock && devPanel) {
      devPanel.hidden = false;
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (utils && typeof utils.clearProgress === "function") {
        utils.clearProgress();
      } else {
        try {
          localStorage.removeItem(utils.PROGRESS_KEY);
        } catch {
          // ignore
        }
      }
      window.location.reload();
    });
  }

  render();
})();
