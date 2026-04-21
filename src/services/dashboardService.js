import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const dashboardService = {
  /**
   * Fetch dashboard insights data.
   * Refactored: Since the D1 endpoint is missing from Swagger, 
   * we use the I2 List Sessions endpoint to populate basics.
   * Route: I2 GET /api/v1/interview/
   */
  async getDashboardData(userId) {
    const token = authService.getToken();

    const res = await fetch(`${API_URL}/interview/`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!res.ok) {
        throw new Error(`Session List API returned ${res.status}`);
    }

    const data = await res.json();
    const sessions = data.sessions || data || [];

    // Return a COMPATIBILITY OBJECT to prevent Dashboard UI crashes.
    // This allows the UI to show the 'Total Sessions' count based on the actual list.
    return {
      totalSessions: sessions.length,
      avgClarityScore: 0, 
      weakestArea: "Not Calculated",
      topics: [], // We leave this empty until he builds the Mastery API
      suggestedTopics: [],
      rawSessions: sessions
    };
  }
};
