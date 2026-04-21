# Assessmentr - Frontend Integration Package

**Share this document and the files below with your frontend team.**

## 📦 What You Need to Know

Assessmentr is an **AI-powered technical interview preparation platform** with two core feature areas:

1. **Resume & Job-Target Context** — upload a resume (PDF/DOCX) and optionally create a job-target profile; the AI parses them and uses them to personalise interview questions.
2. **Mock Interview System** — a **real-time voice-based interview** where candidates speak with an AI interviewer through their microphone and speakers, powered by **LiveKit** WebRTC.

## 🚀 Quick Start (5 minutes)

Read: **`FRONTEND_QUICKSTART.md`** - Get up and running in 5 minutes with minimal code.

## 📚 Complete Documentation

Read: **`FRONTEND_INTEGRATION_GUIDE.md`** - Comprehensive guide with TypeScript interfaces, React components, and best practices.

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Frontend App   │
│  (React/Next)   │
└────────┬────────┘
         │ 1. Register / Login → JWT
         │ 2. Upload resume (optional)
         │ 3. Create job target (optional)
         │ 4. Create interview → LiveKit token
         ↓
┌─────────────────┐
│  Backend API    │
│  (FastAPI)      │
└────────┬────────┘
         │ 5. Returns LiveKit token
         ↓
┌─────────────────┐
│  LiveKit Server │
│  (WebRTC)       │
└────────┬────────┘
         │ 6. Real-time voice
         ↓
┌─────────────────┐
│  AI Agent       │
│  (Interviewer)  │
└─────────────────┘
```

## 🔑 Key Concepts

### 1. **Voice-Based Interview, Not Text-Based**
- Candidate speaks into microphone
- AI interviewer responds with voice
- No text chat during interview
- Full transcript + AI feedback available after interview ends

### 2. **LiveKit Handles the Interview**
- No manual API calls for AI responses during the interview
- AI agent joins the LiveKit room automatically
- Real-time audio streaming, low latency (~100-200 ms)

### 3. **Resume & Job-Target Context (Optional but Recommended)**
- Upload a PDF/DOCX resume → Gemini parses it in the background
- Create a job-target profile with a job title and optional description
- Pass `resume_id` / `job_target_id` when creating an interview for personalised questions

### 4. **Simple End-to-End Workflow**
```typescript
// 0. Register once / login
const { access_token } = await login(email, password);

// 1. (Optional) Upload resume → wait for parsing
const { resume_id } = await uploadResume(file);

// 2. (Optional) Create job target
const { id: job_target_id } = await createJobTarget({ job_title: 'SWE' });

// 3. Create interview → Get LiveKit token
const { session, livekit_token } = await createInterview({
  difficulty: 'medium',
  duration_minutes: 30,
  focus_topics: ['Python', 'Algorithms'],
  resume_id,       // optional
  job_target_id,   // optional
});

// 4. Connect to LiveKit room
await room.connect(LIVEKIT_URL, livekit_token.token);
await room.localParticipant.setMicrophoneEnabled(true);

// 5. Start interview
await startInterview(session.id);

// 6. [Voice conversation happens automatically]

// 7. End interview
await endInterview(session.id);
await room.disconnect();

// 8. Get transcript + AI feedback
const results = await getInterviewDetails(session.id);
```

## 📋 Required Packages

```bash
npm install livekit-client @livekit/components-react
```

## 🔌 API Endpoints

### API Documentation Access
The API docs (`/docs`, `/redoc`) require **separate developer credentials** (not the API user password):

```
1. Visit: http://localhost:8000/docs-login (or production equivalent)
2. Login with backend-team-provided docs credentials
3. You will be redirected to Swagger UI

To logout: Visit /docs-logout
```

---

### Authentication (`/api/v1/auth`)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/auth/register` | Create a new user account |
| `POST` | `/api/v1/auth/login` | Get a JWT access token |
| `GET`  | `/api/v1/auth/me` | Get current user profile |

```
POST /api/v1/auth/register
Body: { email: string, password: string (8-100 chars), full_name: string }
→ 201: { id, email, full_name, is_active, created_at }

POST /api/v1/auth/login
Body: { email: string, password: string }
→ 200: { access_token: string, token_type: "bearer" }

GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
→ 200: { id, email, full_name, is_active, created_at }
```

---

### Resume & Job Target (`/api/v1/resume`)

> All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/resume/upload` | Upload resume PDF/DOCX (async parsing) |
| `GET`  | `/api/v1/resume/{resume_id}` | Get a resume with parsed data |
| `GET`  | `/api/v1/resume/` | List current user's resumes |
| `DELETE` | `/api/v1/resume/{resume_id}` | Soft-delete a resume |
| `POST` | `/api/v1/resume/job-target` | Create a job-target profile |
| `GET`  | `/api/v1/resume/job-target/{id}` | Get a specific job-target profile |
| `GET`  | `/api/v1/resume/job-targets/` | List current user's job-target profiles |

**Resume upload** uses `multipart/form-data` (not JSON):
```
POST /api/v1/resume/upload
Content-Type: multipart/form-data
Field: file (PDF or DOCX, max 10 MB)
→ 201: { message: string, resume_id: UUID, parsed: false }
```
Parsing happens asynchronously via Gemini. Poll `GET /api/v1/resume/{resume_id}` until `skills`, `experiences`, etc. are populated.

**Resume response** shape (after parsing completes):
```
{
  id, user_id, file_name, file_size,
  summary: string | null,
  skills: [{ id, name, category, proficiency_level }],
  experiences: [{ id, company, position, start_date, end_date, is_current, description, technologies }],
  projects: [{ id, name, description, technologies, url }],
  education: [{ id, institution, degree, field_of_study, start_date, end_date, gpa }],
  is_active, created_at, updated_at
}
```

**Create job-target profile**:
```
POST /api/v1/resume/job-target
Body: { job_title: string, company?: string, job_description?: string }
→ 201: {
  id, user_id, job_title, company,
  required_skills, preferred_skills, responsibilities, qualifications,
  is_active, created_at, updated_at
}
```

---

### Mock Interview (`/api/v1/interview`)

> All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/interview/` | Create session + get LiveKit token |
| `POST` | `/api/v1/interview/{id}/start` | Transition session to `in_progress` |
| `POST` | `/api/v1/interview/{id}/end` | End session + trigger feedback |
| `POST` | `/api/v1/interview/{id}/message` | Store a candidate text message (fallback) |
| `GET`  | `/api/v1/interview/{id}` | Get session with full transcript + feedback |
| `GET`  | `/api/v1/interview/` | List user's sessions (paginated) |

**Create interview session**:
```
POST /api/v1/interview/
Body: {
  difficulty: 'easy' | 'medium' | 'hard',   // default: 'medium'
  duration_minutes: number,                  // 15–120, default: 30
  focus_topics?: string[],                   // optional
  resume_id?: UUID,                          // optional – personalises questions
  job_target_id?: UUID                       // optional – personalises questions
}
→ 201: {
  session: { id, user_id, resume_id, job_target_id, status, difficulty,
             livekit_room_name, livekit_room_sid, focus_topics, duration_minutes,
             started_at, ended_at, created_at, updated_at },
  livekit_token: { token, room_name, participant_identity, participant_name }
}
```

Session `status` values: `scheduled` → `in_progress` → `completed` (also `cancelled`, `failed`)

**Start interview**:
```
POST /api/v1/interview/{session_id}/start
→ 200: { id, status: 'in_progress', started_at }
```

**End interview**:
```
POST /api/v1/interview/{session_id}/end
→ 200: { id, status: 'completed', ended_at }
```

**Store candidate message (text fallback)**:
```
POST /api/v1/interview/{session_id}/message
Body: { content: string, audio_url?: string }
→ 200: { interaction_id, role: 'candidate', content, sequence_number }
```

**Get interview details** (transcript + feedback):
```
GET /api/v1/interview/{session_id}
→ 200: {
  id, status, difficulty, focus_topics, duration_minutes,
  started_at, ended_at, created_at, updated_at,
  interactions: [{
    id, session_id, sequence_number,
    role: 'interviewer' | 'candidate' | 'system',
    content, audio_url, transcript, extra_metadata, created_at
  }],
  feedback: {
    id, session_id,
    overall_score, technical_score, communication_score, problem_solving_score,
    strengths, weaknesses, improvement_suggestions,
    topics_covered, topics_struggled,
    detailed_analysis, summary, created_at
  } | null
}
```

**List sessions** (paginated, newest first):
```
GET /api/v1/interview/?limit=50&offset=0
→ 200: [ { id, status, difficulty, ... }, ... ]
```

---

## 🎯 What Frontend Needs to Build

### 1. **Auth Pages**
- Register / Login forms
- Persistent JWT storage (e.g. `localStorage` or cookie)
- Profile page (`/me`)

### 2. **Resume Management**
- Upload page (drag-and-drop PDF/DOCX)
- Polling / loading state while Gemini parses the resume
- Resume detail view (skills, experience, education)
- Resume list + delete

### 3. **Job-Target Profile**
- Create form (job title, company, job description)
- Profile detail view (required/preferred skills, responsibilities)
- Profile list

### 4. **Interview Setup Page**
- Resume selector (optional)
- Job-target selector (optional)
- Difficulty selection (`easy` / `medium` / `hard`)
- Focus topics input
- Duration selector (15-120 min)
- Microphone permission check → "Start Interview" button

### 5. **Interview Room Page**
- Microphone on/off indicator
- Timer (elapsed / total)
- Speaking state (AI speaking vs. candidate turn)
- "End Interview" button

### 6. **Results Page**
- Score dashboard (overall, technical, communication, problem-solving)
- Strengths / weaknesses / improvement suggestions
- Full transcript viewer (role-differentiated turns)

### 7. **Interview History Page**
- Paginated session list with status, date, score

## 🎨 UI/UX Recommendations

### During Interview
```
┌─────────────────────────────────────┐
│  Mock Interview - In Progress       │
├─────────────────────────────────────┤
│                                     │
│     🎤  AI Interviewer              │
│     "Can you explain the            │
│      difference between..."         │
│                                     │
│     ⏱️  15:32 / 30:00               │
│                                     │
│     🔴  You are speaking...         │
│                                     │
│     [End Interview]                 │
│                                     │
└─────────────────────────────────────┘
```

### After Interview
```
┌─────────────────────────────────────┐
│  Interview Results                  │
├─────────────────────────────────────┤
│  Overall Score: 85/100 ⭐⭐⭐⭐      │
│                                     │
│  Technical: 90/100                  │
│  Communication: 80/100              │
│  Problem Solving: 85/100            │
│                                     │
│  💪 Strengths:                      │
│  • Strong understanding of...       │
│  • Clear communication              │
│                                     │
│  📈 Areas to Improve:               │
│  • Consider edge cases              │
│  • Practice time complexity         │
│                                     │
│  [View Full Transcript]             │
└─────────────────────────────────────┘
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

# For production:
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.yourapp.com
```

## 🧪 Testing

### Local Development
1. Backend API: `http://localhost:8000`
2. LiveKit Server: `ws://localhost:7880`
3. API Docs: `http://localhost:8000/docs` (login required at `/docs-login`)

### End-to-End Test Flow
1. Register a new user account
2. Login → save JWT
3. Upload a resume, wait for parsing
4. Create a job-target profile
5. Create an interview session (pass `resume_id` + `job_target_id`)
6. Connect to LiveKit room with returned token
7. Enable microphone; call `/start`
8. Speak and verify AI responds
9. End interview; verify `/end` returns `completed`
10. Fetch session details; check `interactions` and `feedback`

## 🐛 Common Issues & Solutions

### "Can't hear AI interviewer"
- Check browser audio permissions
- Verify LiveKit server is running
- Ensure AI agent worker is running (backend team)

### "AI doesn't respond"
- Check microphone is enabled: `room.localParticipant.setMicrophoneEnabled(true)`
- Verify microphone permissions granted in browser
- Check audio is being transmitted (LiveKit dashboard)

### "Connection failed"
- Verify LiveKit URL uses `ws://` (not `http://`)
- Check token is valid and not expired (2-hour TTL)
- Ensure backend API is accessible

### "Resume not parsed yet"
- Parsing is async (Gemini in background)
- Poll `GET /api/v1/resume/{id}` until `skills` / `summary` are non-empty
- Typical parse time: 3-10 seconds

### "Participant disconnects immediately after joining"
If agent logs show `closing agent session due to participant disconnect`, the frontend is disconnecting. Common causes:

**React StrictMode Double Mount (Most Common):**
React 18+ StrictMode mounts components twice in development. Fix:
```typescript
const hasConnected = useRef(false);
useEffect(() => {
  if (hasConnected.current) return;
  hasConnected.current = true;
  room.connect(LIVEKIT_URL, token);
}, []);
```

**Audio Autoplay Blocked:**
```typescript
room.on(RoomEvent.TrackSubscribed, (track) => {
  if (track.kind === Track.Kind.Audio) {
    const el = track.attach();
    el.autoplay = true;
    el.muted = false;  // Must be unmuted
    document.body.appendChild(el);
  }
});
```

**Missing Room Options:**
```typescript
const room = new Room({
  adaptiveStream: true,
  dynacast: true,
});
```

**Debug with event logging:**
```typescript
room.on(RoomEvent.Connected, () => console.log('✅ Connected'));
room.on(RoomEvent.Disconnected, (reason) => console.log('❌ Disconnected:', reason));
room.on(RoomEvent.ConnectionStateChanged, (state) => console.log('🔄 State:', state));
```

## 📞 Support

**Backend Team Contact:**
- API Documentation: http://localhost:8000/docs (requires login at `/docs-login`)
- Architecture: See `LIVEKIT_AGENT_ARCHITECTURE.md`

**Docs Authentication:**
The API docs use separate credentials from API users. Request them from the backend team.

**External Resources:**
- LiveKit Client Docs: https://docs.livekit.io/client-sdk-js/
- LiveKit React Components: https://docs.livekit.io/guides/room/react/

## 📁 Files to Share

Share these files with your frontend team:

1. **`FRONTEND_QUICKSTART.md`** - 5-minute quick start guide
2. **`FRONTEND_INTEGRATION_GUIDE.md`** - Complete integration guide with TypeScript examples
3. **`SHARE_WITH_FRONTEND_TEAM.md`** - This file (overview + all endpoints)

## ✅ Checklist for Frontend Team

- [ ] Install `livekit-client` and `@livekit/components-react`
- [ ] Read `FRONTEND_QUICKSTART.md`
- [ ] Implement register + login flow (store JWT)
- [ ] Implement resume upload with polling for parsed state
- [ ] Implement job-target profile creation
- [ ] Implement interview creation (with optional resume/job-target context)
- [ ] Implement LiveKit room connection
- [ ] Add microphone controls
- [ ] Build interview room UI (timer, speaking state, end button)
- [ ] Build results / feedback display
- [ ] Build interview history list (paginated)
- [ ] Handle all error cases and loading states
- [ ] Test with real audio (microphone + speakers)

## 🎓 Learning Resources

### LiveKit Basics
- [LiveKit JavaScript SDK](https://docs.livekit.io/client-sdk-js/)
- [LiveKit React Components](https://docs.livekit.io/guides/room/react/)
- [LiveKit Examples](https://github.com/livekit/livekit-examples)

### Code Examples
See `FRONTEND_INTEGRATION_GUIDE.md` for:
- Complete TypeScript interfaces matching the backend schemas
- Full React component example
- Resume upload + polling pattern
- Error handling and best practices

---

**Questions?** Contact the backend team for docs credentials, then check the API documentation at http://localhost:8000/docs
