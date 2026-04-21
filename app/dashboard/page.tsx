'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, HelpCircle, TrendingUp, TrendingDown,
  Minus, History, Mic, AlertTriangle, Lightbulb,
  Network, Database, Cpu, Code2, Globe, Layers3,
  BrainCircuit, ArrowRight, BarChart2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { dashboardService } from '@/src/services/dashboardService';
import Navbar from '@/components/Navbar';
import './dashboard.css';

// ─── Data from skill/product-skill.md ────────────────────────────────────────
// Note: X/Y coordinates for the graph SVG layout
const GRAPH_COORDS: Record<string, { x: number, y: number }> = {
  ds: { x: 180, y: 80 }, algo: { x: 420, y: 55 }, os: { x: 560, y: 130 },
  sd: { x: 370, y: 220 }, dp: { x: 150, y: 215 }, db: { x: 540, y: 260 },
  net: { x: 290, y: 300 }, graph: { x: 480, y: 175 }, overall: { x: 310, y: 155 }
};

// Graph edges: pairs of topic IDs
const EDGES = [
  ['overall', 'ds'], ['overall', 'algo'], ['overall', 'os'],
  ['overall', 'sd'], ['overall', 'dp'],   ['algo', 'graph'],
  ['algo', 'dp'],    ['sd', 'db'],        ['sd', 'os'],
  ['net', 'os'],     ['graph', 'ds'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNodeColor(score: number) {
  if (score >= 70) return '#00d4ec';   // --accent-dim (teal)
  if (score >= 40) return '#f59e0b';   // amber
  return '#ef4444';                     // red
}

function getTrendIcon(trend: string) {
  if (trend === 'up')   return <TrendingUp size={13} className="trend-arrow up" />;
  if (trend === 'down') return <TrendingDown size={13} className="trend-arrow down" />;
  return <Minus size={13} className="trend-arrow flat" />;
}

// ─── SVG Knowledge Graph ────────────────────────────────────────────────────
function KnowledgeGraph({ topics }: { topics: any[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Map backend mastery to "score" and inject UI coordinates
  const mappedTopics = topics.map(t => ({
    ...t,
    score: t.mastery,
    x: GRAPH_COORDS[t.id]?.x || 310,
    y: GRAPH_COORDS[t.id]?.y || 155
  }));
  const topicMap = Object.fromEntries(mappedTopics.map(t => [t.id, t]));

  return (
    <svg
      viewBox="0 0 720 340"
      className="knowledge-graph-svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#00d4ec" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00d4ec" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center ambient glow */}
      <circle cx="310" cy="155" r="120" fill="url(#centerGlow)" />

      {/* Edges */}
      {EDGES.map(([fromId, toId], i) => {
        const from = topicMap[fromId];
        const to = topicMap[toId];
        
        // Safety check: Don't draw edges if the nodes don't exist in the data
        if (!from || !to) return null;

        const isActive = hovered === fromId || hovered === toId;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x}   y2={to.y}
            stroke={isActive ? '#00d4ec' : 'rgba(0,229,204,0.18)'}
            strokeWidth={isActive ? 1.5 : 1}
            style={{
              transition: 'stroke 0.2s, stroke-opacity 0.2s',
              animation: 'edgePulse 3s ease-in-out infinite',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        );
      })}

      {/* Nodes */}
      {mappedTopics.map((topic) => {
        const color = getNodeColor(topic.score);
        const isHovered = hovered === topic.id;
        const isOverall = topic.id === 'overall';
        const r = isOverall ? 44 : 32;

        return (
          <g
            key={topic.id}
            style={{
              cursor: 'pointer',
              animation: `nodeFloat ${2.5 + Math.random() * 1.5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
            onMouseEnter={() => setHovered(topic.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Glow ring on hover */}
            {isHovered && (
              <circle
                cx={topic.x} cy={topic.y} r={r + 10}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.35"
                filter="url(#glow)"
              />
            )}
            {/* Node circle */}
            <circle
              cx={topic.x} cy={topic.y} r={r}
              fill={`rgba(${hexToRgb(color)}, ${isHovered ? 0.18 : 0.08})`}
              stroke={color}
              strokeWidth={isOverall ? 2 : 1.5}
              filter={isHovered || isOverall ? 'url(#glow)' : undefined}
              style={{ transition: 'fill 0.2s' }}
            />
            {/* Section label above score */}
            <text
              x={topic.x} y={topic.y - 8}
              textAnchor="middle"
              fontSize={isOverall ? 8 : 7}
              fontFamily="Manrope, sans-serif"
              fontWeight="700"
              fill={color}
              letterSpacing="0.08em"
              opacity="0.85"
            >
              {topic.shortName.split('\n').map((line: string, li: number) => (
                <tspan key={li} x={topic.x} dy={li === 0 ? 0 : 9}>{line}</tspan>
              ))}
            </text>
            {/* Score */}
            <text
              x={topic.x} y={topic.y + (topic.shortName.includes('\n') ? 14 : 10)}
              textAnchor="middle"
              fontSize={isOverall ? 18 : 14}
              fontFamily="Manrope, sans-serif"
              fontWeight="800"
              fill="#fff"
            >
              {topic.score}%
            </text>

            {/* Tooltip on hover */}
            {isHovered && (
              <g>
                <rect
                  x={topic.x + r + 6} y={topic.y - 28}
                  width={140} height={56}
                  rx="8"
                  fill="#111a1a"
                  stroke={color}
                  strokeWidth="1"
                />
                <text
                  x={topic.x + r + 14} y={topic.y - 10}
                  fontSize="8"
                  fontFamily="Manrope, sans-serif"
                  fontWeight="700"
                  fill="#fff"
                >
                  {topic.name}
                </text>
                <text
                  x={topic.x + r + 14} y={topic.y + 4}
                  fontSize="7.5"
                  fontFamily="Manrope, sans-serif"
                  fill="#8a9a9a"
                >
                  {topic.subtopic}
                </text>
                <text
                  x={topic.x + r + 14} y={topic.y + 18}
                  fontSize="8"
                  fontFamily="Manrope, sans-serif"
                  fontWeight="700"
                  fill={color}
                >
                  Mastery: {topic.score}%
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  
  // Dashboard State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [userProfile, setUserProfile] = useState({
    id: '',
    name: 'Shivanand',
    initial: 'S',
    location: 'Bengaluru',
  });

  useEffect(() => {
    setMounted(true);
    const loadDashboard = async () => {
      try {
        setError(null);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userId = 'guest';

        if (user) {
          userId = user.id;
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          const location = user.user_metadata?.location || 'Bengaluru';
          setUserProfile({
            id: user.id,
            name,
            initial: name.charAt(0).toUpperCase(),
            location,
          });
        }

        // Fetch data via the service (Strict Naked Integration)
        const data = await dashboardService.getDashboardData(userId);
        setDashboardData(data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Senior backend is unreachable or misconfigured.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (!mounted) return null;

  // Process rankings and weakest area exactly as product docs require
  const rankings = dashboardData?.topics
    ? [...dashboardData.topics]
        .filter((t: any) => t.id !== 'overall')
        .sort((a: any, b: any) => b.mastery - a.mastery)
        .map((t: any, i: number) => ({ ...t, score: t.mastery, rank: i + 1 }))
    : [];
    
  const weakest = rankings.length > 0 ? rankings[rankings.length - 1] : { name: 'Unknown' };

  // Map suggested topics string identifiers to their respective icons
  const ICONS: Record<string, any> = { dp: BrainCircuit, db: Database, sd: Layers3, net: Globe };

  return (
    <div className="dashboard-page">

      {/* ── Navbar ── */}
      <Navbar activePage="dashboard" />

      <div className="dashboard-container">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="section-label">INTELLIGENCE</div>
            <h1 className="page-title">Intelligent Dashboard</h1>
            <p className="page-subtitle">Architecting your path to technical fluency.</p>
          </div>
          <button
            id="start-mock-session-btn"
            className="btn-primary"
            onClick={() => router.push('/interview-setup')}
          >
            Start Mock Session
          </button>
        </div>

        {/* ── Main Grid: Graph + Rankings ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--accent)' }}>
            <div className="section-label" style={{ opacity: 0.5, animation: 'livePulse 1.5s infinite' }}>Loading Insights...</div>
          </div>
        ) : error ? (
          <div className="error-panel" style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
            <AlertTriangle size={40} color="#f43f5e" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Senior Backend Integration Error</h2>
            <p style={{ color: '#8a9a9a', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>{error}</p>
            <button className="btn-primary" style={{ marginTop: '24px', background: '#333', color: '#fff' }} onClick={() => window.location.reload()}>Retry Connection</button>
          </div>
        ) : dashboardData ? (
          <>
            <div className="main-grid">
              
              {/* Knowledge Graph */}
              <div className="graph-panel">
                <div className="graph-panel-title">CS Concept Mastery Graph</div>
                <KnowledgeGraph topics={dashboardData.topics} />
                <div className="graph-legend">
                  <div className="legend-item">
                    <div className="legend-dot strong" />
                    <span>Strong ≥70%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot moderate" />
                    <span>Moderate 40–69%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot improve" />
                    <span>Improve &lt;40%</span>
                  </div>
                </div>
              </div>

              {/* Key Concept Ranking */}
              <div className="ranking-panel">
                <div className="ranking-panel-header">
                  <span className="ranking-panel-title">Key Concept Ranking</span>
                  <TrendingUp size={18} className="trend-icon" />
                </div>

                <div className="ranking-list">
                  {rankings.map((topic: any) => (
                    <div
                      key={topic.id}
                      id={`rank-row-${topic.id}`}
                      className={`ranking-row${selectedRank === topic.id ? ' selected' : ''}`}
                      onClick={() => setSelectedRank(selectedRank === topic.id ? null : topic.id)}
                    >
                      <span className="rank-num">
                        {String(topic.rank).padStart(2, '0')}
                      </span>
                      <div className="rank-info">
                        <div className="rank-topic">{topic.name}</div>
                        <div className="rank-subtopic">{topic.subtopic}</div>
                      </div>
                      <div className="rank-right">
                        <span className="rank-score">{topic.score}</span>
                        {getTrendIcon(topic.trend)}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="view-full-btn">View Full Inventory</button>
              </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon">
                  <History size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Sessions</div>
                  <div className="stat-value">{dashboardData.totalSessions}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Mic size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Avg. Verbal Clarity</div>
                  <div className="stat-value">
                    {dashboardData.avgClarityScore}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/10</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">
                  <AlertTriangle size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Weakest Area</div>
                  <div className="stat-value warning-text">{dashboardData.weakestArea || weakest.name}</div>
                </div>
              </div>
            </div>

            {/* ── Suggested Next Topics ── */}
            <div className="suggested-section">
              <div className="suggested-header">
                <div className="section-label">RECOMMENDED</div>
                <h2 className="suggested-title">Suggested Next Verbal Topics</h2>
              </div>

              <div className="suggested-grid">
                {dashboardData.suggestedTopics.map((topic: any) => {
                  const Icon = ICONS[topic.id] || BrainCircuit;
                  return (
                    <div
                      key={topic.id}
                      id={`topic-card-${topic.id}`}
                      className="topic-card"
                      onClick={() => router.push('/interview-setup')}
                    >
                      <div className="topic-card-icon">
                        <Icon size={22} />
                      </div>
                      <div className="topic-card-name">{topic.name}</div>
                      <div className="topic-card-desc">{topic.desc}</div>
                      <div className="topic-card-footer">
                        <span className={`topic-tag ${topic.tagClass}`}>{topic.tag}</span>
                        <ArrowRight size={16} className="topic-arrow" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <footer className="dashboard-footer">
        © 2024 assessmentr AI Voice Architect. All rights reserved.
      </footer>
    </div>
  );
}
