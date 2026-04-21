import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Analysis Service
 * Refactored to align with Senior's Swagger: 
 * Feedback is now retrieved via the general Session Detail endpoint.
 */
export const analysisService = {
  /**
   * Fetch analysis feedback for a specific session.
   * Maps to Swagger: GET /api/v1/interview/{session_id}
   */
  async getSessionAnalysis(sessionId) {
    if (!sessionId) throw new Error('Session ID is required');
    const token = authService.getToken();

    // CALL THE SESSION DETAIL ENDPOINT (The only GET route in Swagger for ID)
    const res = await fetch(`${API_URL}/interview/${sessionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error(`Session Detail API returned ${res.status}`);
    }
    
    const sessionDetail = await res.json();

    // EXTRACT FEEDBACK: We look for the 'feedback' key in the response.
    // If the senior hasn't populated it yet, we return the base session so the UI handles it.
    return {
        ...sessionDetail.feedback, // Spread scores, strengths, weaknesses
        sessionId: sessionDetail.sessionId,
        status: sessionDetail.status,
        summary: sessionDetail.feedback?.summary || sessionDetail.summary || "Analysis is being processed by the senior backend...",
        // Ensure UI-critical fields exist
        overall_score: sessionDetail.feedback?.overall_score || 0,
        technical_score: sessionDetail.feedback?.technical_score || 0,
        communication_score: sessionDetail.feedback?.communication_score || 0,
        problem_solving_score: sessionDetail.feedback?.problem_solving_score || 0,
        strengths: sessionDetail.feedback?.strengths || [],
        weaknesses: sessionDetail.feedback?.weaknesses || [],
        improvement_suggestions: sessionDetail.feedback?.improvement_suggestions || [],
    };
  }
};
