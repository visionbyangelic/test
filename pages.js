(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const icon = toggle.querySelector(".theme-icon");

  const THEMES = ["dark", "pink", "light"];
  const NEXT_THEME = { dark: "pink", pink: "light", light: "dark" };
  const NEXT_ICON = { dark: "♥", pink: "☼", light: "☾" };

  const savedTheme = localStorage.getItem("angelic-theme");
  if (THEMES.includes(savedTheme)) {
    root.dataset.theme = savedTheme;
  }

  const currentTheme = () =>
    THEMES.includes(root.dataset.theme) ? root.dataset.theme : "dark";

  const paintTheme = () => {
    const current = currentTheme();
    icon.textContent = NEXT_ICON[current];
    toggle.setAttribute(
      "aria-label",
      "Switch to " + NEXT_THEME[current] + " theme"
    );
  };

  paintTheme();

  toggle.addEventListener("click", () => {
    root.dataset.theme = NEXT_THEME[currentTheme()];
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
