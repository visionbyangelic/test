(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  const THEMES = ["dark", "pink", "light"];
  const NEXT_THEME = { dark: "pink", pink: "light", light: "dark" };
  const NEXT_ICON = { dark: "♥", pink: "☼", light: "☾" };
  const THEME_COLOR = { dark: "#100f14", pink: "#fdeef4", light: "#f1eee9" };

  const savedTheme = localStorage.getItem("angelic-theme");
  if (THEMES.includes(savedTheme)) root.dataset.theme = savedTheme;

  const currentTheme = () =>
    THEMES.includes(root.dataset.theme) ? root.dataset.theme : "dark";

  const updateThemeControl = () => {
    const current = currentTheme();
    themeIcon.textContent = NEXT_ICON[current];
    themeToggle.setAttribute(
      "aria-label",
      "Switch to " + NEXT_THEME[current] + " theme"
    );
    document.querySelector('meta[name="theme-color"]').content =
      THEME_COLOR[current];
  };

  updateThemeControl();

  themeToggle.addEventListener("click", () => {
    root.dataset.theme = NEXT_THEME[currentTheme()];
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

  // 3D Neural Connectome & Synapse Simulation (Drosophila Connectome / FlyWire Model)
  const canvas = document.getElementById("sculptureCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = window.matchMedia("(max-width: 760px)").matches;
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
  let pitch = 0.2;
  let lastTime = 0;
  let visible = true;
  let mouseClientX = -9999;
  let mouseClientY = -9999;
  let hoveredNode = -1;
  let stimulationWave = 0;
  let stimulusOrigin = { x: 0, y: 0 };
  let stimulusLabel = "";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Deterministic PRNG for consistent, reproducible brain anatomy
  let seed = 42;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // Construct bilateral brain morphology: Neuropil clusters
  const regions = [
    { name: "Central Complex (FB/EB)", cx: 0.22, cy: 0.05, cz: -0.05, rx: 0.22, ry: 0.25, rz: 0.18, count: 14, color: [255, 110, 180] },
    { name: "Mushroom Body (MB)", cx: 0.42, cy: 0.35, cz: 0.22, rx: 0.25, ry: 0.32, rz: 0.24, count: 12, color: [199, 166, 236] },
    { name: "Protocerebrum", cx: 0.65, cy: -0.22, cz: 0.45, rx: 0.35, ry: 0.38, rz: 0.28, count: 14, color: [168, 130, 255] },
    { name: "Antennal Lobe (AL)", cx: 0.48, cy: 0.72, cz: -0.25, rx: 0.26, ry: 0.28, rz: 0.22, count: 10, color: [56, 189, 248] },
    { name: "Optic Lobe (Medulla/Lobula)", cx: 1.05, cy: 0.15, cz: 0.05, rx: 0.26, ry: 0.42, rz: 0.32, count: 16, color: [129, 140, 248] },
    { name: "Subesophageal Zone (SEZ)", cx: 0.28, cy: -0.45, cz: -0.42, rx: 0.25, ry: 0.26, rz: 0.24, count: 10, color: [244, 114, 182] }
  ];

  const nodes = [];
  regions.forEach((reg) => {
    for (let i = 0; i < reg.count; i++) {
      const u = random() * Math.PI * 2;
      const v = (random() - 0.5) * Math.PI;
      const d = Math.pow(random(), 0.6);
      const dx = d * reg.rx * Math.cos(u) * Math.cos(v);
      const dy = d * reg.ry * Math.sin(u) * Math.cos(v);
      const dz = d * reg.rz * Math.sin(v);

      const x = reg.cx + dx;
      const y = reg.cy + dy;
      const z = reg.cz + dz;

      // Left Hemisphere
      nodes.push({
        x: -x, y, z,
        region: reg.name,
        hemi: "L",
        color: reg.color,
        activity: random() * 0.4,
        size: 2.2 + random() * 2.2
      });
      // Right Hemisphere (Mirror)
      nodes.push({
        x: x, y, z,
        region: reg.name,
        hemi: "R",
        color: reg.color,
        activity: random() * 0.4,
        size: 2.2 + random() * 2.2
      });
    }
  });

  // Construct synaptic axon connectivity graph
  const axons = [];
  const axonSet = new Set();

  function addAxon(i, j, dist, isCommissure = false) {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!axonSet.has(key)) {
      axonSet.add(key);
      axons.push({ a: i, b: j, dist, isCommissure });
    }
  }

  // Local neuropil connections
  for (let i = 0; i < nodes.length; i++) {
    const dists = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      const dist = Math.hypot(dx, dy, dz);
      dists.push({ j, dist });
    }
    dists.sort((a, b) => a.dist - b.dist);
    for (let k = 0; k < 3; k++) {
      if (dists[k] && dists[k].dist < 0.62) {
        addAxon(i, dists[k].j, dists[k].dist, false);
      }
    }
  }

  // Cross-hemisphere commissural tracts
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].hemi === "L" && Math.abs(nodes[i].x) < 0.5) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].hemi === "R" && Math.abs(nodes[j].x) < 0.5) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist = Math.hypot(dx, dy, dz);
          if (dist < 0.68) {
            addAxon(i, j, dist, true);
          }
        }
      }
    }
  }

  // Active action potentials (spikes) traversing axons
  const spikes = [];
  const maxSpikes = 42;

  function spawnSpike(preferredAxon = null, boost = 1.0) {
    if (axons.length === 0) return;
    const axonIndex = preferredAxon !== null ? preferredAxon : Math.floor(random() * axons.length);
    const axon = axons[axonIndex];
    const fromA = random() > 0.5;
    spikes.push({
      axonIndex,
      fromA,
      t: 0,
      speed: (0.018 + random() * 0.024) * boost,
      size: 1.8 + random() * 1.8,
      intensity: boost
    });
  }

  // Populate initial spikes
  for (let i = 0; i < 28; i++) spawnSpike();

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rotatePoint(point, ax, ay) {
    const { x, y, z } = point;
    // Yaw (around Y axis)
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;

    // Pitch (around X axis)
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;

    return { x: x1, y: y2, z: z2 };
  }

  function project(point, scale) {
    const perspective = 3.6 / (3.6 - point.z);
    return {
      x: width * 0.5 + point.x * scale * perspective,
      y: height * 0.52 - point.y * scale * perspective,
      z: point.z,
      scale: perspective
    };
  }

  function triggerStimulation(x, y) {
    stimulationWave = 1.0;
    stimulusOrigin = { x, y };

    // Find nearest nodes to the click point and trigger a spike storm
    let closestNode = -1;
    let minDist = Infinity;
    nodes.forEach((n, idx) => {
      if (n.projected) {
        const d = Math.hypot(n.projected.x - x, n.projected.y - y);
        if (d < minDist) {
          minDist = d;
          closestNode = idx;
        }
      }
    });

    if (closestNode !== -1) {
      stimulusLabel = `OPTOGENETIC PULSE · ${nodes[closestNode].region.toUpperCase()}`;
      nodes[closestNode].activity = 1.0;
      // Fire all connected axons
      axons.forEach((ax, idx) => {
        if (ax.a === closestNode || ax.b === closestNode) {
          spawnSpike(idx, 1.8);
        }
      });
    }

    // Additional spontaneous bursts
    for (let k = 0; k < 8; k++) spawnSpike(null, 1.5);
  }

  canvas.addEventListener("click", (event) => {
    const bounds = canvas.getBoundingClientRect();
    triggerStimulation(event.clientX - bounds.left, event.clientY - bounds.top);
  });

  function draw(time = 0) {
    if (!visible) return;
    ctx.clearRect(0, 0, width, height);

    const light = false; // the connectome stage stays dark in both themes
    const ax = pitch + pointerY * 0.45;
    const ay = rotation + pointerX * 0.75;
    const scale = Math.min(width, height) * (width < 520 ? 0.28 : 0.33);

    // Project and depth sort all nodes
    nodes.forEach((node) => {
      const rot = rotatePoint(node, ax, ay);
      node.projected = project(rot, scale);
      // Smooth decay of neural activity
      node.activity = Math.max(0, node.activity - 0.016);
    });

    // Check hovered node
    hoveredNode = -1;
    if (finePointer && mouseClientX > 0) {
      const bounds = canvas.getBoundingClientRect();
      const localX = mouseClientX - bounds.left;
      const localY = mouseClientY - bounds.top;
      let minD = 24;
      nodes.forEach((n, idx) => {
        const d = Math.hypot(n.projected.x - localX, n.projected.y - localY);
        if (d < minD) {
          minD = d;
          hoveredNode = idx;
        }
      });
    }

    // Draw stimulation wave ripple if active
    if (stimulationWave > 0.01) {
      const waveRadius = (1.0 - stimulationWave) * Math.min(width, height) * 0.7;
      ctx.beginPath();
      ctx.arc(stimulusOrigin.x, stimulusOrigin.y, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = light
        ? `rgba(180, 40, 120, ${stimulationWave * 0.7})`
        : `rgba(255, 90, 180, ${stimulationWave * 0.8})`;
      ctx.lineWidth = 2 * stimulationWave;
      ctx.stroke();
      stimulationWave -= 0.024;
    }

    // Draw Synaptic Axon Pathways
    axons.forEach((axon) => {
      const n1 = nodes[axon.a];
      const n2 = nodes[axon.b];
      const p1 = n1.projected;
      const p2 = n2.projected;

      const avgZ = (p1.z + p2.z) * 0.5;
      const depthAlpha = clamp((avgZ + 1.2) / 2.4, 0.12, 0.75);

      const isHovered = hoveredNode === axon.a || hoveredNode === axon.b;
      const activeGlow = Math.max(n1.activity, n2.activity);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isHovered) {
        ctx.strokeStyle = light ? "rgba(117, 84, 155, 0.85)" : "rgba(220, 180, 255, 0.95)";
        ctx.lineWidth = 1.6;
      } else if (activeGlow > 0.3) {
        ctx.strokeStyle = light
          ? `rgba(140, 60, 160, ${0.35 + activeGlow * 0.45})`
          : `rgba(200, 150, 255, ${0.25 + activeGlow * 0.55})`;
        ctx.lineWidth = 0.9 + activeGlow * 0.8;
      } else if (axon.isCommissure) {
        ctx.strokeStyle = light
          ? `rgba(180, 70, 140, ${depthAlpha * 0.5})`
          : `rgba(255, 120, 190, ${depthAlpha * 0.65})`;
        ctx.lineWidth = 0.75;
      } else {
        ctx.strokeStyle = light
          ? `rgba(70, 50, 95, ${depthAlpha * 0.28})`
          : `rgba(197, 166, 236, ${depthAlpha * 0.32})`;
        ctx.lineWidth = 0.6;
      }
      ctx.stroke();
    });

    // Update and draw traveling Action Potential Spikes
    for (let i = spikes.length - 1; i >= 0; i--) {
      const s = spikes[i];
      s.t += s.speed;

      const axon = axons[s.axonIndex];
      if (!axon) {
        spikes.splice(i, 1);
        continue;
      }

      const nFrom = nodes[s.fromA ? axon.a : axon.b];
      const nTo = nodes[s.fromA ? axon.b : axon.a];
      const pFrom = nFrom.projected;
      const pTo = nTo.projected;

      const curX = pFrom.x + (pTo.x - pFrom.x) * s.t;
      const curY = pFrom.y + (pTo.y - pFrom.y) * s.t;
      const curZ = pFrom.z + (pTo.z - pFrom.z) * s.t;
      const alpha = clamp((curZ + 1.2) / 2.4, 0.35, 1.0);

      // Draw moving electrical pulse
      ctx.beginPath();
      ctx.arc(curX, curY, s.size * (light ? 1 : 1.2), 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(140, 30, 120, ${alpha * 0.95})`
        : `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.fill();

      // Soft corona glow for action potential
      ctx.beginPath();
      ctx.arc(curX, curY, s.size * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(180, 60, 140, ${alpha * 0.25})`
        : `rgba(199, 166, 236, ${alpha * 0.38})`;
      ctx.fill();

      // Spike arrival at target node
      if (s.t >= 1.0) {
        nTo.activity = 1.0;
        // Cascading spike transmission
        if (random() < 0.65 && spikes.length < maxSpikes) {
          // find outgoing axon from nTo
          const candidateAxons = [];
          axons.forEach((ax, aIdx) => {
            if ((ax.a === (s.fromA ? axon.b : axon.a) || ax.b === (s.fromA ? axon.b : axon.a)) && aIdx !== s.axonIndex) {
              candidateAxons.push(aIdx);
            }
          });
          if (candidateAxons.length > 0) {
            const nextAxon = candidateAxons[Math.floor(random() * candidateAxons.length)];
            spawnSpike(nextAxon, s.intensity * 0.85);
          }
        }
        spikes.splice(i, 1);
      }
    }

    // Maintain steady baseline of spontaneous spikes
    while (spikes.length < 24) spawnSpike();

    // Depth-sort and draw Neural Nodes
    const sortedNodes = nodes.slice().sort((a, b) => a.projected.z - b.projected.z);

    sortedNodes.forEach((node) => {
      const p = node.projected;
      const depthAlpha = clamp((p.z + 1.2) / 2.4, 0.22, 1.0);
      const isHovered = nodes[hoveredNode] === node;
      const isFiring = node.activity > 0.15;
      const r = node.color[0];
      const g = node.color[1];
      const b = node.color[2];

      const baseRadius = node.size * (0.8 + 0.4 * p.scale);

      // Firing radial bloom halo
      if (isFiring || isHovered) {
        const glowRadius = baseRadius * (isHovered ? 4.5 : 3.2);
        const glowGrad = ctx.createRadialGradient(p.x, p.y, baseRadius * 0.5, p.x, p.y, glowRadius);
        glowGrad.addColorStop(0, light ? `rgba(${r}, ${g}, ${b}, 0.65)` : `rgba(${r}, ${g}, ${b}, 0.8)`);
        glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Main Node Body
      ctx.beginPath();
      ctx.arc(p.x, p.y, isHovered ? baseRadius * 1.5 : baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(${Math.max(20, r - 30)}, ${Math.max(20, g - 30)}, ${Math.max(20, b - 30)}, ${depthAlpha * 0.95})`
        : `rgba(${r}, ${g}, ${b}, ${depthAlpha * 0.95})`;
      ctx.fill();

      // Bright nucleus center
      ctx.beginPath();
      ctx.arc(p.x, p.y, baseRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? "#ffffff"
        : (isFiring ? "#ffffff" : `rgba(255, 255, 255, ${depthAlpha * 0.8})`);
      ctx.fill();
    });

    // Real-Time Connectome Telemetry Overlay
    ctx.font = '9px "DM Mono", monospace';
    ctx.letterSpacing = "0.08em";
    const telemetryY = height - 42;

    if (hoveredNode !== -1) {
      const hn = nodes[hoveredNode];
      ctx.fillStyle = light ? "#75549b" : "#c7a6ec";
      ctx.fillText(`CIRCUIT: ${hn.region.toUpperCase()} [${hn.hemi}]`, 22, telemetryY);
      ctx.fillStyle = light ? "#625a67" : "#aaa3b1";
      ctx.fillText(`ACTIVITY: ${(hn.activity * 100).toFixed(0)}% · AXONS: ${axons.filter(a => a.a === hoveredNode || a.b === hoveredNode).length}`, 22, telemetryY + 14);
    } else if (stimulusLabel && stimulationWave > 0.05) {
      ctx.fillStyle = light ? "#b82470" : "#ff6eb4";
      ctx.fillText(stimulusLabel, 22, telemetryY);
      ctx.fillStyle = light ? "#625a67" : "#aaa3b1";
      ctx.fillText(`ACTIVE ACTION POTENTIALS: ${spikes.length}`, 22, telemetryY + 14);
    } else {
      ctx.fillStyle = light ? "#89808d" : "#716a79";
      ctx.fillText(`CONNECTOME: FLYWIRE · BANC-v1 · ${nodes.length} NEUROPILS · ${axons.length} SYNAPSES`, 22, telemetryY);
      ctx.fillText(`MEMBRANE POTENTIAL: -65mV · CASSETTE: SPONTANEOUS`, 22, telemetryY + 14);
    }
  }

  function animate(time) {
    if (lastTime && time - lastTime < 16) {
      frame = requestAnimationFrame(animate);
      return;
    }
    lastTime = time;
    pointerX += (targetX - pointerX) * 0.065;
    pointerY += (targetY - pointerY) * 0.065;
    rotation += 0.0022;
    draw(time);
    frame = requestAnimationFrame(animate);
  }

  canvas.addEventListener("pointermove", (event) => {
    mouseClientX = event.clientX;
    mouseClientY = event.clientY;
    if (!finePointer) return;
    const bounds = canvas.getBoundingClientRect();
    targetX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.6, 0.6);
    targetY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
  }, { passive: true });

  canvas.addEventListener("pointerleave", () => {
    mouseClientX = -9999;
    mouseClientY = -9999;
    targetX = 0;
    targetY = 0;
  });

  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !reducedMotion && !smallScreen && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    } else if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { threshold: 0.05 });
  observer.observe(canvas);

  resize();
  if (reducedMotion || smallScreen) {
    if (smallScreen && !reducedMotion) rotation = 0.55;
    draw(0);
  }
  else frame = requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) draw(0);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden && visible && !reducedMotion && !smallScreen && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  });
})();
