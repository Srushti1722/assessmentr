# Frontend Quick Start - 5 Minute Integration

## TL;DR

1. Install: `npm install livekit-client`
2. Register / Login → get JWT
3. (Optional) Upload resume + create job-target profile
4. Create interview → get LiveKit token
5. Connect to LiveKit room with token + enable microphone
6. Call `/start`, speak with AI, call `/end`
7. Fetch transcript + feedback

## Minimal Working Example (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Assessmentr - Mock Interview</title>
  <script src="https://unpkg.com/livekit-client/dist/livekit-client.umd.min.js"></script>
</head>
<body>
  <h1>Mock Interview</h1>
  <button id="start">Start Interview</button>
  <button id="end" disabled>End Interview</button>
  <div id="status"></div>

  <script>
    const API_URL = 'http://localhost:8000/api/v1';
    const LIVEKIT_URL = 'ws://localhost:7880';
    const AUTH_TOKEN = 'your-jwt-token'; // Get from POST /api/v1/auth/login

    let room = null;
    let sessionId = null;

    document.getElementById('start').onclick = async () => {
      try {
        updateStatus('Creating interview...');

        // 1. Create interview session
        const response = await fetch(`${API_URL}/interview/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            difficulty: 'medium',          // 'easy' | 'medium' | 'hard'
            duration_minutes: 30,           // 15–120
            focus_topics: ['Python', 'Data Structures']  // optional
            // resume_id: '<uuid>',         // optional
            // job_target_id: '<uuid>',     // optional
          })
        });

        const { session, livekit_token } = await response.json();
        sessionId = session.id;

        updateStatus('Connecting to room...');

        // 2. Connect to LiveKit room
        room = new LivekitClient.Room();

        // Listen for AI interviewer audio
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === 'audio') {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
          }
        });

        await room.connect(LIVEKIT_URL, livekit_token.token);
        await room.localParticipant.setMicrophoneEnabled(true);

        // 3. Start interview
        await fetch(`${API_URL}/interview/${sessionId}/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });

        updateStatus('Interview active - AI is speaking...');
        document.getElementById('start').disabled = true;
        document.getElementById('end').disabled = false;

      } catch (error) {
        updateStatus('Error: ' + error.message);
      }
    };

    document.getElementById('end').onclick = async () => {
      try {
        updateStatus('Ending interview...');

        // 4. Disconnect from LiveKit then end session
        await room.disconnect();

        await fetch(`${API_URL}/interview/${sessionId}/end`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });

        updateStatus('Interview completed!');
        document.getElementById('start').disabled = false;
        document.getElementById('end').disabled = true;

        // 5. Get results (feedback may take a few seconds)
        const results = await fetch(`${API_URL}/interview/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        const data = await results.json();
        console.log('Interview transcript:', data.interactions);
        console.log('Feedback:', data.feedback);

      } catch (error) {
        updateStatus('Error: ' + error.message);
      }
    };

    function updateStatus(message) {
      document.getElementById('status').textContent = message;
    }
  </script>
</body>
</html>
```

## React/Next.js Example

```typescript
'use client';

import { useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? 'ws://localhost:7880';

export default function InterviewPage({ authToken }: { authToken: string }) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'ending' | 'completed'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const startInterview = async () => {
    setStatus('connecting');

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
        focus_topics: ['Python', 'Algorithms'],  // optional
        // resume_id: '<uuid>',                  // optional
        // job_target_id: '<uuid>',              // optional
      }),
    });
    const { session, livekit_token } = await res.json();
    setSessionId(session.id);

    // 2. Connect to LiveKit room
    const newRoom = new Room();

    newRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'audio') {
        track.attach(); // AI voice plays automatically
      }
    });

    await newRoom.connect(LIVEKIT_URL, livekit_token.token);
    await newRoom.localParticipant.setMicrophoneEnabled(true);
    setRoom(newRoom);

    // 3. Start interview
    await fetch(`${API_URL}/interview/${session.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    setStatus('active');
  };

  const endInterview = async () => {
    if (!room || !sessionId) return;
    setStatus('ending');

    await room.disconnect();
    await fetch(`${API_URL}/interview/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    setStatus('completed');
  };

  return (
    <div>
      <h1>Mock Interview</h1>

      {status === 'idle' && (
        <button onClick={startInterview}>Start Interview</button>
      )}

      {status === 'connecting' && <p>Connecting...</p>}

      {status === 'active' && (
        <div>
          <p>🎤 Interview in progress...</p>
          <button onClick={endInterview}>End Interview</button>
        </div>
      )}

      {status === 'completed' && (
        <p>Interview completed! Fetch results from GET /interview/{sessionId}</p>
      )}
    </div>
  );
}
```

## Authentication Quick Reference

```typescript
// Register a new account
const res = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, full_name }),
});
// → { id, email, full_name, is_active, created_at }

// Login
const res = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await res.json();
// Store access_token, include as: Authorization: Bearer <access_token>

// Get current user
const res = await fetch(`${API_URL}/auth/me`, {
  headers: { 'Authorization': `Bearer ${access_token}` },
});
```

## Resume Upload Quick Reference

```typescript
// 1. Upload (multipart/form-data, NOT JSON)
const formData = new FormData();
formData.append('file', file); // PDF or DOCX, max 10 MB

const uploadRes = await fetch(`${API_URL}/resume/upload`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${authToken}` },
  body: formData,
});
const { resume_id } = await uploadRes.json();

// 2. Poll until parsed (skills/summary will be populated)
let resume;
do {
  await new Promise(r => setTimeout(r, 2000));
  const r = await fetch(`${API_URL}/resume/${resume_id}`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  resume = await r.json();
} while (!resume.summary);

console.log('Parsed skills:', resume.skills);
```

## Job-Target Profile Quick Reference

```typescript
const res = await fetch(`${API_URL}/resume/job-target`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    job_title: 'Senior Backend Engineer',
    company: 'Acme Corp',               // optional
    job_description: '...',             // optional – if omitted Gemini infers
  }),
});
const jobTarget = await res.json();
// → { id, required_skills, preferred_skills, responsibilities, qualifications, ... }
```

## Key Points for Frontend Team

### 1. **No Manual AI Calls During Interview**
❌ Don't do this:
```typescript
// WRONG - No AI endpoints to call during interview
await fetch('/api/interview/ai/opening');
await fetch('/api/interview/ai/respond');
```

✅ Do this:
```typescript
// CORRECT - AI joins automatically via LiveKit
await room.connect(url, token);
// AI speaks automatically once interview is started
```

### 2. **Voice-Based Only**
- Interview happens through **microphone and speakers**
- AI speaks questions → Candidate speaks answers
- All real-time through LiveKit WebRTC
- No text chat needed during interview

### 3. **Full Workflow**
```
0. POST /auth/register           → Create account (once)
   POST /auth/login              → Get JWT
1. POST /resume/upload           → Upload resume (optional)
   GET  /resume/{id}             → Poll until parsed
2. POST /resume/job-target       → Create job target (optional)
3. POST /interview/              → Get LiveKit token
4. room.connect(url, token)      → Join LiveKit room
5. POST /interview/{id}/start    → Start interview
6. [Voice conversation happens automatically]
7. POST /interview/{id}/end      → End interview
8. GET  /interview/{id}          → Get transcript & feedback
```

### 4. **Required Permissions**
```typescript
// Request microphone before starting
await navigator.mediaDevices.getUserMedia({ audio: true });
```

### 5. **Session Status Values**
```
scheduled   → created, not yet started
in_progress → started (after /start)
completed   → ended normally (after /end)
cancelled   → cancelled before starting
failed      → terminated due to error
```

### 6. **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/login` | POST | Get JWT token |
| `/api/v1/auth/me` | GET | Get current user |
| `/api/v1/resume/upload` | POST | Upload resume (multipart) |
| `/api/v1/resume/{id}` | GET | Get resume with parsed data |
| `/api/v1/resume/` | GET | List user's resumes |
| `/api/v1/resume/{id}` | DELETE | Soft-delete resume |
| `/api/v1/resume/job-target` | POST | Create job-target profile |
| `/api/v1/resume/job-target/{id}` | GET | Get job-target profile |
| `/api/v1/resume/job-targets/` | GET | List job-target profiles |
| `/api/v1/interview/` | POST | Create interview + get LiveKit token |
| `/api/v1/interview/{id}/start` | POST | Mark interview as started |
| `/api/v1/interview/{id}/end` | POST | End interview, trigger feedback |
| `/api/v1/interview/{id}/message` | POST | Store candidate text message (fallback) |
| `/api/v1/interview/{id}` | GET | Get transcript & feedback |
| `/api/v1/interview/` | GET | List user's interviews (paginated) |

## Testing Checklist

- [ ] Can register and login
- [ ] Upload a resume; observe async parsing
- [ ] Create a job-target profile
- [ ] Create interview session (with and without context)
- [ ] Receive valid LiveKit token
- [ ] Connect to LiveKit room
- [ ] Microphone permission granted
- [ ] Can hear AI interviewer speaking
- [ ] AI can hear candidate responses
- [ ] Can end interview
- [ ] Receive transcript after interview
- [ ] Receive feedback after interview (may take a few seconds)

## Common Issues

**Q: I don't hear the AI interviewer**
- Check browser audio permissions
- Verify LiveKit server is running
- Check that AI agent worker is running on backend

**Q: AI doesn't respond to my answers**
- Ensure microphone is enabled: `room.localParticipant.setMicrophoneEnabled(true)`
- Check microphone permissions in browser
- Verify audio is being transmitted (check LiveKit dashboard)

**Q: Connection fails**
- Verify LiveKit URL is correct (`ws://` not `http://`)
- LiveKit token has a 2-hour TTL — re-create interview if expired
- Ensure backend API is accessible

**Q: Resume shows empty skills/summary**
- Parsing is async — poll `GET /api/v1/resume/{id}` every 2 s until `summary` is populated
- Typical parse time: 3-10 seconds

**Q: Participant disconnects immediately after joining**
If you see `closing agent session due to participant disconnect` in agent logs, the frontend is disconnecting. Common fixes:

- **React StrictMode Double Mount**: React 18+ mounts components twice in development. Fix:
  ```typescript
  const hasConnected = useRef(false);
  useEffect(() => {
    if (hasConnected.current) return;
    hasConnected.current = true;
    room.connect(LIVEKIT_URL, token);
  }, []);
  ```

- **Audio Autoplay Blocked**: Ensure audio elements are properly attached:
  ```typescript
  const el = track.attach();
  el.autoplay = true;
  el.muted = false;  // Important: must be unmuted
  ```

- **Missing Room Options**: Always use:
  ```typescript
  const room = new Room({ adaptiveStream: true, dynacast: true });
  ```

## Next Steps

1. **Read full guide**: `FRONTEND_INTEGRATION_GUIDE.md`
2. **Install packages**: `npm install livekit-client @livekit/components-react`
3. **Build auth UI**: Register, login, profile
4. **Build resume upload UI**: File picker, parsing progress, parsed data display
5. **Build interview UI**: Microphone indicator, timer, end button
6. **Add results page**: Show transcript and feedback
7. **Test with real audio**: Use microphone and speakers

## Support Resources

- Full integration guide: `FRONTEND_INTEGRATION_GUIDE.md`
- Backend API docs: http://localhost:8000/docs (login at `/docs-login`)
- LiveKit docs: https://docs.livekit.io
- LiveKit React: https://docs.livekit.io/guides/room/react/
