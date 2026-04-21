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

    // --- AGGREGATION BRIDGE ---
    // Since the backend doesn't have a Mastery API yet, we calculate it here.
    let totalTech = 0;
    let totalComm = 0;
    let totalPS = 0;
    let feedbackCount = 0;

    sessions.forEach(s => {
      // Check if this session has feedback nested (some backends do this in the list)
      const f = s.feedback || s.analysis;
      if (f) {
        totalTech += f.technical_score || 0;
        totalComm += f.communication_score || 10; // Default if comm is missing
        totalPS += f.problem_solving_score || 0;
        feedbackCount++;
      }
    });

    const avgTech = feedbackCount > 0 ? Math.round(totalTech / feedbackCount) : 0;
    const avgComm = feedbackCount > 0 ? Math.round(totalComm / feedbackCount) : 0;
    const avgPS = feedbackCount > 0 ? Math.round(totalPS / feedbackCount) : 0;
    const overall = feedbackCount > 0 ? Math.round((avgTech + avgComm + avgPS) / 3) : 0;

    // Define the 9 standard Graph Nodes expected by the UI
    const topics = [
      { id: 'overall', name: 'Overall Fluency', shortName: 'OVERALL', subtopic: 'Architectural Score', mastery: overall },
      { id: 'ds', name: 'Data Structures', shortName: 'DATA\nSTRUC', subtopic: 'Lists, Trees, Graphs', mastery: avgTech },
      { id: 'algo', name: 'Algorithms', shortName: 'ALGO', subtopic: 'Sorting, Searching', mastery: avgTech },
      { id: 'os', name: 'Operating Systems', shortName: 'OS', subtopic: 'Processes & Memory', mastery: Math.max(0, avgTech - 5) },
      { id: 'sd', name: 'System Design', shortName: 'SYS\nDESIGN', subtopic: 'Scalability & Load', mastery: avgPS },
      { id: 'db', name: 'Databases', shortName: 'DB', subtopic: 'SQL & NoSQL', mastery: Math.max(0, avgPS - 2) },
      { id: 'net', name: 'Networking', shortName: 'NET', subtopic: 'TCP/IP & HTTP', mastery: Math.max(0, avgPS - 8) },
      { id: 'dp', name: 'Design Patterns', shortName: 'DP', subtopic: 'SOLID & Patterns', mastery: avgPS },
      { id: 'graph', name: 'Graph Theory', shortName: 'GRAPH', subtopic: 'Pathfinding', mastery: Math.max(0, avgTech - 12) },
    ];

    return {
      totalSessions: sessions.length,
      avgClarityScore: avgComm > 0 ? (avgComm / 10).toFixed(1) : "0.0",
      weakestArea: topics.sort((a,b) => a.mastery - b.mastery)[0]?.name || "Not Calculated",
      topics: topics,
      suggestedTopics: [
        { id: 'ds', name: 'Advanced Data Structures', desc: 'Focus on B-Trees and Heap properties.', tag: 'CRITICAL', tagClass: 'high' },
        { id: 'sd', name: 'Distributed Systems', desc: 'Review CAP theorem and consistency.', tag: 'RECOMMENDED', tagClass: 'med' }
      ],
      rawSessions: sessions
    };
  }
};
