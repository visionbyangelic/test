# Angelic Charles — Portfolio

A responsive editorial portfolio built with semantic HTML, CSS and vanilla JavaScript.

## Project structure

```text
/
├── index.html
├── research.html
├── engineering.html
├── writing.html
├── interests.html
├── blender-3d.html
├── about.html
├── now.html
├── styles.css
├── pages.css
├── motion.css
├── script.js
├── pages.js
├── motion.js
└── assets/
    └── blender/
```

## How the code is organised

- **styles.css** — shared site shell, typography, theme tokens and homepage layout.
- **pages.css** — page-specific layouts, editorial archive and Blender gallery.
- **motion.css** — animation, transitions, hover states and reduced-motion rules.
- **script.js** — homepage theme, mobile navigation and neural canvas.
- **pages.js** — shared theme and navigation behaviour on interior pages.
- **motion.js** — scroll reveals, subtle cursor response, image interaction and page transitions.

The code is intentionally split into readable files so individual parts can be edited without digging through one large script.

## Run locally

Open `index.html` in a browser, or start a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Motion and accessibility

- Staggered heading and content reveals.
- Cinematic page navigation with a View Transitions API enhancement and CSS fallback.
- A subtle cursor halo on desktop pointer devices only.
- Gentle hover and gallery movement.
- Responsive layouts for desktop, tablet and mobile.
- `prefers-reduced-motion` support to disable non-essential movement.

The neural activity is a lightweight Canvas illustration, not a biological simulation.

## Deployment

The repository is connected to Vercel. Commits to the production branch trigger a deployment according to the project's Vercel settings.
