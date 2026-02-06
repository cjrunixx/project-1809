/* ==============================
   PROPOSAL PAGE LOGIC
   ============================== */

(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const message = document.getElementById("noMessage");
  const utils = window.ValentineUtils;

  if (!utils?.requireProgress?.(["unlockedAt"], "index.html")) return;

  const playfulMessages = [
    "Nice try hahahaha 😌",
    "Just click YES na 🙃",
    "Nahiiiiii",
    "Babu just click YES ",
  ];

  let noCount = 0;

  // YES → Balloon + heart transition
  yesBtn.addEventListener("click", () => {
    utils?.updateProgress?.({ saidYesAt: Date.now() });
    playTransition("hearts", "timeline.html");
  });

  // NO → Move button + playful text
  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("click", moveNoButton);

  function moveNoButton() {
  noCount++;

  const area = document.querySelector(".button-area");
  const areaRect = area.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = areaRect.width - btnRect.width;
  const maxY = areaRect.height - btnRect.height;

  const distance = Math.min(50 + noCount * 30, maxX / 0.9);

  let x = Math.random() * distance * (Math.random() > 0.5 ? 1 : -1);
  let y = Math.random() * distance * (Math.random() > 0.5 ? 1 : -1);

  // Clamp movement inside area
  x = Math.max(-maxX / 2, Math.min(x, maxX / 2));
  y = Math.max(-maxY / 2, Math.min(y, maxY / 2));

  noBtn.style.transform = `translate(${x}px, ${y}px)`;

  message.textContent =
    playfulMessages[noCount % playfulMessages.length];
}



})();
