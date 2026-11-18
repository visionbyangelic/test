(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const desktopPointer = window.matchMedia(
    "(pointer: fine) and (min-width: 900px)"
  ).matches;

  document.documentElement.classList.add("motion-ready");

  // Reveal page content as it enters view, with a restrained stagger.
  const revealTargets = document.querySelectorAll([
    ".page-intro",
    ".research-feature",
    ".research-row",
    ".research-stack > div",
    ".engineering-projects > a",
    ".text-article",
    ".editorial-blender",
    ".editorial-note",
    ".gallery-chapter",
    ".about-statement",
    ".fact",
    ".now-main",
    ".calendar-panel",
    ".home-explore > *"
  ].join(","));

  revealTargets.forEach((element, index) => {
    element.setAttribute("data-reveal", "");
    element.style.setProperty(
      "--reveal-delay",
      `${(index % 5) * 75}ms`
    );
  });

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -45px 0px"
    });

    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  // Soft pointer light on the neural artwork.
  if (desktopPointer && !reducedMotion) {
    const artwork = document.querySelector(".hero-art");
    if (artwork) {
      window.addEventListener("pointermove", (event) => {
        const bounds = artwork.getBoundingClientRect();
        artwork.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        artwork.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      }, { passive: true });
    }
  }

  // Slight image movement on desktop; the gallery composition remains fixed.
  if (desktopPointer && !reducedMotion) {
    document.querySelectorAll(
      ".gallery-creature-grid img, .gallery-environment-grid img"
    ).forEach((image) => {
      const frame = image.parentElement;

      frame.addEventListener("pointermove", (event) => {
        const bounds = frame.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        image.style.transform =
          `scale(1.035) translate(${x * 5}px, ${y * 5}px)`;
      });

      frame.addEventListener("pointerleave", () => {
        image.style.transform = "";
      });
    });
  }

  // Cinematic transition fallback for browsers without cross-document transitions.
  if (!reducedMotion) {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented) return;

      if (
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.hash
      ) return;
      if (!/\.html?$/.test(destination.pathname)) return;

      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.assign(destination.href);
      }, 280);
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      document.body.classList.remove("is-leaving");
    }
  });
})();
