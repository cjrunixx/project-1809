/* ==============================
   PASSWORD PAGE LOGIC
   ============================== */

(() => {
  const correctPassword = ["I LOVE YOU","i love you","ILOVEYOU","iloveyou"]; // 🔐 CHANGE THIS
  let attempts = 0;

  const utils = window.ValentineUtils;

  const input = document.getElementById("passwordInput");
  const button = document.getElementById("unlockBtn");
  const hintText = document.getElementById("hintText");

  const hints = [
    "Spaces are important 😉",
    "Yarr ye to apko khud krna pdega 💕",
    "heheh... krloge aap mountabu"
  ];

  button.addEventListener("click", checkPassword);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
  });

  function checkPassword() {
    const entered = input.value.trim();

    if (!entered) return;

    const ok = Array.isArray(correctPassword)
      ? correctPassword.includes(entered)
      : entered === correctPassword;

    if (ok) {
      hintText.textContent = "I LOVE YOU ❤️";
      utils?.updateProgress?.({ unlockedAt: Date.now(), year: utils.getSiteYear?.() });
      playTransition("fade", "proposal.html");
    } else {
      attempts++;
      input.value = "";

      if (attempts >= 2 && attempts <= 4) {
        hintText.textContent = hints[attempts - 2];
      } else if (attempts > 4) {
        hintText.textContent = "Need a hint? Naa ye to apko guess krna pdega";
      } else {
        hintText.textContent = "kosish krte rho";
      }
    }
  }
})();
