(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  const savedTheme = localStorage.getItem("angelic-theme");
  if (savedTheme === "light") root.dataset.theme = "light";

  const updateThemeControl = () => {
    const light = root.dataset.theme === "light";
    themeIcon.textContent = light ? "☾" : "☼";
    themeToggle.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme"
    );
    document.querySelector('meta[name="theme-color"]').content =
      light ? "#f1eee9" : "#100f14";
  };

  updateThemeControl();

  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("angelic-theme", root.dataset.theme);
    updateThemeControl();
  });

  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  menuToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // A slowly turning Möbius-like ribbon sculpture, drawn without external libraries.
  const canvas = document.getElementById("sculptureCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let rotation = 0;
  let lastTime = 0;
  let visible = true;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rotatePoint(point, ax, ay, az) {
    let { x, y, z } = point;
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cz = Math.cos(az);
    const sz = Math.sin(az);

    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;

    return {
      x: x1 * cz - y2 * sz,
      y: x1 * sz + y2 * cz,
      z: z2
    };
  }

  function project(point, scale) {
    const perspective = 3.8 / (3.8 - point.z);
    return {
      x: width * 0.5 + point.x * scale * perspective,
      y: height * 0.5 + point.y * scale * perspective,
      z: point.z
    };
  }

  function ribbonPoint(u, v, variant) {
    const twist = u * 0.5 + variant * 0.8;
    const radius = 1.12 + variant * 0.12;
    const band = v * 0.48;
    const radial = radius + band * Math.cos(twist);
    return {
      x: radial * Math.cos(u + variant * 1.7),
      y: radial * Math.sin(u + variant * 1.7),
      z: band * Math.sin(twist) + 0.18 * Math.sin(u * 2 + variant)
    };
  }

  function draw(time = 0) {
    if (!visible) return;
    ctx.clearRect(0, 0, width, height);

    const light = root.dataset.theme === "light";
    const ax = 0.56 + pointerY * 0.23;
    const ay = rotation + pointerX * 0.55;
    const az = -0.24 + pointerX * 0.13;
    const scale = Math.min(width, height) * (width < 520 ? 0.225 : 0.245);
    const quads = [];
    const bands = 2;
    const steps = 84;
    const across = 8;

    for (let band = 0; band < bands; band += 1) {
      const variant = band * 0.47;
      for (let i = 0; i < steps; i += 1) {
        const u0 = (i / steps) * Math.PI * 2;
        const u1 = ((i + 1) / steps) * Math.PI * 2;

        for (let j = 0; j < across; j += 1) {
          const v0 = -0.78 + (j / across) * 1.56;
          const v1 = -0.78 + ((j + 1) / across) * 1.56;
          const points = [
            ribbonPoint(u0, v0, variant),
            ribbonPoint(u1, v0, variant),
            ribbonPoint(u1, v1, variant),
            ribbonPoint(u0, v1, variant)
          ].map((point) => project(rotatePoint(point, ax, ay, az), scale));

          quads.push({
            points,
            depth: points.reduce((sum, point) => sum + point.z, 0) / 4,
            band,
            u: u0
          });
        }
      }
    }

    quads.sort((a, b) => a.depth - b.depth);

    quads.forEach((quad) => {
      const [a, b, c, d] = quad.points;
      const shade = clamp((quad.depth + 1.5) / 3, 0, 1);
      const hue = quad.band === 0 ? 270 : 34;
      const saturation = light ? 34 : 39;
      const lightness = (light ? 57 : 53) + shade * 15;

      const gradient = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
      gradient.addColorStop(
        0,
        `hsla(${hue}, ${saturation}%, ${lightness - 13}%, .78)`
      );
      gradient.addColorStop(
        0.52,
        `hsla(${hue + (quad.band ? 8 : -8)}, ${saturation + 10}%, ${lightness + 8}%, .9)`
      );
      gradient.addColorStop(
        1,
        `hsla(${hue}, ${saturation - 8}%, ${lightness - 18}%, .82)`
      );

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = light
        ? "rgba(62, 44, 73, .11)"
        : "rgba(241, 224, 255, .12)";
      ctx.lineWidth = 0.55;
      ctx.stroke();
    });

    // Fine contour lines give the object a crafted, machined surface.
    for (let band = 0; band < bands; band += 1) {
      for (let line = 0; line <= 8; line += 1) {
        const v = -0.78 + (line / 8) * 1.56;
        ctx.beginPath();

        for (let i = 0; i <= steps; i += 1) {
          const u = (i / steps) * Math.PI * 2;
          const point = project(
            rotatePoint(ribbonPoint(u, v, band * 0.47), ax, ay, az),
            scale
          );
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }

        ctx.strokeStyle = light
          ? "rgba(66, 47, 79, .27)"
          : "rgba(242, 226, 255, .3)";
        ctx.lineWidth = line === 4 ? 1.05 : 0.65;
        ctx.stroke();
      }
    }

  }

  function animate(time) {
    if (lastTime && time - lastTime < 16) {
      frame = requestAnimationFrame(animate);
      return;
    }
    lastTime = time;
    pointerX += (targetX - pointerX) * 0.055;
    pointerY += (targetY - pointerY) * 0.055;
    rotation += 0.0018;
    draw(time);
    frame = requestAnimationFrame(animate);
  }

  canvas.addEventListener("pointermove", (event) => {
    if (!finePointer) return;
    const bounds = canvas.getBoundingClientRect();
    targetX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    targetY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
  }, { passive: true });

  canvas.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !reducedMotion && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    } else if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { threshold: 0.05 });
  observer.observe(canvas);

  resize();
  if (reducedMotion) draw(0);
  else frame = requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) draw(0);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden && visible && !reducedMotion && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  });
})();
