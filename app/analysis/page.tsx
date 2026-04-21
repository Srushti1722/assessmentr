'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  User,
  LayoutDashboard,
  Calendar,
  ChevronDown,
  Activity,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { analysisService } from '@/src/services/analysisService';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import './analysis.css';

// --- Sub-components ---

function ScoreCard({ icon: Icon, label, value, trendLabel, trendType }: { 
  icon: any, label: string, value: number, trendLabel: string, trendType: 'top' | 'stable' | 'up' 
}) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <Icon size={20} color="#26d0ce" />
        <span className={`status-badge status-${trendType}`}>{trendLabel}</span>
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}% <TrendingUp size={18} className="trend-icon" style={{ opacity: 0.5 }} />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const width = 100;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d - min) / range) * height
  }));
  
  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="sparkline-container">
      <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#26d0ce" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#26d0ce" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="sparkline-path" d={pathData} />
        <path className="sparkline-gradient" d={areaData} />
      </svg>
    </div>
  );
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!sessionId) {
            setError('No session ID provided. Please complete an interview first.');
            setLoading(false);
            return;
        }

        const analysis = await analysisService.getSessionAnalysis(sessionId);
        setData(analysis);
      } catch (err: any) {
        console.error('Failed to load analysis:', err);
        setError(err.message || 'Failed to connect to the analysis engine.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Synthesizing insights across your architectural journey...</p>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <AlertTriangle size={48} color="#f43f5e" />
      <h2>Integration Error</h2>
      <p>{error}</p>
      <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/interview-setup" className="btn-primary" style={{ background: '#333', color: '#fff' }}>New Interview</a>
          <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="analysis-content">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Session: Deep Analysis Feedback</h1>
          <p className="page-subtitle">Synthesized insights across your architectural communication journey.</p>
        </div>
        <div className="date-selector">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 45m</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Top Metrics */}
      <div className="metrics-row">
        <ScoreCard 
          icon={Activity} 
          label="Technical Clarity" 
          value={data.technical_score || 0} 
          trendLabel="Top 5%" 
          trendType="top" 
        />
        <ScoreCard 
          icon={ShieldCheck} 
          label="Solution Depth" 
          value={data.problem_solving_score || 0} 
          trendLabel="Stable" 
          trendType="stable" 
        />
        <ScoreCard 
          icon={Zap} 
          label="Communication Confidence" 
          value={data.communication_score || 0} 
          trendLabel="+12%" 
          trendType="up" 
        />
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div className="left-col">
          {/* Highlights */}
          <div className="highlights-card">
            <h3 className="section-title">Current Session Highlights</h3>
            
            {data.strengths?.map((s: string, i: number) => (
              <div className="highlight-item" key={i}>
                <CheckCircle className="highlight-icon" color="#26d0ce" />
                <div className="highlight-content">
                  <h4>Winning Logic: Strength {i+1}</h4>
                  <p>{s}</p>
                </div>
              </div>
            ))}

            {data.improvement_suggestions?.slice(0,1).map((s: string, i: number) => (
              <div className="highlight-item" key={i}>
                <Lightbulb className="highlight-icon" color="#fbbf24" />
                <div className="highlight-content">
                  <h4>Architectural Precision</h4>
                  <p>{s}</p>
                </div>
              </div>
            ))}

            {data.weaknesses?.slice(0,1).map((s: string, i: number) => (
              <div className="highlight-item" key={i}>
                <AlertTriangle className="highlight-icon" color="#f43f5e" />
                <div className="highlight-content">
                  <h4>Complexity Drift Alert</h4>
                  <p>{s}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="summary-card">
            <div className="summary-header">
              <Activity size={20} color="#26d0ce" />
              <h3>Revised AI Summary</h3>
            </div>
            
            <div className="summary-block">
              <span className="summary-label positive">Positive Improvement</span>
              <p className="summary-text">"{data.summary}"</p>
            </div>

            <div className="summary-block focus">
              <span className="summary-label focus">Area for Focus</span>
              <p className="summary-text">
                {data.weaknesses?.[0] || 'Focus on articulating complex trade-offs more clearly in the next session.'}
              </p>
            </div>
          </div>
        </div>

        <div className="right-col">
          {/* Previous Insights Sidebar */}
          <div className="sidebar-card">
            <h3 className="section-title">Previous Session Insights</h3>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-date">MARCH 10, 2026</span>
                <div className="timeline-topic">System Design Fundamentals</div>
                <p className="timeline-desc">Focus on Load Balancing strategies improved. Confidence score was 72%.</p>
              </div>
              <div className="timeline-item">
                <span className="timeline-date">MARCH 05, 2026</span>
                <div className="timeline-topic">Data Structures Deep Dive</div>
                <p className="timeline-desc">Initial struggles with B-Tree explanations. Recommended review of disk-based storage.</p>
              </div>
              <div className="timeline-item">
                <span className="timeline-date">FEB 28, 2026</span>
                <div className="timeline-topic">Algorithm Complexity</div>
                <p className="timeline-desc">Baseline session. Focus on Big O notation and recurrence relations.</p>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#888', marginTop: '32px' }}>
              View Historical Archive
            </button>
          </div>
        </div>
      </div>

      {/* Concept Trends */}
      <div className="trends-section">
        <h3 className="section-title">
          <TrendingUp size={20} color="#26d0ce" />
          Concept Improvement Trends
        </h3>
        <div className="trends-grid">
          <div className="trend-card">
            <div className="trend-header">
              <span>Algorithms</span>
              <span className="trend-mastery">88%</span>
            </div>
            <Sparkline data={[65, 70, 75, 82, 88]} />
            <div className="trend-footer">
              <span>FEB 28</span>
              <span>MAR 14</span>
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-header">
              <span>System Design</span>
              <span className="trend-mastery">91%</span>
            </div>
            <Sparkline data={[70, 72, 80, 85, 91]} />
            <div className="trend-footer">
              <span>FEB 28</span>
              <span>MAR 14</span>
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-header">
              <span>Databases</span>
              <span className="trend-mastery">{data.overall_score || 79}%</span>
            </div>
            <Sparkline data={[60, 65, 70, 75, 79]} />
            <div className="trend-footer">
              <span>FEB 28</span>
              <span>MAR 14</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const router = useRouter();

  return (
    <div className="analysis-container">
      {/* Global Navbar */}
      <Navbar activePage="analysis" />

      <Suspense fallback={<div className="loading-state">Loading analysis engine...</div>}>
         <AnalysisContent />
      </Suspense>

      <footer style={{ marginTop: '80px', padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '0.75rem' }}>
        <span>Assessmentr Technical Analysis Engine v2.4.0-delta</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Documentation</span>
          <span>Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}
