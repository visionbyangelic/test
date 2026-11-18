(() => {
  const dialog = document.getElementById("credentialLightbox");
  const image = document.getElementById("lightboxImage");
  const count = document.getElementById("lightboxCount");
  const close = document.getElementById("lightboxClose");
  const triggers = [...document.querySelectorAll("[data-full]")];

  const closeViewer = () => {
    if (dialog && dialog.open) dialog.close();
    document.body.classList.remove("lightbox-open");
  };

  triggers.forEach((item, index) => {
    item.addEventListener("click", () => {
      const fullSrc = item.getAttribute("data-full");
      if (!fullSrc) return;
      image.src = fullSrc;
      const innerImg = item.querySelector("img") || item;
      image.alt = innerImg.getAttribute("alt") || "Expanded archive asset";
      if (count) count.textContent = String(index + 1).padStart(2, "0");
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
    dialog.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeViewer();
  });
})();
