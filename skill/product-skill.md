---
name: assessmentr-product-features
description: Product features and page specifications for assessmentr. Read this before building any page or component. Defines navigation behavior, tab interactions, what each page contains, and what happens when users interact with UI elements.
---

# assessmentr Product Features
**Project:** `assessmentr`

Defines what every page does, how navigation works, and what happens when users press tabs or buttons. Design decisions (colors, fonts) are in `Design-skill.md`.

---

## Navigation (Global)

### Top Navbar — Links & Behavior
```
Logo "assessmentr"        → navigates to landing page (/)
"Live Interviews"     → /interview  (Page 1)
"Intelligent Dashboards" → /dashboard (Page 2)
"Deep Analysis"       → /analysis  (Page 3)
"Pricing"             → /pricing   (external or static page, out of scope)
CTA Button            → "Join the Beta" on landing / "Profile" when logged in
```

### Active State
The currently active nav link gets:
- Color: `var(--accent)` (teal)
- A small teal underline bar (2px, `border-radius: 1px`, below the link)
- No bold change — just color shift

### Mobile Navigation
- Hamburger icon (lucide: `menu`) appears on screens < 768px
- Tapping it opens a full-width dropdown drawer from the top
- Drawer lists all nav links vertically, 48px tap height each
- Tapping a link closes the drawer and navigates
- Tapping outside the drawer closes it

---

## Page 1 — Mock Interview (`/interview`, file: `page1-mockinterview`)

### Purpose
Simulate a live, voice-only CS technical interview with an AI interviewer. The user speaks their answers; the AI responds and probes deeper.

### Page-Level Tab / Session Controls
```
Header bar contains:
  Left:  "Mock Interview — Live Verbal Session"  (page title)
  Center: [🔴 LIVE dot] [MM:SS timer counting up]
  Right: [End Session] button (danger style)
```
- Timer starts at 00:00 on page load and counts up every second
- "End Session" button → shows a confirmation modal ("Are you sure you want to end this session?") → on confirm, stops timer, saves session, navigates to `/analysis`

### Sub-sections (two panels)

#### Panel A — Interview Area (left on desktop, top on mobile)
1. **Question Display**
   - Shows the current CS question being asked
   - Large readable text, centered or left-aligned
   - Below question: topic tag pill (e.g., "Distributed Systems", "System Design")
   - "Next Question" does NOT appear — interviewer controls pacing via voice

2. **AI Interviewer Card**
   - Name: Aria
   - Role: Senior Technical Interviewer
   - Circular portrait image with teal glow border
   - "AI INTERVIEW" label below portrait
   - Bottom of card: 5-bar waveform animation — active when Aria is speaking, paused when user is speaking

3. **Voice Control**
   - Large circular mic button, centered
   - States:
     - **Idle** (session not started): grey mic icon, "Press to Start" label
     - **User speaking**: teal pulsing ring, mic icon teal, "Listening..." label
     - **AI speaking**: mic dimmed, "Aria is speaking..." label, not pressable
   - Pressing mic when idle → starts session, timer begins
   - Pressing mic when active → toggles mute (rare, mostly auto-detect)

#### Panel B — Conversation & Indicator (right on desktop, bottom on mobile)

1. **Conversation Transcript**
   - Chat-style scrolling log
   - Each message bubble shows:
     - **Aria (bot)**: left-aligned, dark card bubble, small "Aria" label + bot icon above
     - **User (Shivanand)**: right-aligned, teal-tinted bubble, "You" label + user icon above
   - Auto-scrolls to latest message
   - Transcript updates in real-time as user speaks (words appear as they're spoken)
   - Empty state: "Your conversation will appear here once the session begins."

2. **Speaking Turn Indicator**
   - Positioned above or beside the transcript
   - Two states only:
     - **User speaking**: waveform bars animate (5 bars, teal), label "You are speaking"
     - **Not user speaking**: bars flat/grey, label "Listening..." or blank
   - Never shows "Aria is speaking" — it only reflects the USER's speaking state
   - Synced: when user transcript text is being written → indicator is active

---

## Page 2 — Intelligent Dashboard (`/dashboard`, file: `page2-dashboard`)

### Purpose
Give the user a bird's-eye view of their verbal CS interview readiness across all topics.

### Sections (top to bottom)

#### 1. Page Header
```
Section label: "INTELLIGENCE"
Title: "Intelligent Dashboard"
Subtitle: "Your verbal CS interview readiness at a glance"
Right side: User profile chip — avatar circle (initial "S") + "Shivanand" + "Bengaluru"
```

#### 2. Quick Stats Bar
Three stat cards in a row:
| Stat | Value | Icon |
|---|---|---|
| Total Sessions | 24 | `video` |
| Avg Verbal Clarity | 7.8 / 10 | `mic` |
| Weakest Area | Operating Systems | `alert-triangle` (amber) |

Cards are non-interactive (display only). On mobile: horizontal scroll row.

#### 3. Knowledge Graph
```
Section label: "KNOWLEDGE MAP"
Title: "CS Concept Mastery Graph"
```
- Visual node graph showing 9 CS topics as interconnected nodes
- Each node is a rounded pill/chip showing: topic name + mastery %
- Node color by proficiency:
  - ≥ 70%: teal border + teal text (`--proficiency-high`)
  - 40–69%: amber border + amber text (`--proficiency-mid`)
  - < 40%: red border + red text (`--proficiency-low`)
- Connecting lines between related concepts (e.g., Algorithms ↔ Dynamic Programming ↔ Graph Theory)
- Hovering a node: shows tooltip with mastery %, last session date, trend arrow
- Graph is non-interactive beyond hover (no drag/pan needed)

#### 4. Key Concept Ranking
```
Section label: "RANKINGS"
Title: "Key Concept Ranking"
```
- Ranked list (1–9) of CS topics by mastery score
- Each row:
  ```
  #1  [topic name]  [progress bar]  [score %]  [trend icon ↑↓→]
  ```
- Trend icon colors: ↑ teal, ↓ red, → amber
- Clicking a row: highlights it (teal left border), no navigation

#### 5. Suggested Next Topics
```
Section label: "RECOMMENDED"
Title: "Suggested Next Verbal Topics"
```
- 3–4 topic chips with lightbulb icon
- Shows the lowest-mastery topics as priority practice suggestions
- Each chip: topic name + "Practice Now" subtle label
- Clicking a chip: navigates to `/interview` with that topic pre-loaded (or just navigates to `/interview`)

---

## Page 3 — Deep Analysis Feedback (`/analysis`, file: `page3-analysis`)

### Purpose
Let users review, compare, and learn from AI feedback across all their sessions.

### Session Selector (Page-Level Control)
```
Header right side: dropdown "Session: Mar 28, 2025 · 42 min"
Clicking it: opens dropdown list of past sessions (date + duration)
Selecting a session: all four sections below update to show that session's data
```

### Four Sections

#### Section 1 — Current Session
```
Section label: "CURRENT SESSION"
Title: current session date + duration
```
- Three metric bars:
  - Verbal Clarity: 82% (teal bar)
  - Depth of Explanation: 67% (amber bar)
  - Confidence & Fluency: 74% (teal bar)
- Below bars: feedback bullets
  - ✅ Positive: "Strong explanation of load balancing trade-offs"
  - ⚠️ Improve: "Avoided quantifying latency numbers in System Design answer"
  - Reference tags: topic pill chips ("Distributed Systems", "CAP Theorem")

#### Section 2 — Important Feedback from Previous Sessions
```
Section label: "HISTORY"
Title: "Previous Session Insights"
```
- Timeline / card list of 3–4 past sessions
- Each card:
  - Date label (e.g., "Mar 21, 2025")
  - 1–2 key insights from that session
  - Tag: recurring pattern label (e.g., "Recurring: Lacks quantification")
- Cards are read-only, no interactions

#### Section 3 — Revised Feedback
```
Section label: "AI SYNTHESIS"
Title: "Revised Feedback"
```
- AI-generated paragraph consolidating current + past session patterns
- Actionable advice list (3–4 bullet points)
- Multi-session progress visualization:
  - Line chart: X-axis = sessions (last 6), Y-axis = overall clarity score
  - Single line, teal color, dots at each session point

#### Section 4 — Concept Improvement Trends
```
Section label: "TRENDS"
Title: "Concept Improvement Trends"
```
- Multiple line/area charts — one per CS topic (or tabbed by topic)
- X-axis: session number or date
- Y-axis: proficiency score (0–100)
- Each line color matches proficiency level at last data point
- Topic selector tabs above the chart area:
  ```
  [Data Structures] [Algorithms] [System Design] [OS] [Databases] ...
  ```
  Clicking a tab: switches the chart to that topic's trend data
- Charts are display-only (no zoom/pan needed)

### Overall Analysis Area (below all four sections)
- Performance indicator summary row:
  - Overall Score badge
  - Categorized tag pills: "Strong: System Design", "Needs Work: OS", "Improving: Databases"
- No interactions — display only

---

## Inter-Page Navigation Summary

| From | Action | To |
|---|---|---|
| Any page | Click nav "Live Interviews" | `/interview` (Page 1) |
| Any page | Click nav "Intelligent Dashboards" | `/dashboard` (Page 2) |
| Any page | Click nav "Deep Analysis" | `/analysis` (Page 3) |
| Page 1 | End Session → confirm | `/analysis` (Page 3) |
| Page 2 | Click Suggested Topic chip | `/interview` (Page 1) |
| Page 3 | Session selector dropdown | Reload Page 3 with new session data |

---

## Global UX Rules
- No text inputs on any page — ever
- No code editors, terminals, or syntax highlighting
- All feedback is voice-driven or display-only
- Loading states: use a teal shimmer skeleton on cards (not a spinner)
- Empty states: teal-outlined empty card with a short message + icon