---
name: assessmentr-software-engineering
description: Software engineering standards for the assessmentr frontend project. Read this before creating any new file, folder, or component, or before making any API call. Defines directory structure, naming conventions, when to create new files, API integration rules, and curl references.
---

# assessmentr Software Engineering Standards
**Project:** `assessmentr`

---

## Directory Structure

> ⚠️ **Actual stack: Next.js 14 (App Router)** — not a Vite SPA. The `src/` layout below is the *target* service/hook architecture. The live project uses `app/` for pages and route handlers.

```
assessmentr/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── aria-avatar.png          # AI interviewer portrait
│
├── app/                             # Next.js App Router — pages + API routes
│   ├── layout.tsx                   # Root layout (fonts, metadata)
│   ├── page.tsx                     # Home → redirects to /interview-setup
│   │
│   ├── interview-setup/             # Interview setup page (resume + JD)
│   │   ├── page.tsx                 # Upload resume, pick role, start session
│   │   ├── interview-setup.css
│   │   ├── roleData.ts              # ⭐ SEEDED DATA: ROLE_JDS + ROLE_GROUPS
│   │   │                            #    Pre-written JD templates for every role.
│   │   │                            #    Used by page.tsx to auto-fill the JD
│   │   │                            #    textarea when a role is selected.
│   │   │                            #    Use this (not a real API) for dev/demo.
│   │   └── mock-interview/
│   │       ├── page.tsx             # Live voice session (LiveKit + Casey-10be)
│   │       └── mock-interview.css
│   │
│   ├── auth/                        # Auth page (Supabase OAuth / email)
│   │
│   └── api/                         # Next.js internal API route handlers
│       ├── connection-details/      # POST — mints LiveKit JWT for a user
│       │   └── route.ts             # Real LiveKit token server (not mocked)
│       ├── me/                      # GET — returns current Supabase user
│       │   └── route.ts
│       ├── signout/                 # POST — calls supabase.auth.signOut()
│       │   └── route.ts
│       └── config/                  # GET — injects Supabase env vars as JS
│           └── route.ts
│
├── components/                      # Shared reusable components
│   ├── ui/                          # shadcn/ui primitives
│   ├── auth/                        # Auth-specific components
│   └── ai-elements/                 # Voice/AI indicator components
│
├── hooks/                           # Custom React hooks
│   ├── useAgentErrors.tsx           # LiveKit agent error handling
│   └── useDebug.ts                  # Debug logging hook
│
├── lib/                             # Shared utilities
│   ├── supabase/
│   │   ├── client.ts                # Browser-side Supabase client
│   │   └── server.ts                # Server-side Supabase client (RSC/route)
│   └── utils.ts                     # App config, LiveKit token source helpers
│
├── src/                             # Target service/hook architecture (WIP)
│   └── services/                    # API call functions (one file per domain)
│       ├── interviewService.js      # Interview session API calls
│       ├── dashboardService.js      # Dashboard/topics API calls
│       ├── analysisService.js       # Feedback/analysis API calls
│       ├── authService.js           # Auth helpers (wraps Supabase SDK)
│       └── resumeService.js         # Resume upload (wraps Supabase Storage)
│
├── package.json
├── next.config.js
└── .env.local                       # Supabase + LiveKit keys (never commit)
```

---

## When to Create a New File or Folder

### Create a new **page file** when:
- A new route is added (e.g., `/settings`, `/pricing`)
- Always place in `src/pages/`, use the naming pattern: `pageN-routename.jsx`

### Create a new **component file** when:
- A UI element is used on **2 or more pages**, OR
- A single component exceeds **150 lines** of JSX, OR
- A piece of UI has its own internal state and logic
- Place in `src/components/`, PascalCase name (e.g., `MicButton.jsx`)

### Create a new **hook file** when:
- Logic involves `useState` + `useEffect` together and is reused, OR
- The logic wraps a browser API (Speech, MediaDevices, WebSocket)
- Place in `src/hooks/`, prefix with `use` (e.g., `useSpeechRecognition.js`)

### Create a new **service file** when:
- Adding API calls for a new domain (not interview, dashboard, or analysis)
- Place in `src/services/`, suffix with `Service` (e.g., `userService.js`)
- **Auth** (`authService.js`) wraps `supabase.auth.*` — do NOT write raw fetch calls for login/signup
- **Resume** (`resumeService.js`) wraps `supabase.storage.from('resumes').upload(...)` — do NOT POST to a custom endpoint unless a real backend exists

### Do NOT create a new file when:
- The component is used only once and is under 80 lines — keep it inline in the page file
- It's just a styled wrapper with no logic — use a CSS class instead
- You're tempted to create a `utils/helpers.js` dumping ground — add to the specific existing util file

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Page files | `pageN-routename.jsx` | `page1-mockinterview.jsx` |
| Component files | PascalCase | `MicButton.jsx` |
| Hook files | camelCase, `use` prefix | `useTimer.js` |
| Service files | camelCase, `Service` suffix | `interviewService.js` |
| CSS classes | kebab-case | `.mic-button-active` |
| JS variables | camelCase | `sessionDuration` |
| JS constants | UPPER_SNAKE_CASE | `MAX_SESSION_MINUTES` |
| Environment variables | `VITE_` prefix | `VITE_API_BASE_URL` |

---

## Environment Variables

```env
# .env (never commit to git)
VITE_API_BASE_URL=https://api.assessmentr.com/api/v1
VITE_WS_URL=wss://ws.assessmentr.com
```

Access in code:
```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## API Integration Rules

1. **All API calls go in `src/services/`** — never call `fetch` directly inside a component or hook
2. **Always use `async/await`** — no `.then()` chains
3. **Always handle errors** — every service function must have a `try/catch`
4. **Never hardcode base URLs** — always use `import.meta.env.VITE_API_BASE_URL`
5. **Never expose API keys in frontend code** — keys go in `.env` only
6. **Use `roleData.ts` JD templates during dev/demo** — see the Mock / Seeded Data section below
7. **Loading states are required** — set `isLoading = true` before every API call, `false` after
8. **Use the skeleton component** (`<SkeletonCard />`) while loading, not spinners
9. **Auth calls use Supabase SDK** — `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, etc. Never use raw fetch for auth
10. **Resume upload uses Supabase Storage** — `supabase.storage.from('resumes').upload(path, file)` Only switch to a custom REST endpoint if a dedicated backend is introduced

### Standard Service Function Pattern
```js
// src/services/interviewService.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function startSession(payload) {
  try {
    const response = await fetch(`${BASE_URL}/interview/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[interviewService] startSession failed:', error);
    throw error;
  }
}
```

---

## API Endpoints & curl Reference

> Base URL: `https://api.assessmentr.com/api/v1`
> Auth: Bearer token in `Authorization` header

---

### Authentication

> ⚠️ **This project uses Supabase Auth SDK** for login/signup in the frontend code.
> However, the real backend also exposes these REST endpoints (confirmed in Swagger).
> Use the Supabase SDK in `authService.js`; reference the REST shape when integrating the backend directly.

#### A1. Register
```bash
curl -X POST https://api.assessmentr.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```
**Response:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2025-03-28T10:00:00Z"
}
```
**In code (Supabase SDK):**
```js
// src/services/authService.js
const supabase = createClient(); // from @/lib/supabase/client
await supabase.auth.signUp({ email, password });
```

#### A2. Login
```bash
curl -X POST https://api.assessmentr.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```
**Response:**
```json
{
  "userId": "user_123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 3600
}
```
**In code (Supabase SDK):**
```js
await supabase.auth.signInWithPassword({ email, password });
```

#### A3. Get Current User Info (Real backend endpoint)
```bash
curl -X GET https://api.assessmentr.com/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "name": "Alice"
}
```
**In code (Supabase SDK):**
```js
const { data: { user } } = await supabase.auth.getUser();
// Session auto-refreshes — manual refresh rarely needed.
```

#### A4. Sign Out (Internal Next.js route)
```bash
curl -X POST /api/signout
```
**Response:**
```json
{ "ok": true }
```
**In code:**
```js
await supabase.auth.signOut();
// or via the route handler:
await fetch('/api/signout', { method: 'POST' });
```

#### A5. Get Current User (Internal Next.js route)
```bash
curl -X GET /api/me
```
**Response:**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "Alice"
  }
}
```
> Returns `{ "user": null }` when unauthenticated. Used by components that need
> the server-verified user identity without calling Supabase directly.

---

### Resume

> ✅ **Confirmed in Swagger** — the backend exposes a full suite of resume REST endpoints.
> The frontend currently uploads via Supabase Storage directly (interim approach).
> Migrate to these endpoints in `resumeService.js` once the backend is deployed.

#### R1. Upload Resume
```bash
curl -X POST https://api.assessmentr.com/api/v1/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/resume.pdf"
```
**Request shape** (`multipart/form-data`):
| Field | Type | Required | Description                         |
|-------|------|----------|-------------------------------------|
| file  | File | ✅       | PDF or DOCX resume file (max 10 MB) |

**Response:**
```json
{
  "resumeId": "res_abc123",
  "userId": "user_123",
  "fileName": "resume.pdf",
  "uploadedAt": "2025-03-28T10:00:00Z",
  "parseStatus": "processing",
  "skills": [],
  "experience": []
}
```
**Current interim approach (Supabase Storage):**
```js
// app/interview-setup/page.tsx → to be moved to resumeService.js
const path = `resumes/${user.email}/${Date.now()}_${file.name}`;
await supabase.storage.from('resumes').upload(path, file, { upsert: true });
```

#### R2. Get Resume
```bash
curl -X GET https://api.assessmentr.com/api/v1/resume/{resume_id} \
  -H "Authorization: Bearer <token>"
```
**Response:** Resume object (same shape as R1 response).

#### R3. Delete Resume
```bash
curl -X DELETE https://api.assessmentr.com/api/v1/resume/{resume_id} \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{ "deleted": true, "resumeId": "res_abc123" }
```

#### R4. List Resumes
```bash
curl -X GET https://api.assessmentr.com/api/v1/resume/ \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "resumes": [
    { "resumeId": "res_abc123", "fileName": "resume.pdf", "uploadedAt": "2025-03-28T10:00:00Z" }
  ]
}
```

#### R5. Create Job Target (Job Description Profile)
```bash
curl -X POST https://api.assessmentr.com/api/v1/resume/job-target \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "resumeId": "res_abc123",
    "jobDescription": "We are looking for a Senior Backend Engineer...",
    "role": "backend-engineer-senior"
  }'
```
**Response:**
```json
{
  "profileId": "profile_xyz",
  "resumeId": "res_abc123",
  "role": "backend-engineer-senior",
  "createdAt": "2025-03-28T10:00:00Z"
}
```

#### R6. Get Job Target
```bash
curl -X GET https://api.assessmentr.com/api/v1/resume/job-target/{profile_id} \
  -H "Authorization: Bearer <token>"
```
**Response:** Job target profile object (same shape as R5 response).

#### R7. List Job Targets
```bash
curl -X GET https://api.assessmentr.com/api/v1/resume/job-targets/ \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "jobTargets": [
    { "profileId": "profile_xyz", "role": "backend-engineer-senior", "createdAt": "2025-03-28T10:00:00Z" }
  ]
}
```

---

### Interview

> ✅ **Confirmed in Swagger** — interview paths use `{session_id}` (not `/sessions/`).
> Previous docs had the wrong path shape. Use these exact paths in `interviewService.js`.

#### I1. Create Interview Session
```bash
curl -X POST https://api.assessmentr.com/api/v1/interview/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "resumeId": "res_abc123",
    "profileId": "profile_xyz",
    "role": "backend-engineer-senior"
  }'
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "status": "created",
  "createdAt": "2025-03-28T10:00:00Z"
}
```

#### I2. List Interview Sessions
```bash
curl -X GET https://api.assessmentr.com/api/v1/interview/ \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "sessions": [
    { "sessionId": "sess_abc123", "status": "completed", "createdAt": "2025-03-28T10:00:00Z" },
    { "sessionId": "sess_xyz789", "status": "completed", "createdAt": "2025-03-21T10:00:00Z" }
  ]
}
```

#### I3. Start Interview
```bash
curl -X POST https://api.assessmentr.com/api/v1/interview/{session_id}/start \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "status": "active",
  "firstQuestion": "Tell me about a distributed system you designed.",
  "startedAt": "2025-03-28T10:00:00Z"
}
```

#### I4. Send Message (Voice Turn)
```bash
curl -X POST https://api.assessmentr.com/api/v1/interview/{session_id}/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "role": "user",
    "content": "Consistent hashing distributes load by mapping keys to a ring...",
    "durationSeconds": 42
  }'
```
**Response:**
```json
{
  "messageId": "msg_001",
  "reply": "Good. How does consistent hashing handle node failures?",
  "role": "assistant"
}
```

#### I5. End Interview
```bash
curl -X POST https://api.assessmentr.com/api/v1/interview/{session_id}/end \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "status": "completed",
  "durationSeconds": 2520,
  "analysisReady": true
}
```

#### I6. Get Interview Session
```bash
curl -X GET https://api.assessmentr.com/api/v1/interview/{session_id} \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "status": "completed",
  "role": "backend-engineer-senior",
  "durationSeconds": 2520,
  "createdAt": "2025-03-28T10:00:00Z",
  "startedAt": "2025-03-28T10:01:00Z",
  "endedAt": "2025-03-28T10:43:00Z"
}
```

### Dashboard & Analysis

> ⚠️ Not yet confirmed in Swagger — shapes below are inferred from prior design and may change.

#### D1. Get Dashboard Data
```bash
curl -X GET https://api.assessmentr.com/api/v1/users/user_123/dashboard \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "totalSessions": 24,
  "avgClarityScore": 7.8,
  "weakestArea": "Operating Systems",
  "topics": [
    { "name": "Data Structures", "mastery": 78, "trend": "up" },
    { "name": "Algorithms",      "mastery": 65, "trend": "up" }
  ],
  "suggestedTopics": ["Operating Systems", "Machine Learning", "Dynamic Programming"]
}
```

#### D2. Get Session Analysis
```bash
curl -X GET https://api.assessmentr.com/api/v1/interview/{session_id}/analysis \
  -H "Authorization: Bearer <token>"
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "date": "2025-03-28",
  "durationMinutes": 42,
  "metrics": {
    "clarity": 82,
    "depth": 67,
    "confidence": 74
  },
  "feedback": {
    "positives": ["Strong explanation of load balancing trade-offs"],
    "improvements": ["Avoided quantifying latency numbers"]
  },
  "revisedFeedback": "Across your last 5 sessions...",
  "conceptTrends": [
    { "topic": "System Design", "scores": [60, 65, 70, 71, 74] }
  ]
}
```

### Default

#### Health Check
```bash
curl -X GET https://api.assessmentr.com/health
```
**Response:** `200 OK`

#### Root
```bash
curl -X GET https://api.assessmentr.com/
```
**Response:** `200 OK` — API info / version string.

---

## Internal Next.js API Routes (Real — Not Supabase, Not Custom Backend)

These route handlers live in `app/api/` and are part of the Next.js app itself.
They are **not** the Supabase REST API and **not** the assessmentr backend.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/connection-details` | POST | Mint a LiveKit JWT for the current user and return `{ serverUrl, roomName, participantToken, participantName }` |
| `/api/me` | GET | Return `{ user: { email, name } }` from the Supabase session, or `{ user: null }` |
| `/api/signout` | POST | Call `supabase.auth.signOut()` server-side, return `{ ok: true }` |
| `/api/config` | GET | Return Supabase URL + anon key as a JS snippet for static HTML pages |

> **LiveKit token generation** (`/api/connection-details`) is the key bridge between
> the frontend and the voice agent. It creates a unique room per user+timestamp and
> dispatches the `Casey-10be` agent into that room via `at.roomConfig`.

---

## Mock / Seeded Data — When to Use vs Real API

### `app/interview-setup/roleData.ts` ⭐ (primary mock data)

This is the **main seeded data file** in the project. It exports:
- `ROLE_JDS` — a dictionary of `{ roleKey → fullJobDescription }` for every supported role (50+ roles across Software Engineering, ML, Design, PM, etc.)
- `ROLE_GROUPS` — option groups used to populate the role `<select>` dropdown

**When to use it:**
- During dev/demo: selecting a role auto-fills the JD textarea from `ROLE_JDS` without any API call
- When adding a new interview role: add the JD text to `ROLE_JDS` and the option to `ROLE_GROUPS`
- Do NOT call a real API to fetch JDs — `roleData.ts` is the authoritative source

**When NOT to use it:**
- When a real resume-parsing or JD-generation API is integrated — at that point the auto-fill should call the API and `roleData.ts` becomes a fallback

### `src/data/mockData.js` (planned, does not exist yet)
Planned location for dev-only API response stubs. Create this file when you need to develop a UI component before the real API endpoint exists. Follow the same shape as the real API response. Delete mock data before merging to `main`.

### LiveKit `Casey-10be` agent & Gemini LLM
The voice agent (`agent/agent.py`) is **real infrastructure**, not mocked. It uses:
- Whisper STT + Gemini 1.5 Flash LLM + Google TTS
- Mem0 Cloud for persistent user memory across sessions
There is no mock agent — if `LIVEKIT_*` env vars are missing, the interview session will fail loudly at token fetch time.

---

## WebSocket — Real-time Transcript

For live transcription during mock interview, connect via WebSocket:

```js
// src/hooks/useSpeechRecognition.js
const ws = new WebSocket(import.meta.env.VITE_WS_URL + '/transcribe/' + sessionId);

ws.onmessage = (event) => {
  const { role, text, isFinal } = JSON.parse(event.data);
  // role: "user" | "assistant"
  // isFinal: true when word is confirmed, false for interim
};
```

---

## Tech Stack

```
Framework:    React 18 + Vite
Routing:      React Router v6
Styling:      CSS Modules or plain CSS (no Tailwind unless already set up)
Charts:       Recharts
Icons:        Lucide React
Fonts:        Google Fonts (Syne + DM Sans)
Speech API:   Web Speech API (browser-native, no library needed)
State:        useState / useContext (no Redux unless explicitly needed)
```

---

## Code Quality Rules
- No `console.log` in committed code — use `console.error` for error logging only
- No inline styles — all styles go in CSS files or CSS Modules
- Every component must have a JSDoc comment at the top describing what it does
- No `any` type if using TypeScript (prefer typed props)
- Max file length: 300 lines — split if longer