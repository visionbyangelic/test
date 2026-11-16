(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const savedTheme = localStorage.getItem("angelic-theme");
  if (savedTheme === "light") root.dataset.theme = "light";
  const updateThemeControl = () => {
    const light = root.dataset.theme === "light";
    themeIcon.textContent = light ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    document.querySelector('meta[name="theme-color"]').content = light ? "#f4f3ef" : "#08090b";
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
  mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
  document.getElementById("year").textContent = new Date().getFullYear();

  // Lightweight canvas neural activity: no external 3D library required.
  const canvas = document.getElementById("neuralCanvas");
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, nodes = [], pulses = [], raf = 0;
  const rand = (a,b) => a + Math.random() * (b-a);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.max(34, Math.min(74, Math.round(width*height/4400)));
    nodes = Array.from({length:count}, (_,i) => ({
      x: rand(width*.12,width*.88), y: rand(height*.15,height*.84),
      phase: rand(0,Math.PI*2), speed: rand(.001,.004), r: rand(1.2,2.6), drift: rand(2,9)
    }));
    pulses = [];
  }
  function draw(t=0) {
    ctx.clearRect(0,0,width,height);
    const light = root.dataset.theme === "light";
    const line = light ? "rgba(50,91,82,.22)" : "rgba(160,207,191,.22)";
    const glow = light ? "rgba(50,120,102," : "rgba(143,220,195,";
    const points = nodes.map(n => ({...n, px:n.x+Math.sin(t*n.speed+n.phase)*n.drift, py:n.y+Math.cos(t*n.speed*.8+n.phase)*n.drift}));
    for(let i=0;i<points.length;i++){
      for(let j=i+1;j<points.length;j++){
        const a=points[i],b=points[j],d=Math.hypot(a.px-b.px,a.py-b.py);
        if(d<105){
          ctx.strokeStyle=line;ctx.globalAlpha=(1-d/105)*.72;ctx.lineWidth=.65;
          ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke();
        }
      }
    }
    ctx.globalAlpha=1;
    if(!reducedMotion && Math.random()<.035 && points.length){
      const start=Math.floor(Math.random()*points.length);
      let nearest=-1,dist=130;
      points.forEach((p,i)=>{if(i===start)return;const d=Math.hypot(p.px-points[start].px,p.py-points[start].py);if(d<dist){dist=d;nearest=i;}});
      if(nearest>=0)pulses.push({a:start,b:nearest,p:0,s:rand(.006,.014)});
    }
    pulses.forEach(p=>p.p+=p.s);
    pulses=pulses.filter(p=>p.p<=1);
    pulses.forEach(p=>{
      const a=points[p.a],b=points[p.b],x=a.px+(b.px-a.px)*p.p,y=a.py+(b.py-a.py)*p.p;
      const g=ctx.createRadialGradient(x,y,0,x,y,11);g.addColorStop(0,glow+"0.9)");g.addColorStop(1,glow+"0)");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=light?"#376e60":"#b5f1d9";ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();
    });
    points.forEach((p,i)=>{
      const pulse=(Math.sin(t*.002+p.phase)+1)/2;
      ctx.fillStyle=glow+(0.25+pulse*.5)+")";
      ctx.beginPath();ctx.arc(p.px,p.py,p.r+pulse*1.2,0,Math.PI*2);ctx.fill();
      if(i%7===0){ctx.strokeStyle=glow+"0.12)";ctx.beginPath();ctx.arc(p.px,p.py,7+pulse*5,0,Math.PI*2);ctx.stroke();}
    });
    if(!reducedMotion) raf=requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener("resize",()=>{cancelAnimationFrame(raf);resize();draw();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(raf);else if(!reducedMotion)draw();});
})();