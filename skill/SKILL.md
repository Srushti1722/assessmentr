---
name: assessmentr-frontend
description: Build production-grade frontend pages and components for assessmentr — a voice-based CS interview prep platform. Project folder is "assessmentr". Use this skill for ANY frontend task: creating pages, building components, fixing styles, adding navigation, writing API calls, or setting up git workflow. Use this when building auth pages, login forms, signup forms, and custom JWT authentication. Trigger on mentions of "assessmentr", "mock interview page", "dashboard", "deep analysis", "knowledge graph", "speaking indicator", "waveform", "transcript", or any request to build/fix/style/structure anything in this project.
---

# assessmentr Frontend Skill
**Project:** `assessmentr`

The core of assessmentr is a **100% voice-based** CS technical interview prep platform. The interview environment has no code editors and uses voice only. The rest of the platform (Authentication, Settings, Resume Upload) behaves like a normal web app.

## Pages (Fixed — Never Rename)
| Page | File | Route |
|------|------|-------|
| Page 0 | `page0-auth-setup` | `/login`, `/register`, `/setup` |
| Page 1 | `page1-mockinterview` | `/interview` |
| Page 2 | `page2-dashboard` | `/dashboard` |
| Page 3 | `page3-analysis` | `/analysis` |

---

## How to Use This Skill

This master file points to 7 specialist files. **Always read the relevant file(s) before writing any code.**

### 1. `Design-skill.md` — Read this for:
- Color palette (CSS variables)
- Typography (Syne + DM Sans)
- Icons (Lucide — which icon to use where)
- Spacing, border radius, button styles
- Animations (mic pulse, waveform, LIVE dot, graph float)
- Responsive breakpoints and mobile layout rules

### 2. `product-skill.md` — Read this for:
- What each page contains (sections, components)
- Navigation behavior (navbar links, active states, mobile hamburger)
- What happens when user clicks/taps any button or tab
- Inter-page navigation (which page leads where)
- Empty states and loading states

### 3. `Software-skill.md` — Read this for:
- Directory structure (where to put files)
- When to create a new file, folder, or component
- Naming conventions (pages, components, hooks, services)
- API integration rules and service function pattern
- All API endpoints with curl examples and response shapes
- WebSocket setup for live transcription

### 4. `git-skill.md` — Read this for:
- Branch naming (`feature/page1-mic-button`)
- Commit message format (`feat(page1): add waveform animation`)
- Pull request checklist and template
- What never to commit (`.env`, `node_modules`)
- Release and versioning process

### 5. `FRONTEND_INTEGRATION_GUIDE.md` — Read this for:
- Connecting the frontend directly to the FastAPI backend API
- Authentication setup (Registration, JWT Login, Getting current user)
- Resume Uploading and Job target creation
- API polling for background Gemini tasks
- Integrating with the LiveKit Room Server

### 6. `FRONTEND_QUICKSTART.md` — Read this for:
- Step-by-step local setup of the Next.js frontend project
- Setting up the required LiveKit environment variables
- End-to-end testing of the full voice workflow locally 

### 7. `SHARE_WITH_FRONTEND_TEAM.md` — Read this for:
- Complete architectural summary linking the frontend, backend, and agent components
- Action items and checklist of all required feature implementations

---

## Quick Rules (Always Apply)

- ❌ No code editors, terminals, or syntax highlighting in the interview room
- ❌ No text input fields or keyboard-entry forms during the interview (Setup & Auth are exempt)
- ❌ No light mode — dark only
- ❌ Never use Inter, Roboto, Arial as fonts
- ✅ Voice controls only (mic, waveform, speaking indicator)
- ✅ Always use CSS variables from `Design-skill.md`
- ✅ Always put API calls in `src/services/`, never in components
- ✅ Always branch off `dev`, never commit to `main`

---

## Which File to Read Per Task

| Task | Read |
|------|------|
| Writing CSS or choosing colors | `Design-skill.md` |
| Building a component or page | `Design-skill.md` + `product-skill.md` |
| Adding a button or tab interaction | `product-skill.md` |
| Creating a new file or folder | `Software-skill.md` |
| Making an API call | `Software-skill.md` + `FRONTEND_INTEGRATION_GUIDE.md` |
| Integrating LiveKit WebRTC | `FRONTEND_INTEGRATION_GUIDE.md` |
| Committing or branching | `git-skill.md` |
| Opening a pull request | `git-skill.md` |
| Full page build from scratch | all 7 files |