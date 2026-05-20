---
name: html-site
description: Build polished, production-ready HTML/CSS/JS websites with max-quality UI/UX design. Use when the user asks to build, create, or design an HTML site, landing page, portfolio, or agency website.
---

# HTML Site Builder — Max Pro UI/UX

## Standards

- Mobile-first, fully responsive (320px → 1440px+)
- Smooth scroll, subtle entrance animations (Intersection Observer)
- Accessible: semantic HTML5, ARIA labels, keyboard navigable
- Fast: no unnecessary dependencies, inline critical CSS
- Modern aesthetic: clean typography, strong visual hierarchy, intentional whitespace

## Stack

- Pure HTML5 + CSS custom properties + vanilla JS (default)
- Google Fonts via `<link>` (Inter or Plus Jakarta Sans preferred)
- No frameworks unless user requests

## File structure

```
project-name/
├── index.html
├── style.css
└── script.js   (only if needed)
```

## Design system defaults

```css
:root {
  --color-primary: #0f172a;
  --color-accent: #6366f1;
  --color-bg: #ffffff;
  --color-text: #1e293b;
  --color-muted: #64748b;
  --font-sans: 'Inter', sans-serif;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
  --max-width: 1200px;
}
```

Swap accent color to match brand if provided.

## Section order (landing page)

1. `<nav>` — sticky, logo + links + CTA button
2. `<hero>` — headline, subheadline, CTA, visual
3. `<features>` or `<services>` — 3-column cards
4. `<about>` or `<how-it-works>` — steps or story
5. `<testimonials>` — quote cards (if relevant)
6. `<cta>` — final call to action banner
7. `<footer>` — links, copyright

## Animations

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: none;
}
```

Trigger with IntersectionObserver in script.js.

## Workflow

1. Ask user: site name, purpose, brand color (if any), sections needed
2. Build `index.html` with all sections in one file first
3. Extract to `style.css` once structure is approved
4. Add `script.js` last (nav scroll behavior, animations, interactions)
5. Offer to push to GitHub when done
