# Frontend Integration Guide - Assessmentr

## Overview

Assessmentr is an AI-powered technical interview preparation platform. The backend exposes:

1. **Auth API** — register, login, current user
2. **Resume & Job-Target API** — upload resume (PDF/DOCX), create job-target profiles; both are parsed asynchronously by Gemini
3. **Mock Interview API** — create and conduct real-time voice-based interviews via **LiveKit** WebRTC

## Architecture

```
Frontend App → Backend API (FastAPI)
                    ↓
     ┌──────────────┼──────────────┐
     ↓              ↓              ↓
  Auth DB     Resume/JobTarget  LiveKit Server ← AI Agent Worker
              (Gemini parsing)   (WebRTC voice)
```

## Installation

### Required Packages

```bash
# Core LiveKit client
npm install livekit-client

# Optional: React components (recommended for polished UI)
npm install @livekit/components-react @livekit/components-styles
```

---

## TypeScript Interfaces

### Auth

```typescript
interface UserCreate {
  email: string;
  password: string;  // 8-100 characters
  full_name: string; // 1-255 characters
}

interface UserLogin {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;           // UUID
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;   // ISO 8601 UTC
}

interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}
```

### Resume

```typescript
interface SkillSchema {
  id: string;
  name: string;
  category: string | null;
  proficiency_level: string | null;
}

interface ExperienceSchema {
  id: string;
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  technologies: string[];
}

interface ProjectSchema {
  id: string;
  name: string;
  description: string | null;
  technologies: string[];
  url: string | null;
}

interface EducationSchema {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
}

interface ResumeResponse {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  summary: string | null;          // null until Gemini parsing completes
  skills: SkillSchema[];
  experiences: ExperienceSchema[];
  projects: ProjectSchema[];
  education: EducationSchema[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ResumeUploadResponse {
  message: string;
  resume_id: string;   // UUID
  parsed: false;       // always false at upload time; poll to check
}
```

### Job-Target Profile

```typescript
interface JobTargetProfileCreate {
  job_title: string;
  company?: string;           // optional
  job_description?: string;   // optional – Gemini infers if omitted
}

interface JobTargetProfileResponse {
  id: string;
  user_id: string;
  job_title: string;
  company: string | null;
  job_description: string | null;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  qualifications: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Mock Interview

```typescript
type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
type InterviewDifficulty = 'easy' | 'medium' | 'hard';
type MessageRole = 'interviewer' | 'candidate' | 'system';

interface InterviewSessionCreate {
  difficulty?: InterviewDifficulty;    // default: 'medium'
  duration_minutes?: number;           // 15–120, default: 30
  focus_topics?: string[] | null;      // optional
  resume_id?: string | null;           // optional UUID
  job_target_id?: string | null;       // optional UUID
}

interface LiveKitTokenResponse {
  token: string;                 // Signed JWT, 2-hour TTL
  room_name: string;
  participant_identity: string;  // e.g. "user-<uuid>"
  participant_name: string;
}

interface InterviewSessionSchema {
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
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

interface InterviewStartResponse {
  session: InterviewSessionSchema;
  livekit_token: LiveKitTokenResponse;
}

interface InterviewInteractionSchema {
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

interface InterviewFeedbackSchema {
  id: string;
  session_id: string;
  overall_score: number;           // 0-100
  technical_score: number;         // 0-100
  communication_score: number;     // 0-100
  problem_solving_score: number;   // 0-100
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  topics_covered: string[];
  topics_struggled: string[];
  detailed_analysis: string | null;
  summary: string;
  created_at: string;
}

interface InterviewSessionDetailSchema extends InterviewSessionSchema {
  interactions: InterviewInteractionSchema[];
  feedback: InterviewFeedbackSchema | null;
}

interface InterviewMessageRequest {
  content: string;
  audio_url?: string;
}

interface InterviewMessageResponse {
  interaction_id: string;
  role: MessageRole;
  content: string;
  sequence_number: number;
}
```

---

## Step-by-Step Integration

### Step 1: Authentication

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

async function register(data: UserCreate): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const { access_token } = await res.json() as TokenResponse;
  return access_token;
}

async function getMe(authToken: string): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}
```

### Step 2: Upload Resume (Optional)

Resume upload uses `multipart/form-data`. Parsing is **asynchronous** — poll until complete.

```typescript
async function uploadResume(
  authToken: string,
  file: File   // PDF or DOCX, max 10 MB
): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/resume/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: form,
    // Do NOT set Content-Type — browser sets it with the boundary automatically
  });
  if (!res.ok) throw new Error('Upload failed');
  const { resume_id } = await res.json() as ResumeUploadResponse;
  return resume_id;
}

async function pollUntilParsed(
  authToken: string,
  resumeId: string,
  intervalMs = 2000,
  maxAttempts = 30
): Promise<ResumeResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${API_URL}/resume/${resumeId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const resume: ResumeResponse = await res.json();
    if (resume.summary !== null) return resume;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Resume parsing timed out');
}

async function listResumes(authToken: string): Promise<ResumeResponse[]> {
  const res = await fetch(`${API_URL}/resume/`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  return res.json();
}

async function deleteResume(authToken: string, resumeId: string): Promise<void> {
  await fetch(`${API_URL}/resume/${resumeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
}
```

### Step 3: Create Job-Target Profile (Optional)

```typescript
async function createJobTarget(
  authToken: string,
  data: JobTargetProfileCreate
): Promise<JobTargetProfileResponse> {
  const res = await fetch(`${API_URL}/resume/job-target`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create job target');
  return res.json();
}

async function listJobTargets(authToken: string): Promise<JobTargetProfileResponse[]> {
  const res = await fetch(`${API_URL}/resume/job-targets/`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  return res.json();
}

async function getJobTarget(authToken: string, id: string): Promise<JobTargetProfileResponse> {
  const res = await fetch(`${API_URL}/resume/job-target/${id}`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error('Job target not found');
  return res.json();
}
```

### Step 4: Create Interview Session

```typescript
async function createInterview(
  authToken: string,
  request: InterviewSessionCreate
): Promise<InterviewStartResponse> {
  const response = await fetch(`${API_URL}/interview/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to create interview session');
  }

  return response.json();
}
```

### Step 5: Connect to LiveKit Room

Use the token from the interview creation response to connect.

```typescript
import { Room, RoomEvent, Track } from 'livekit-client';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? 'ws://localhost:7880';

async function joinInterview(token: string): Promise<Room> {
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    if (track.kind === Track.Kind.Audio) {
      const element = track.attach();
      element.autoplay = true;
      document.body.appendChild(element);
    }
  });

  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    track.detach();
  });

  room.on(RoomEvent.Disconnected, () => {
    console.log('Disconnected from interview room');
  });

  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log('AI Interviewer joined:', participant.identity);
  });

  await room.connect(LIVEKIT_URL, token);
  await room.localParticipant.setMicrophoneEnabled(true);

  return room;
}
```

### Step 6: Start Interview

```typescript
async function startInterview(authToken: string, sessionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/interview/${sessionId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  if (!response.ok) throw new Error('Failed to start interview');
}
```

### Step 7: End Interview

Disconnect from LiveKit **before** calling `/end`.

```typescript
async function endInterview(
  authToken: string,
  sessionId: string,
  room: Room
): Promise<void> {
  await room.disconnect();

  const response = await fetch(`${API_URL}/interview/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  if (!response.ok) throw new Error('Failed to end interview');
}
```

### Step 8: Get Interview Details & Feedback

```typescript
async function getInterviewDetails(
  authToken: string,
  sessionId: string
): Promise<InterviewSessionDetailSchema> {
  const response = await fetch(`${API_URL}/interview/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  if (!response.ok) throw new Error('Failed to get interview details');
  return response.json();
}

async function listInterviews(
  authToken: string,
  limit = 50,
  offset = 0
): Promise<InterviewSessionSchema[]> {
  const res = await fetch(`${API_URL}/interview/?limit=${limit}&offset=${offset}`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  return res.json();
}
```

### Step 9: Store Candidate Message (Text Fallback)

Only needed if you want to support a text-input fallback alongside the voice interview.

```typescript
async function sendMessage(
  authToken: string,
  sessionId: string,
  content: string,
  audioUrl?: string
): Promise<InterviewMessageResponse> {
  const res = await fetch(`${API_URL}/interview/${sessionId}/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, audio_url: audioUrl }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
```

---

## Complete React Component Example

```typescript
import React, { useState, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? 'ws://localhost:7880';

interface InterviewProps {
  authToken: string;
  resumeId?: string;       // optional – from prior upload
  jobTargetId?: string;    // optional – from prior job-target creation
  onComplete: (sessionId: string) => void;
}

export function InterviewComponent({ authToken, resumeId, jobTargetId, onComplete }: InterviewProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'ending'>('idle');
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  const startInterview = async () => {
    try {
      setStatus('connecting');
      setError(null);

      // 1. Create interview session
      const res = await fetch(`${API_URL}/interview/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: 'medium',
          duration_minutes: 30,
          focus_topics: ['Python', 'Data Structures', 'Algorithms'],
          resume_id: resumeId ?? null,
          job_target_id: jobTargetId ?? null,
        } satisfies InterviewSessionCreate),
      });

      if (!res.ok) throw new Error('Failed to create interview');
      const { session, livekit_token } = await res.json() as InterviewStartResponse;
      setSessionId(session.id);

      // 2. Connect to LiveKit room
      const room = new Room({ adaptiveStream: true, dynacast: true });

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.autoplay = true;
          document.body.appendChild(el);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => track.detach());

      await room.connect(LIVEKIT_URL, livekit_token.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;

      // 3. Start interview
      await fetch(`${API_URL}/interview/${session.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      setStatus('active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('idle');
    }
  };

  const endInterview = async () => {
    if (!sessionId || !roomRef.current) return;
    try {
      setStatus('ending');
      await roomRef.current.disconnect();

      await fetch(`${API_URL}/interview/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      onComplete(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end interview');
    }
  };

  return (
    <div className="interview-container">
      <h2>Mock Interview</h2>

      {status === 'idle' && (
        <button onClick={startInterview}>Start Interview</button>
      )}

      {status === 'connecting' && <div>Connecting to interview room...</div>}

      {status === 'active' && (
        <div>
          <div className="status">🎤 Interview in progress...</div>
          <div className="instructions">Speak naturally. The AI will ask you questions.</div>
          <button onClick={endInterview}>End Interview</button>
        </div>
      )}

      {status === 'ending' && <div>Ending interview...</div>}

      {error && <div className="error">Error: {error}</div>}
    </div>
  );
}
```

---

## Using LiveKit React Components (Recommended)

For a more polished UI, use LiveKit's React components:

```typescript
import { LiveKitRoom, AudioTrack, useParticipants } from '@livekit/components-react';
import '@livekit/components-styles';

export function InterviewWithComponents({ authToken, livekitUrl }: { authToken: string; livekitUrl: string }) {
  const [token, setToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const createInterview = async () => {
    const res = await fetch(`${API_URL}/interview/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: 'medium',
        duration_minutes: 30,
        focus_topics: ['Python', 'Algorithms'],
      } satisfies InterviewSessionCreate),
    });

    const { session, livekit_token } = await res.json() as InterviewStartResponse;
    setSessionId(session.id);
    setToken(livekit_token.token);

    await fetch(`${API_URL}/interview/${session.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
  };

  if (!token) {
    return <button onClick={createInterview}>Start Interview</button>;
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
    >
      <InterviewRoom sessionId={sessionId} authToken={authToken} />
    </LiveKitRoom>
  );
}

function InterviewRoom({ sessionId, authToken }: { sessionId: string; authToken: string }) {
  const participants = useParticipants();

  const endInterview = async () => {
    await fetch(`${API_URL}/interview/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
  };

  return (
    <div>
      <h3>Interview Active</h3>
      <p>Participants: {participants.length}</p>

      {participants.map((participant) => (
        <div key={participant.identity}>
          {participant.identity}
          {participant.audioTrackPublications.map((pub) =>
            pub.track ? <AudioTrack key={pub.trackSid} trackRef={pub} /> : null
          )}
        </div>
      ))}

      <button onClick={endInterview}>End Interview</button>
    </div>
  );
}
```

---

## API Endpoints Reference

### Authentication

```
POST /api/v1/auth/register
Body: { "email": string, "password": string (8-100 chars), "full_name": string }
→ 201: UserResponse

POST /api/v1/auth/login
Body: { "email": string, "password": string }
→ 200: { "access_token": string, "token_type": "bearer" }

GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
→ 200: UserResponse
```

### Resume

```
POST /api/v1/resume/upload
Headers: Authorization: Bearer <token>
Body: multipart/form-data  (field: "file", PDF or DOCX ≤ 10 MB)
→ 201: { "message": string, "resume_id": UUID, "parsed": false }

GET /api/v1/resume/{resume_id}
Headers: Authorization: Bearer <token>
→ 200: ResumeResponse  (poll until summary != null)

GET /api/v1/resume/
Headers: Authorization: Bearer <token>
→ 200: ResumeResponse[]

DELETE /api/v1/resume/{resume_id}
Headers: Authorization: Bearer <token>
→ 204: (no content)
```

### Job-Target Profile

```
POST /api/v1/resume/job-target
Headers: Authorization: Bearer <token>
Body: { "job_title": string, "company"?: string, "job_description"?: string }
→ 201: JobTargetProfileResponse

GET /api/v1/resume/job-target/{profile_id}
Headers: Authorization: Bearer <token>
→ 200: JobTargetProfileResponse

GET /api/v1/resume/job-targets/
Headers: Authorization: Bearer <token>
→ 200: JobTargetProfileResponse[]
```

### Mock Interview

```
POST /api/v1/interview/
Headers: Authorization: Bearer <token>
Body: {
  "difficulty"?: "easy" | "medium" | "hard",   // default: "medium"
  "duration_minutes"?: number,                  // 15–120, default: 30
  "focus_topics"?: string[],                    // optional
  "resume_id"?: UUID,                           // optional
  "job_target_id"?: UUID                        // optional
}
→ 201: InterviewStartResponse

POST /api/v1/interview/{session_id}/start
Headers: Authorization: Bearer <token>
→ 200: { "id": UUID, "status": "in_progress", "started_at": string }

POST /api/v1/interview/{session_id}/end
Headers: Authorization: Bearer <token>
→ 200: { "id": UUID, "status": "completed", "ended_at": string }

POST /api/v1/interview/{session_id}/message
Headers: Authorization: Bearer <token>
Body: { "content": string, "audio_url"?: string }
→ 200: { "interaction_id": UUID, "role": "candidate", "content": string, "sequence_number": number }

GET /api/v1/interview/{session_id}
Headers: Authorization: Bearer <token>
→ 200: InterviewSessionDetailSchema

GET /api/v1/interview/?limit=50&offset=0
Headers: Authorization: Bearer <token>
→ 200: InterviewSessionSchema[]
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

# Production:
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api/v1
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.yourapp.com
```

---

## Important Notes

### 1. **No Manual AI Interaction During Interview**
The AI interviewer joins automatically and speaks through LiveKit. No AI-specific endpoints need to be called during the interview.

### 2. **Real-Time Voice Only**
The interview happens entirely through voice. The AI speaks questions; the candidate responds via microphone.

### 3. **Microphone Permissions**
Request microphone permission before starting the interview.

```typescript
async function requestMicrophonePermission(): Promise<boolean> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    return false;
  }
}
```

### 4. **Resume Parsing is Asynchronous**
After upload, `parsed: false` is returned immediately. Gemini parses the resume in the background (typically 3-10 s). Poll `GET /resume/{id}` until `summary` is non-null before using the `resume_id` in an interview.

### 5. **Feedback Generation**
Feedback is generated automatically when the interview ends. It may take a few seconds. Re-fetch `GET /interview/{id}` if `feedback` is `null` immediately after ending.

### 6. **LiveKit Token TTL**
The LiveKit token has a **2-hour TTL**. If a user takes longer than 2 hours between creating and starting an interview, create a new interview session.

### 7. **Session Status Lifecycle**
```
scheduled → in_progress → completed
                       ↘ cancelled / failed
```

---

## Testing

### Test with LiveKit CLI

```bash
npm install -g @livekit/cli

livekit-cli join-room \
  --url ws://localhost:7880 \
  --token <your-livekit-token>
```

---

## Troubleshooting

### No Audio from AI
- Check browser microphone permissions
- Verify LiveKit server is running
- Check that AI agent worker is running (backend team)

### Connection Failed
- Verify LiveKit URL uses `ws://` (dev) or `wss://` (prod), **not** `http://`
- Check the token is valid and not expired (2-hour TTL)
- Ensure backend API is accessible (CORS configured for your origin)

### AI Not Responding
- Check the agent worker is running
- Verify Gemini API key is configured on the backend
- Check agent logs for errors

### Participant Disconnects Immediately After Joining
If you see `closing agent session due to participant disconnect` in agent logs, the frontend is disconnecting right after connecting. Common causes:

**1. React StrictMode Double Mount (Most Common)**
React 18+ StrictMode mounts components twice in development, causing LiveKit connections to drop.

**Fix:** Wrap connection in a ref to prevent double connections:
```typescript
const hasConnected = useRef(false);

useEffect(() => {
  if (hasConnected.current) return;
  hasConnected.current = true;

  // Connect to LiveKit room here
  room.connect(LIVEKIT_URL, token);
}, []);
```

**2. Audio Autoplay Blocked**
Browsers block autoplay without user interaction.

**Fix:** Ensure audio elements are properly configured:
```typescript
room.on(RoomEvent.TrackSubscribed, (track) => {
  if (track.kind === Track.Kind.Audio) {
    const el = track.attach();
    el.autoplay = true;
    el.muted = false;  // Important: must be unmuted
    document.body.appendChild(el);
  }
});
```

**3. Missing Room Options**
Always include these options for stable connections:
```typescript
const room = new Room({
  adaptiveStream: true,
  dynacast: true,
});
```

**Debug Logging:**
Add these event handlers to diagnose the issue:
```typescript
room.on(RoomEvent.Connected, () => console.log('✅ Connected'));
room.on(RoomEvent.Disconnected, (reason) => console.log('❌ Disconnected:', reason));
room.on(RoomEvent.ConnectionStateChanged, (state) => console.log('🔄 State:', state));
room.on(RoomEvent.MediaDevicesError, (e) => console.log('🎤 Media error:', e));
```

### Resume Not Parsing
- Only PDF and DOCX files are accepted (max 10 MB)
- Poll `GET /api/v1/resume/{id}` every 2 s — parsing typically takes 3-10 s
- If parsing consistently fails, check backend logs for Gemini errors

---

## Support

- Backend API docs: http://localhost:8000/docs (login at `/docs-login`)
- LiveKit docs: https://docs.livekit.io
- LiveKit React components: https://docs.livekit.io/guides/room/react/

## Next Steps for Frontend Team

1. Install `livekit-client` and `@livekit/components-react`
2. Implement register + login; persist JWT in `localStorage` or a cookie
3. Build resume upload with async polling progress indicator
4. Build job-target profile creation form
5. Build interview setup form (difficulty, topics, optional resume/job context)
6. Implement LiveKit room connection with audio
7. Build interview room UI (timer, speaking indicator, end button)
8. Build results page (feedback scores, transcript viewer)
9. Build interview history list (paginated)
10. Test end-to-end with real microphone and speakers
