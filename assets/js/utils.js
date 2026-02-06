/* ==============================
   SHARED HELPERS (GLOBAL)
   ============================== */

(() => {
  const PROGRESS_KEY = "valentine_progress_v1";
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function safeJsonParse(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function isPlainObject(value) {
    return value != null && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(target, patch) {
    if (!isPlainObject(target) || !isPlainObject(patch)) return patch;
    const next = { ...target };

    for (const [key, value] of Object.entries(patch)) {
      if (isPlainObject(value) && isPlainObject(next[key])) {
        next[key] = deepMerge(next[key], value);
      } else {
        next[key] = value;
      }
    }

    return next;
  }

  function defaultProgress() {
    return {
      year: new Date().getFullYear(),
      unlockedAt: null,
      saidYesAt: null,
      timelineDoneAt: null,
      visitedDays: {},
      completedDays: {},
    };
  }

  function getProgress() {
    const stored = safeJsonParse(localStorage.getItem(PROGRESS_KEY));
    const base = defaultProgress();

    if (!isPlainObject(stored)) return base;

    return {
      ...base,
      ...stored,
      visitedDays: {
        ...base.visitedDays,
        ...(isPlainObject(stored.visitedDays) ? stored.visitedDays : {}),
      },
      completedDays: {
        ...base.completedDays,
        ...(isPlainObject(stored.completedDays) ? stored.completedDays : {}),
      },
    };
  }

  function setProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return progress;
  }

  function updateProgress(patch) {
    const current = getProgress();
    const next = deepMerge(current, patch);
    return setProgress(next);
  }

  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  function isDebug() {
    const params = getQueryParams();
    return params.get("debug") === "1" || params.get("unlock") === "1";
  }

  function getSiteYear() {
    const params = getQueryParams();
    const yearParam = params.get("year");
    const year = yearParam ? Number.parseInt(yearParam, 10) : NaN;
    if (Number.isFinite(year) && year >= 2000 && year <= 2100) return year;

    const progressYear = getProgress().year;
    if (Number.isFinite(progressYear) && progressYear >= 2000 && progressYear <= 2100) return progressYear;

    return new Date().getFullYear();
  }

  function makeLocalDate(year, monthIndex, day) {
    return new Date(year, monthIndex, day, 0, 0, 0, 0);
  }

  function startOfToday() {
    const now = new Date();
    return makeLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function daysUntil(targetDate) {
    const today = startOfToday();
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / MS_PER_DAY);
  }

  function formatMonthDay(date) {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  }

  function requireProgress(requiredKeys, redirectUrl) {
    if (isDebug()) return true;

    const progress = getProgress();
    const missing = requiredKeys.some((key) => !progress[key]);
    if (!missing) return true;

    if (redirectUrl) window.location.replace(redirectUrl);
    return false;
  }

  function markDayVisited(dayKey) {
    if (!dayKey) return;
    updateProgress({ visitedDays: { [dayKey]: Date.now() } });
  }

  function markDayCompleted(dayKey) {
    if (!dayKey) return;
    updateProgress({ completedDays: { [dayKey]: Date.now() } });
  }

  window.ValentineUtils = {
    PROGRESS_KEY,
    getProgress,
    setProgress,
    updateProgress,
    isDebug,
    getSiteYear,
    makeLocalDate,
    startOfToday,
    daysUntil,
    formatMonthDay,
    requireProgress,
    markDayVisited,
    markDayCompleted,
  };
})();
