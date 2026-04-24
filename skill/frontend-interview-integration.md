# Frontend Integration Guide — Interview & Post-Interview Features


## Table of Contents

1. [Full Interview Lifecycle Flow](#1-full-interview-lifecycle-flow)
2. [API Reference](#2-api-reference)
   - [Create Session](#21-create-session)
   - [Start Interview](#22-start-interview)
   - [End Interview (triggers AI feedback)](#23-end-interview)
   - [Send Message (text fallback)](#24-send-message)
   - [Get Session Details](#25-get-session-details)
   - [Get Feedback](#26-get-feedback)
   - [Regenerate Feedback](#27-regenerate-feedback)
   - [List Sessions](#28-list-sessions)
3. [TypeScript Types](#3-typescript-types)
4. [Complete UI Flow Walkthrough](#4-complete-ui-flow-walkthrough)
5. [Feedback UI Recommendations](#5-feedback-ui-recommendations)
6. [Error Handling Reference](#6-error-handling-reference)

---

## 1. Full Interview Lifecycle Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Create Session                                   │
│  POST /interview/                                        │
│  ← returns session_id + LiveKit token                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ STEP 2: Connect to LiveKit Room                          │
│  Use livekit_token.token with @livekit/client SDK        │
│  AI voice agent auto-joins and starts interviewing       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ STEP 3: Start Interview                                  │
│  POST /interview/{session_id}/start                      │
│  Call this when candidate connects + is ready            │
└──────────────────────┬──────────────────────────────────┘
                       │
               [ Interview runs via voice ]
                       │
┌──────────────────────▼──────────────────────────────────┐
│ STEP 4: End Interview                                    │
│  POST /interview/{session_id}/end                        │
│  ← AI feedback auto-generated synchronously             │
│  ← feedback_generated: true/false in response           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│ STEP 5: Show Feedback                                    │
│  GET /interview/{session_id}/feedback                    │
│  ← scores, strengths, weaknesses, suggestions           │
└─────────────────────────────────────────────────────────┘
```

> **Important timing note:** `POST /end` calls Gemini synchronously. Expect **~3–6 seconds** added latency. Show a loading state on the "End Interview" button — do not navigate away until the response arrives.

---

## 2. API Reference

### 2.1 Create Session

```
POST /interview/
```

**Request body:**
```json
{
  "difficulty": "easy" | "medium" | "hard",
  "focus_topics": ["algorithms", "system design"],   // optional
  "duration_minutes": 30,                             // 15-120, default 30
  "resume_id": "<uuid>",                              // optional
  "job_target_id": "<uuid>"                           // optional
}
```

**Response `201`:**
```json
{
  "session": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "...",
    "status": "scheduled",
    "difficulty": "medium",
    "livekit_room_name": "interview-3fa85f64-abc123",
    "livekit_room_sid": "RM_xyz",
    "focus_topics": ["algorithms"],
    "duration_minutes": 30,
    "resume_id": null,
    "job_target_id": null,
    "started_at": null,
    "ended_at": null,
    "created_at": "2026-04-22T12:00:00Z",
    "updated_at": "2026-04-22T12:00:00Z"
  },
  "livekit_token": {
    "token": "<signed JWT>",
    "room_name": "interview-3fa85f64-abc123",
    "participant_identity": "user-<uuid>",
    "participant_name": "John Doe"
  }
}
```

**Usage:**
```ts
const { session, livekit_token } = await createSession({ difficulty: 'medium' });
// Store session.id for all subsequent calls
// Connect to LiveKit using livekit_token.token
```

---

### 2.2 Start Interview

```
POST /interview/{session_id}/start
```

No request body.

**Response `200`:**
```json
{
  "id": "3fa85f64-...",
  "status": "in_progress",
  "started_at": "2026-04-22T12:01:00Z"
}
```

Call this **after** the candidate has connected to the LiveKit room and is ready.

---

### 2.3 End Interview

```
POST /interview/{session_id}/end
```

No request body.

**Response `200`:**
```json
{
  "id": "3fa85f64-...",
  "status": "completed",
  "ended_at": "2026-04-22T12:31:00Z",
  "feedback_generated": true
}
```

**`feedback_generated`** tells you whether Gemini successfully produced feedback:
- `true` → call `GET /feedback` immediately
- `false` → Gemini failed silently; show a retry option using `POST /feedback/regenerate`

> This endpoint may take **3–6 seconds** due to synchronous Gemini call. Show a spinner.

---

### 2.4 Send Message (text fallback)

```
POST /interview/{session_id}/message
```

Only needed for text-based fallback UIs. In the standard voice flow, the agent handles transcript storage automatically.

**Request body:**
```json
{
  "content": "My answer to the question...",
  "audio_url": "https://storage.example.com/audio/clip.mp3"  // optional
}
```

**Response `200`:**
```json
{
  "interaction_id": "...",
  "role": "candidate",
  "content": "My answer to the question...",
  "sequence_number": 5
}
```

---

### 2.5 Get Session Details

```
GET /interview/{session_id}
```

Returns the full session with complete transcript and feedback (if generated).

**Response `200`:**
```json
{
  "id": "...",
  "status": "completed",
  "difficulty": "medium",
  "focus_topics": ["algorithms"],
  "duration_minutes": 30,
  "started_at": "2026-04-22T12:01:00Z",
  "ended_at": "2026-04-22T12:31:00Z",
  "interactions": [
    {
      "id": "...",
      "session_id": "...",
      "sequence_number": 1,
      "role": "system",
      "content": "Interview session started",
      "audio_url": null,
      "transcript": null,
      "extra_metadata": null,
      "created_at": "2026-04-22T12:01:00Z"
    },
    {
      "sequence_number": 2,
      "role": "interviewer",
      "content": "Tell me about your experience with Python.",
      ...
    },
    {
      "sequence_number": 3,
      "role": "candidate",
      "content": "I have 3 years of Python experience...",
      ...
    }
  ],
  "feedback": { /* InterviewFeedback object or null */ }
}
```

**Interaction `role` values:**
| Value | Meaning |
|-------|---------|
| `"interviewer"` | AI agent message |
| `"candidate"` | Human candidate message |
| `"system"` | Lifecycle event (session started/ended) |

---

### 2.6 Get Feedback

```
GET /interview/{session_id}/feedback
```

**Response `200`:**
```json
{
  "id": "...",
  "session_id": "3fa85f64-...",
  "overall_score": 75,
  "technical_score": 70,
  "communication_score": 80,
  "problem_solving_score": 75,
  "strengths": [
    "Clear explanation of algorithms",
    "Good communication style"
  ],
  "weaknesses": [
    "Lacks depth on system design",
    "Struggled with time complexity analysis"
  ],
  "improvement_suggestions": [
    "Practice system design problems on Grokking the System Design Interview",
    "Review Big-O notation and complexity analysis"
  ],
  "topics_covered": ["algorithms", "data structures"],
  "topics_struggled": ["system design", "time complexity"],
  "summary": "The candidate demonstrated solid fundamental knowledge with clear communication. Some gaps in system design were noted.",
  "detailed_analysis": "The candidate showed good understanding of core algorithms... [2-4 paragraphs]",
  "created_at": "2026-04-22T12:32:05Z"
}
```

**Errors:**
- `404` — feedback not yet generated (call `POST /feedback/regenerate` to trigger)

---

### 2.7 Regenerate Feedback

```
POST /interview/{session_id}/feedback/regenerate
```

No request body. Deletes existing feedback (if any) and re-runs Gemini analysis.

**Requirements:** Session must be in `completed` status.

**Response `200`:** Same shape as [Get Feedback](#26-get-feedback).

**Errors:**
- `400` — session not in `completed` status
- `404` — session not found
- `500` — Gemini generation failed

---

### 2.8 List Sessions

```
GET /interview/?limit=50&offset=0
```

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 50 | Max results |
| `offset` | int | 0 | Pagination offset |

**Response `200`:** Array of session summary objects (no interactions, no feedback).

---

## 3. TypeScript Types

```ts
// Enums
type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
type InterviewDifficulty = 'easy' | 'medium' | 'hard';
type MessageRole = 'interviewer' | 'candidate' | 'system';

// Create request
interface CreateSessionRequest {
  difficulty?: InterviewDifficulty;       // default: 'medium'
  focus_topics?: string[];
  duration_minutes?: number;              // 15–120, default: 30
  resume_id?: string;                     // UUID
  job_target_id?: string;                 // UUID
}

// LiveKit token bundle
interface LiveKitTokenResponse {
  token: string;
  room_name: string;
  participant_identity: string;
  participant_name: string;
}

// Session summary (list view)
interface InterviewSession {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_target_id: string | null;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  livekit_room_name: string | null;
  livekit_room_sid: string | null;
  focus_topics: string[] | null;
  duration_minutes: number;
  started_at: string | null;              // ISO 8601
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

// Single transcript turn
interface InterviewInteraction {
  id: string;
  session_id: string;
  sequence_number: number;
  role: MessageRole;
  content: string;
  audio_url: string | null;
  transcript: string | null;
  extra_metadata: Record<string, unknown> | null;
  created_at: string;
}

// Post-interview AI feedback
interface InterviewFeedback {
  id: string;
  session_id: string;
  overall_score: number;                  // 0–100
  technical_score: number;               // 0–100
  communication_score: number;           // 0–100
  problem_solving_score: number;         // 0–100
  strengths: string[];                   // ≥2 items
  weaknesses: string[];                  // ≥2 items
  improvement_suggestions: string[];     // ≥2 items
  topics_covered: string[];
  topics_struggled: string[];
  summary: string;
  detailed_analysis: string | null;
  created_at: string;
}

// Full session (detail view)
interface InterviewSessionDetail extends InterviewSession {
  interactions: InterviewInteraction[];
  feedback: InterviewFeedback | null;
}

// POST / response
interface CreateSessionResponse {
  session: InterviewSession;
  livekit_token: LiveKitTokenResponse;
}

// POST /{id}/end response
interface EndInterviewResponse {
  id: string;
  status: InterviewStatus;
  ended_at: string;
  feedback_generated: boolean;
}
```

---

## 4. Complete UI Flow Walkthrough

### Pre-Interview Page

```ts
// 1. User clicks "Start Interview"
const response = await fetch('/api/v1/interview/', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    difficulty: 'medium',
    focus_topics: ['algorithms', 'system design'],
    duration_minutes: 30,
  }),
});
const { session, livekit_token }: CreateSessionResponse = await response.json();

// 2. Connect to LiveKit room using the official SDK
import { Room } from '@livekit/client';
const room = new Room();
await room.connect(LIVEKIT_SERVER_URL, livekit_token.token);
// AI agent joins automatically — it reads the session context and begins the interview

// 3. Notify backend that the interview has started
await fetch(`/api/v1/interview/${session.id}/start`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
```

### During Interview

The AI agent handles all voice I/O via the LiveKit room. No polling needed.

Optionally display a live timer based on `session.duration_minutes`.

### Ending the Interview

```ts
// Show a spinner — this call takes 3–6 seconds (Gemini runs synchronously)
setLoading(true);

const endRes = await fetch(`/api/v1/interview/${session.id}/end`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
const { feedback_generated }: EndInterviewResponse = await endRes.json();

setLoading(false);

if (feedback_generated) {
  // Navigate directly to feedback page
  router.push(`/interview/${session.id}/feedback`);
} else {
  // Feedback failed silently — show retry
  showRetryBanner();
}
```

### Feedback Page

```ts
// Fetch feedback
const fbRes = await fetch(`/api/v1/interview/${session.id}/feedback`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (fbRes.status === 404) {
  // Not generated yet — offer regeneration
  showRegenerateOption();
  return;
}

const feedback: InterviewFeedback = await fbRes.json();
renderFeedbackUI(feedback);

// Regenerate (if user requests)
async function handleRegenerate() {
  setRegenerating(true);
  const regenRes = await fetch(`/api/v1/interview/${session.id}/feedback/regenerate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const newFeedback: InterviewFeedback = await regenRes.json();
  renderFeedbackUI(newFeedback);
  setRegenerating(false);
}
```

---

## 5. Feedback UI Recommendations

### Score Display

All four scores are integers `0–100`. Suggested visual treatment:

| Score range | Color / Label |
|-------------|--------------|
| 0–39 | 🔴 Needs Improvement |
| 40–59 | 🟡 Fair |
60–79 | 🟢 Good |
| 80–100 | 🔵 Excellent |

Suggested layout:

```
┌─────────────────────────────────────────┐
│  Overall Score          75 / 100        │
│  ████████████░░░░ 75%                   │
├──────────────────────────────────────── │
│  Technical          70  │  Communication 80 │
│  Problem Solving    75  │                   │
└─────────────────────────────────────────┘
```

### Sections to Render

```
✅ Strengths          (strengths[])
❌ Weaknesses         (weaknesses[])
💡 Suggestions        (improvement_suggestions[])
📚 Topics Covered     (topics_covered[])  — show as tags/chips
⚠️  Topics to Improve (topics_struggled[]) — show as tags/chips
📝 Summary            (summary)           — card header
📄 Detailed Analysis  (detailed_analysis) — expandable section
```

### Score Weights (for UI context)

The backend calculates `overall_score` using:
- **Technical:** 50%
- **Communication:** 25%
- **Problem Solving:** 25%

Display this weighting to candidates for transparency.

---

## 6. Error Handling Reference

| Status | When | What to show |
|--------|------|-------------|
| `400` | Regenerate on non-completed session | "Interview must be completed first." |
| `401/403` | Missing/invalid auth token | Redirect to login |
| `404` on feedback | Feedback not yet generated | "Analysis not available — [Retry]" button |
| `404` on session | Invalid session UUID | Redirect to sessions list |
| `422` | Invalid request body (e.g. duration < 15) | Form validation error |
| `500` on end | Unexpected backend error | "Something went wrong. Please try again." |
| `500` on regenerate | Gemini unavailable | "AI analysis temporarily unavailable. Try again in a moment." |

---

## Quick Reference — All Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/interview/` | ✅ | Create session + get LiveKit token |
| `POST` | `/interview/{id}/start` | ✅ | Mark session IN_PROGRESS |
| `POST` | `/interview/{id}/end` | ✅ | Complete session + auto-generate feedback |
| `POST` | `/interview/{id}/message` | ✅ | Text fallback: store candidate message |
| `GET` | `/interview/{id}` | ✅ | Full session with transcript + feedback |
| `GET` | `/interview/{id}/feedback` | ✅ | Get AI feedback only |
| `POST` | `/interview/{id}/feedback/regenerate` | ✅ | Re-run AI feedback generation |
| `GET` | `/interview/` | ✅ | List user's sessions (paginated) |
