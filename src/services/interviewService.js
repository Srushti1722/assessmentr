import { authService } from './authService';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const interviewService = {
    // Step 1: Create a new interview session using internal LiveKit route
    async createSession({ resumeId = null, difficulty = 'medium', durationMinutes = 30 } = {}) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const res = await fetch('/api/connection-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identity: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                room_config: { agents: [{ agent_name: process.env.NEXT_PUBLIC_AGENT_NAME || 'Casey-10be' }] },
                room_metadata: {
                    user_id: user.email,
                },
            }),
        });

        if (!res.ok) throw new Error('Failed to create interview session connection');
        const details = await res.json();
        
        // Mock the session structure for the frontend wrapper
        return {
            session: { id: `sess_${Date.now()}` },
            livekit_token: { token: details.participantToken }
        };
    },

    // Step 2: Tell the backend the interview has started
    async startSession(sessionId) {
        // Mock method to avoid 404 error during frontend integration
        return;
    },

    // Step 3: Tell the backend the interview has ended
    async endSession(sessionId) {
        // Mock method to avoid 404 error
        return;
    },

    // List all interview sessions (paginated, newest first)
    async listSessions(limit = 50, offset = 0) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/interview/?limit=${limit}&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to list interview sessions');
        return await res.json();
    },

    // Send a text fallback message during an interview (voice backup)
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

    // Get session details + feedback after interview
    async getSessionDetails(sessionId) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/interview/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to get session details');
        return await res.json();
    },
};