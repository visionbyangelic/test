(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const icon = toggle.querySelector(".theme-icon");

  if (localStorage.getItem("angelic-theme") === "light") {
    root.dataset.theme = "light";
  }

  const paintTheme = () => {
    const isLight = root.dataset.theme === "light";
    icon.textContent = isLight ? "☾" : "☼";
    toggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
  };

  paintTheme();

  toggle.addEventListener("click", () => {
    root.dataset.theme =
      root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("angelic-theme", root.dataset.theme);
    paintTheme();
  });

  const menu = document.getElementById("menuToggle");
  const nav = document.getElementById("mobileNav");

  menu.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    });
  });

  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();
})();
