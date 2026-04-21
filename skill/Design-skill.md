---
name: assessmentr-design-skill
description: Design system for the assessmentr project. Read this file before writing any CSS, choosing colors, picking fonts, selecting icons, or making layout decisions. Contains the complete visual language — colors, typography, icons, spacing, responsive breakpoints, animations, and component styles.
---

# assessmentr Design System
**Project:** `assessmentr`

This is the single source of truth for all visual decisions. Every page and component must follow these rules exactly.

---

## Color Palette

```css
:root {
  /* ── Backgrounds (layered dark) ── */
  --bg-base:        #0a0f0f;   /* page background — deep near-black, NOT pure black */
  --bg-surface:     #0d1414;   /* section backgrounds */
  --bg-card:        #111a1a;   /* elevated card surfaces */
  --bg-card-hover:  #152020;   /* card on hover */
  --bg-card-border: #1a2a2a;   /* default card border */

  /* ── Primary Accent — Electric Teal ── */
  --accent:         #00e5cc;   /* CTAs, active states, highlights, logo */
  --accent-dim:     #00b8a4;   /* hover state for accent elements */
  --accent-subtle:  rgba(0, 229, 204, 0.08);  /* tinted backgrounds */
  --accent-glow:    rgba(0, 229, 204, 0.15);  /* glow / bloom */
  --accent-glow-lg: rgba(0, 229, 204, 0.25);  /* stronger glow on active */

  /* ── Text ── */
  --text-primary:   #ffffff;
  --text-secondary: #8a9a9a;   /* descriptions, subtitles */
  --text-muted:     #4a6060;   /* timestamps, micro labels */
  --text-on-accent: #0a0f0f;   /* text sitting on teal button */

  /* ── Proficiency / Status ── */
  --proficiency-high:   #00e5cc;   /* mastery ≥ 70% */
  --proficiency-mid:    #f59e0b;   /* mastery 40–69% */
  --proficiency-low:    #ef4444;   /* mastery < 40% */
  --live-indicator:     #ef4444;   /* LIVE red dot */

  /* ── Knowledge Graph ── */
  --graph-bg:           #0a0f0f;
  --graph-node-bg:      rgba(0, 229, 204, 0.10);
  --graph-node-border:  rgba(0, 229, 204, 0.40);
  --graph-node-hover:   rgba(0, 229, 204, 0.20);
  --graph-edge:         rgba(0, 229, 204, 0.20);
  --graph-glow:         rgba(0, 229, 204, 0.30);

  /* ── Utility ── */
  --divider:        rgba(255,255,255,0.06);
  --overlay:        rgba(10, 15, 15, 0.85);
  --scrollbar-thumb: #1a2a2a;
}
```

---

## Typography

```css
/* Google Fonts import — include in every page <head> */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

:root {
  --font-display: 'Syne', sans-serif;    /* headings, logo, nav, section labels */
  --font-body:    'DM Sans', sans-serif; /* body copy, descriptions, data */
}
```

### Type Scale

| Token | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `--text-hero` | `clamp(2.5rem, 5vw, 4rem)` | 800 | Syne | Landing hero only |
| `--text-h1` | `clamp(1.8rem, 3vw, 2.75rem)` | 700 | Syne | Page titles |
| `--text-h2` | `1.5rem` | 700 | Syne | Section headings |
| `--text-h3` | `1.15rem` | 600 | Syne | Card headings |
| `--text-body` | `0.95rem` | 400 | DM Sans | General body text |
| `--text-small` | `0.85rem` | 400 | DM Sans | Secondary info |
| `--text-label` | `0.72rem` | 500 | DM Sans | Section labels (uppercase) |
| `--text-micro` | `0.65rem` | 400 | DM Sans | Timestamps, footnotes |

### Section Label Style
Small uppercase teal tag above every major section heading:
```css
.section-label {
  font-family: var(--font-display);
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
/* Examples: "INTELLIGENCE", "SIMULATION", "FEEDBACK", "LIVE SESSION" */
```

---

## Iconography

Use **Lucide Icons** (via CDN or npm package `lucide-react`). Never use emoji as icons.

```html
<!-- CDN for plain HTML pages -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

### Icon Map (use these specific icons per context)

| Context | Lucide Icon Name |
|---|---|
| Microphone / voice | `mic`, `mic-off` |
| End session / stop | `phone-off` |
| Timer / clock | `timer`, `clock` |
| Live indicator | `radio` |
| User / profile | `user`, `user-circle` |
| Knowledge graph | `git-branch` |
| Trend up | `trending-up` |
| Trend down | `trending-down` |
| Trend flat | `minus` |
| Session / interview | `video`, `message-square` |
| Analysis / feedback | `bar-chart-2` |
| Dashboard | `layout-dashboard` |
| AI / bot | `bot` |
| Settings | `settings` |
| Logout | `log-out` |
| Check / success | `check-circle` |
| Warning / weak area | `alert-triangle` |
| Suggested topic | `lightbulb` |
| Previous session | `history` |

### Icon Sizing Rules
```css
.icon-sm  { width: 14px; height: 14px; }
.icon-md  { width: 18px; height: 18px; }  /* default inline icon */
.icon-lg  { width: 24px; height: 24px; }  /* nav icons, card headers */
.icon-xl  { width: 32px; height: 32px; }  /* mic button area */
.icon-2xl { width: 48px; height: 48px; }  /* hero mic button */
```

---

## Spacing System

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;   /* section vertical padding */
}
```

### Layout Rules
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);  /* 24px side padding desktop */
}

/* Card defaults */
.card {
  background: var(--bg-card);
  border: 1px solid var(--bg-card-border);
  border-radius: 12px;
  padding: var(--space-6);    /* 24px */
  box-shadow: 0 0 30px rgba(0, 229, 204, 0.05);
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
}
```

### Border Radius Tokens
```css
--radius-sm:   6px;    /* tags, small chips */
--radius-md:   12px;   /* cards, panels */
--radius-lg:   20px;   /* large containers */
--radius-full: 9999px; /* pills, buttons, avatar chips */
```

---

## Button System

```css
/* Primary CTA */
.btn-primary {
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}
.btn-primary:hover {
  background: var(--accent-dim);
  box-shadow: 0 0 20px var(--accent-glow-lg);
}

/* Secondary / Ghost */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--bg-card-border);
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.btn-secondary:hover {
  border-color: var(--accent-dim);
}

/* Danger / End Session */
.btn-danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  font-family: var(--font-display);
  font-weight: 600;
  padding: 8px 20px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
```

---

## Navbar

```
Height:      64px
Background:  rgba(10, 15, 15, 0.90) with backdrop-filter: blur(12px)
Position:    sticky top-0, z-index: 100
Border-bottom: 1px solid var(--divider)

Left:   assessmentr logo — font: Syne 700, color: var(--accent), font-size: 1.2rem
Center: Nav links — Live Interviews · Intelligent Dashboards · Deep Analysis · Pricing
        font: DM Sans 400, color: var(--text-secondary), hover: var(--text-primary)
Right:  Primary CTA pill button — "Join the Beta" or user avatar chip
```

---

## Animations

```css
/* ── Page load entrance ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeUp 0.5s ease forwards; }
/* Stagger with animation-delay: 0.1s, 0.2s, 0.3s... per element */

/* ── Mic pulse ring (active speaking) ── */
@keyframes micPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
  50%       { box-shadow: 0 0 0 16px transparent; }
}
.mic-active { animation: micPulse 1.5s ease-in-out infinite; }

/* ── Waveform bars ── */
@keyframes wave {
  0%, 100% { height: 4px; }
  50%       { height: 20px; }
}
.waveform-bar {
  width: 3px;
  background: var(--accent);
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}
.waveform-bar:nth-child(2) { animation-delay: 0.1s; }
.waveform-bar:nth-child(3) { animation-delay: 0.2s; }
.waveform-bar:nth-child(4) { animation-delay: 0.15s; }
.waveform-bar:nth-child(5) { animation-delay: 0.05s; }
/* Add .waveform-paused to stop animation when not speaking */

/* ── LIVE indicator dot ── */
@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.live-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--live-indicator);
  animation: livePulse 1.2s ease-in-out infinite;
}

/* ── Graph node float ── */
@keyframes nodeFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
.graph-node { animation: nodeFloat 3s ease-in-out infinite; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }
```

---

## Responsive Breakpoints

```css
/* Mobile-first approach */
--bp-sm:  480px;   /* large phones */
--bp-md:  768px;   /* tablets */
--bp-lg:  1024px;  /* small laptops */
--bp-xl:  1200px;  /* desktops */
```

### Responsive Rules Per Page

#### All Pages — Navbar
```
Desktop (≥768px): horizontal nav with all links visible
Mobile (<768px):  hamburger menu icon (lucide: menu), links in dropdown drawer
                  drawer: full-width, bg: var(--bg-card), slide-in from top
```

#### Page 1 — Mock Interview
```
Desktop: two-column layout — left: question + AI card + voice control
                              right: transcript + speaking indicator
Mobile:  single column — header → question → voice control → transcript (full width)
         AI interviewer card collapses to compact strip at top
         Speaking indicator becomes horizontal bar above transcript
```

#### Page 2 — Dashboard
```
Desktop: sidebar or top stats row + knowledge graph (large, centered) + ranking table beside it
Mobile:  stats cards → full-width scrollable graph (pinch-zoom enabled) → ranking list stacked
         QuickStats: horizontal scroll row of 3 cards
         KnowledgeGraph: fixed height 300px, horizontally scrollable if needed
```

#### Page 3 — Deep Analysis Feedback
```
Desktop: 2-column grid — left: Current Session + Previous Insights
                          right: Revised Feedback + Concept Trends
Mobile:  single column stacked: Current → Previous → Revised → Trends
         Charts: full-width, reduced height (200px)
         Session selector: full-width dropdown
```

### Mobile-Specific Overrides
```css
@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }  /* 16px sides on mobile */
  section { padding: var(--space-12) 0; }    /* 48px vertical on mobile */
  .card { padding: var(--space-4); }          /* 16px card padding */
  h1 { font-size: 1.6rem; }
  h2 { font-size: 1.3rem; }
}
```

---

## Dark Mode Note
The entire app is dark-mode by default. There is no light mode. Do not add light mode toggles.

---

## Do Not
- ❌ Use Inter, Roboto, Arial, or system-ui as fonts
- ❌ Use pure `#000000` black backgrounds
- ❌ Use purple gradients or generic blue accents
- ❌ Use emoji as UI icons
- ❌ Add light mode
- ❌ Use `border-radius` less than 6px on interactive elements













































































