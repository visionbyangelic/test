(() => {
  const dialog = document.getElementById("credentialLightbox");
  const image = document.getElementById("lightboxImage");
  const count = document.getElementById("lightboxCount");
  const close = document.getElementById("lightboxClose");
  const stage = dialog ? dialog.querySelector(".lightbox-stage") : null;

  let videoEl = null;

  const closeViewer = () => {
    if (dialog && dialog.open) dialog.close();
    document.body.classList.remove("lightbox-open");
    if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.style.display = "none";
    }
    if (image) {
      image.removeAttribute("src");
      image.style.display = "block";
    }
  };

  const triggers = [...document.querySelectorAll("[data-full], [data-video]")];

  triggers.forEach((item, index) => {
    item.addEventListener("click", () => {
      const fullVideo = item.getAttribute("data-video");
      const fullImg = item.getAttribute("data-full");

      if (count) count.textContent = String(index + 1).padStart(2, "0");

      if (fullVideo) {
        if (!videoEl && stage) {
          videoEl = document.createElement("video");
          videoEl.id = "lightboxVideo";
          videoEl.controls = true;
          videoEl.autoplay = true;
          videoEl.loop = true;
          videoEl.playsInline = true;
          videoEl.style.maxWidth = "100%";
          videoEl.style.maxHeight = "78vh";
          videoEl.style.borderRadius = "4px";
          videoEl.style.background = "#000";
          stage.appendChild(videoEl);
        }
        if (image) image.style.display = "none";
        if (videoEl) {
          videoEl.style.display = "block";
          videoEl.src = fullVideo;
          videoEl.play().catch(() => {});
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
      }

      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
        document.body.classList.add("lightbox-open");
      }
    });
  });

  if (close) close.addEventListener("click", closeViewer);
  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeViewer();
    });
    dialog.addEventListener("close", closeViewer);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeViewer();
  });
})();
