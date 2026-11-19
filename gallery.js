(() => {
  const dialog = document.getElementById("credentialLightbox");
  const image = document.getElementById("lightboxImage");
  const count = document.getElementById("lightboxCount");
  const close = document.getElementById("lightboxClose");
  const fullscreen = document.getElementById("lightboxFullscreen");
  const hint = document.getElementById("lightboxHint");
  const stage = dialog ? dialog.querySelector(".lightbox-stage") : null;
  let videoEl = null;

  const setHint = (message) => { if (hint) hint.textContent = message; };

  const ensureVideo = () => {
    if (videoEl || !stage) return videoEl;
    videoEl = document.createElement("video");
    videoEl.id = "lightboxVideo";
    videoEl.controls = true;
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("webkit-playsinline", "");
    videoEl.preload = "auto";
    videoEl.style.cssText = "display:none;width:100%;height:auto;max-width:100%;max-height:calc(100dvh - 150px);object-fit:contain;border-radius:4px;background:#000";
    videoEl.addEventListener("error", () => setHint("VIDEO COULD NOT LOAD · CHECK CONNECTION AND TRY AGAIN"));
    videoEl.addEventListener("playing", () => setHint("PLAYING · USE VIDEO CONTROLS OR WATCH FULLSCREEN"));
    stage.appendChild(videoEl);
    return videoEl;
  };

  const closeViewer = () => {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    if (dialog && dialog.open) dialog.close();
    if (dialog) dialog.classList.remove("viewer-fullscreen");
    document.body.classList.remove("lightbox-open");
    if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();
      videoEl.style.display = "none";
    }
    if (image) {
      image.removeAttribute("src");
      image.style.display = "block";
    }
  };

  const openViewer = (item, index) => {
    const fullVideo = item.getAttribute("data-video");
    const fullImg = item.getAttribute("data-full");
    if (count) count.textContent = String(index + 1).padStart(2, "0");

    if (fullVideo) {
      const player = ensureVideo();
      if (!player) return;
      if (image) image.style.display = "none";
      player.style.display = "block";
      player.src = fullVideo;
      player.load();
      setHint("LOADING VIDEO · TAP WATCH FULLSCREEN FOR IMMERSIVE VIEW");
      if (dialog && !dialog.open && typeof dialog.showModal === "function") dialog.showModal();
      document.body.classList.add("lightbox-open");
      const playRequest = player.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => setHint("TAP PLAY ON THE VIDEO CONTROLS TO START PLAYBACK"));
      }
    } else if (fullImg) {
      if (videoEl) {
        videoEl.pause();
        videoEl.style.display = "none";
      }
      if (image) {
        image.style.display = "block";
        image.src = fullImg;
        const innerImg = item.querySelector("img") || item;
        image.alt = innerImg.getAttribute("alt") || "Expanded archive asset";
      }
      setHint("ESC TO CLOSE · CLICK OUTSIDE TO RETURN");
      if (dialog && !dialog.open && typeof dialog.showModal === "function") dialog.showModal();
      document.body.classList.add("lightbox-open");
    }
  };

  document.querySelectorAll("[data-full], [data-video]").forEach((item, index) => {
    item.addEventListener("click", () => openViewer(item, index));
  });

  if (fullscreen) fullscreen.addEventListener("click", () => {
    if (!videoEl) return;
    // iOS Safari exposes native fullscreen through this prefixed video method.
    if (typeof videoEl.webkitEnterFullscreen === "function") {
      try { videoEl.webkitEnterFullscreen(); return; } catch (_) {}
    }
    if (typeof videoEl.requestFullscreen === "function") {
      videoEl.requestFullscreen().catch(() => {
        if (dialog) dialog.classList.toggle("viewer-fullscreen");
      });
      return;
    }
    // Keep a usable full-window viewer on browsers without a video fullscreen API.
    if (dialog) dialog.classList.toggle("viewer-fullscreen");
  });

  if (close) close.addEventListener("click", closeViewer);
  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeViewer();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      if (videoEl) { videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog && dialog.open) closeViewer();
  });
})();