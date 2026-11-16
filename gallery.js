(() => {
  const dialog = document.getElementById("credentialLightbox");
  const image = document.getElementById("lightboxImage");
  const count = document.getElementById("lightboxCount");
  const close = document.getElementById("lightboxClose");
  const cards = [...document.querySelectorAll(".credential-card")];

  const closeViewer = () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove("lightbox-open");
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      image.src = card.dataset.full;
      image.alt = card.querySelector("img").alt;
      count.textContent = String(index + 1).padStart(2, "0");
      dialog.showModal();
      document.body.classList.add("lightbox-open");
    });
  });

  close.addEventListener("click", closeViewer);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") document.body.classList.remove("lightbox-open");
  });
})();