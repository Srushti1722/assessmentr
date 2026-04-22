import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const interviewService = {
    /**
     * Step 1: Create a new interview session on the senior backend.
     * @param {Object} params
     * @param {string|null} [params.resumeId]
     * @param {string|null} [params.jobTargetId]
     * @param {string} [params.difficulty]
     * @param {number} [params.durationMinutes]
     * @param {string[]} [params.focusTopics]
     */
    async createSession({ 
        resumeId = undefined, 
        jobTargetId = undefined,
        difficulty = 'medium', 
        durationMinutes = 30, 
        focusTopics = [] 
    } = {}) {
        const token = authService.getToken();
        if (!token) {
            window.location.href = '/auth';
            throw new Error('Please sign in to start an interview session.');
        }

        // NO FALLBACKS: We call the Senior's Backend directly.
        // If it fails or returns 'change_me', the UI will show an error.
        const res = await fetch(`${API_URL}/interview/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty,
                durationMinutes,
                focusTopics,
                resumeId,
                jobTargetId,
            }),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Backend Error' }));
            throw new Error(error.detail || `Senior backend returned ${res.status}`);
        }

        return await res.json();
    },

    /**
     * Step 2: Inform the backend that the session has transitioned to 'in_progress'.
     */
    async startSession(sessionId) {
        if (!sessionId) throw new Error('Session ID is required');
        const token = authService.getToken();
        
        const res = await fetch(`${API_URL}/interview/${sessionId}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Failed to start session' }));
            throw new Error(error.detail);
        }
        return await res.json();
    },

    /**
     * Step 3: Inform the backend that the session has transitioned to 'completed'.
     */
    async endSession(sessionId) {
        if (!sessionId) throw new Error('Session ID is required');
        const token = authService.getToken();
        
        const res = await fetch(`${API_URL}/interview/${sessionId}/end`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Failed to end session' }));
            throw new Error(error.detail);
        }
        return await res.json();
    },

    /**
     * List user sessions (paginated).
     */
    async listSessions(limit = 50, offset = 0) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/interview/?limit=${limit}&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to list interview sessions');
        return await res.json();
    },

    /**
     * Store a candidate text message (fallback channel).
     */
    async sendMessage(sessionId, content, audioUrl = null) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/interview/${sessionId}/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, audio_url: audioUrl }),
        });

        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    },

    /**
     * Get interview details including transcript and feedback.
     */
    async getSessionDetails(sessionId) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/interview/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to get session details');
        return await res.json();
    }
};