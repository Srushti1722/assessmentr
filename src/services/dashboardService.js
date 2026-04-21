import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mock data used as fallback if the backend API isn't deployed yet
const MOCK_DASHBOARD_DATA = {
  totalSessions: 124,
  avgClarityScore: 8.4,
  weakestArea: "DP & Recursion",
  topics: [
    { id: 'ds',     name: 'Data Structures',  shortName: 'DATA\nSTRUCT',  mastery: 84, subtopic: 'Linked Lists & Hash Tables', trend: 'up' },
    { id: 'algo',   name: 'Algorithms',       shortName: 'ALGORITHMS',    mastery: 92, subtopic: 'Sorting & Searching',       trend: 'up' },
    { id: 'os',     name: 'Operating Systems',shortName: 'OS',            mastery: 58, subtopic: 'Processes & Scheduling',    trend: 'flat' },
    { id: 'sd',     name: 'System Design',    shortName: 'SYSTEM\nDESIGN',mastery: 62, subtopic: 'Scalability & Load Balancing', trend: 'up' },
    { id: 'dp',     name: 'DP & Recursion',   shortName: 'DP',            mastery: 34, subtopic: 'Memoization & Tabulation',  trend: 'down' },
    { id: 'db',     name: 'Databases',        shortName: 'DB DESIGN',     mastery: 76, subtopic: 'Normalization & Indexing',  trend: 'flat' },
    { id: 'net',    name: 'Networks',         shortName: 'NETWORKS',      mastery: 42, subtopic: 'TCP/IP & OSI Layer',        trend: 'down' },
    { id: 'graph',  name: 'Graph Theory',     shortName: 'GRAPHS',        mastery: 91, subtopic: 'BFS, DFS & Dijkstra',      trend: 'up' },
    { id: 'overall',name: 'Overall',          shortName: 'OVERALL',       mastery: 74, subtopic: 'CS Mastery Average',        trend: 'up' },
  ],
  suggestedTopics: [
    { id: 'dp', name: 'Dynamic Programming', desc: 'Explain overlapping subproblems and memoization patterns clearly.', tag: 'PRIORITY HIGH', tagClass: 'priority-high' },
    { id: 'db', name: 'Database Indexing', desc: 'Discuss B-Trees vs Hash Indexing tradeoffs in large scale systems.', tag: 'REVIEW NEEDED', tagClass: 'review-needed' },
    { id: 'sd', name: 'System Scalability', desc: 'Describe vertical vs horizontal scaling and load balancer logic.', tag: 'NEXT MILESTONE', tagClass: 'next-milestone' },
    { id: 'net', name: 'Network Protocols', desc: 'Articulate the 3-way handshake process in TCP communication.', tag: 'CORE DEFICIT', tagClass: 'core-deficit' },
  ]
};

export const dashboardService = {
  /**
   * Fetch dashboard insights data for a specific user.
   * Route: D1 GET /api/v1/users/{user_id}/dashboard
   */
  async getDashboardData(userId) {
    if (!userId) throw new Error('User ID is required');
    const token = authService.getToken();

    try {
      const res = await fetch(`${API_URL}/users/${userId}/dashboard`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard data: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.warn('[dashboardService] API failed/not connected, falling back to mock data:', error);
      // Fallback to mock data gracefully so UI doesn't break while backend is WIP
      return MOCK_DASHBOARD_DATA;
    }
  }
};
