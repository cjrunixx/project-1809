/* ==============================
   TIMELINE PAGE LOGIC
   ============================== */

(() => {
  const utils = window.ValentineUtils;

  // Gentle gating: this page makes sense after "YES".
  if (!utils?.requireProgress?.(["saidYesAt"], "proposal.html")) return;

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

  function attachPhotoReveal(media) {
    const src = media.getAttribute("data-photo-src");
    const img = media.querySelector(".moment-media-img");
    if (!src || !img) return;

    img.addEventListener("load", () => {
      media.classList.add("has-image");
    });

    // If the file doesn't exist, keep the placeholder without spamming the console.
    img.addEventListener("error", () => {
      media.classList.remove("has-image");
    });

    img.src = src;

    // If the image is already in cache, "load" may have fired before our observer sees it.
    if (img.complete && img.naturalWidth > 0) {
      media.classList.add("has-image");
    }

    const toggle = () => {
      if (!media.classList.contains("has-image")) return;
      img.classList.toggle("is-blurred");
    };

    media.addEventListener("click", toggle);
    media.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  }

  function attachVideoReveal(media) {
    const src = media.getAttribute("data-video-src");
    const video = media.querySelector(".moment-media-video");
    if (!src || !video) return;

    video.addEventListener(
      "loadedmetadata",
      () => {
        media.classList.add("has-video");
      },
      { once: true }
    );

    // If the file doesn't exist, keep the placeholder without spamming the console.
    video.addEventListener("error", () => {
      media.classList.remove("has-video");
    });

    video.src = src;
    video.load();

    if (video.readyState >= 1) {
      media.classList.add("has-video");
    }

    const reveal = () => {
      if (!media.classList.contains("has-video")) return;
      if (!video.classList.contains("is-blurred")) return;
      video.classList.remove("is-blurred");
    };

    // Reveal once, then let the native controls handle clicks.
    media.addEventListener("click", reveal);
    media.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal();
      }
    });
  }

  document.querySelectorAll("[data-photo-src]").forEach(attachPhotoReveal);
  document.querySelectorAll("[data-video-src]").forEach(attachVideoReveal);

  const toDashboardBtn = document.getElementById("toDashboardBtn");
  toDashboardBtn?.addEventListener("click", () => {
    utils?.updateProgress?.({ timelineDoneAt: Date.now() });
    playTransition("hearts", "dashboard.html");
  });
})();
