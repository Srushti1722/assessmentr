'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
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
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { analysisService } from '@/src/services/analysisService';
import { interviewService } from '@/src/services/interviewService';
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
  const shouldAutoRetry = searchParams.get('retry') === '1';

  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleRegenerate = useCallback(async () => {
    if (!sessionId || isRegenerating) return;
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const newFeedback = await interviewService.regenerateFeedback(sessionId);
      setData((prev: any) => ({ ...prev, ...newFeedback }));
      setRetryCount(0); // reset on success
    } catch (err: any) {
      setRetryCount(c => c + 1);
      const base = err.message || 'AI analysis temporarily unavailable.';
      const suffix = retryCount >= 2
        ? ' Gemini may be overloaded. Try again in a few minutes.'
        : ' Try again in a moment.';
      setRegenError(base + (retryCount > 0 ? suffix : ''));
    } finally {
      setIsRegenerating(false);
    }
  }, [sessionId, isRegenerating, retryCount]);

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

        // Fetch history for sidebar
        try {
          const sessions = await interviewService.listSessions();
          const prevSessions = (sessions || [])
            .filter((s: any) => s.id !== sessionId)
            .slice(0, 3);
          setHistory(prevSessions);
        } catch (hErr) {
          console.warn('Failed to fetch session history:', hErr);
        }
      } catch (err: any) {
        console.error('Failed to load analysis:', err);
        setError(err.message || 'Failed to connect to the analysis engine.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  // Auto-trigger regeneration when navigated here with retry=1
  useEffect(() => {
    if (shouldAutoRetry && !loading && data) {
      handleRegenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoRetry, loading]);

  // Derive whether feedback is genuinely missing (session loaded but no AI output)
  const feedbackMissing = !loading && data && !isRegenerating &&
    !(data.overall_score) && !(data.strengths?.length) && !(data.summary);

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

      {/* Regenerating overlay */}
      {isRegenerating && (
        <div className="regen-overlay">
          <div className="regen-card">
            <div className="regen-spinner" />
            <h2 className="regen-title">Re-running AI Analysis</h2>
            <p className="regen-desc">Gemini is reviewing your full interview transcript.<br/>This takes 3–6 seconds.</p>
            <div className="regen-dots"><div className="rdot"/><div className="rdot"/><div className="rdot"/></div>
          </div>
        </div>
      )}

      {/* Regeneration error banner */}
      {regenError && (
        <div className="regen-error-banner">
          <AlertTriangle size={16} />
          <span>{regenError}</span>
          <button className="regen-retry-inline" onClick={handleRegenerate}>Try Again</button>
          <button className="regen-dismiss" onClick={() => setRegenError(null)}>✕</button>
        </div>
      )}

      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Session: Deep Analysis Feedback</h1>
          <p className="page-subtitle">Synthesized insights across your architectural communication journey.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className={`btn-regenerate${isRegenerating ? ' btn-regenerate--loading' : ''}`}
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title="Re-run AI analysis"
          >
            <RefreshCw size={14} className={isRegenerating ? 'spin-icon' : ''} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Analysis'}
          </button>
          <div className="date-selector">
            <Calendar size={16} />
            <span>
              {data?.started_at 
                ? new Date(data.started_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
              {' • '}
              {(() => {
                if (!data?.started_at || !data?.ended_at) return 'In Progress';
                const start = new Date(data.started_at).getTime();
                const end = new Date(data.ended_at).getTime();
                const mins = Math.round((end - start) / 60000);
                return `${mins}m`;
              })()}
            </span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* ── No Feedback Card (prominent retry UI when feedback is absent) ── */}
      {feedbackMissing && (
        <div className="no-feedback-card">
          <div className="no-feedback-icon">⚠️</div>
          <div className="no-feedback-body">
            <h3 className="no-feedback-title">AI Analysis Not Available</h3>
            <p className="no-feedback-desc">
              The AI could not generate feedback for this session automatically.
              {retryCount > 0 && (
                <span className="retry-count-label"> ({retryCount} attempt{retryCount > 1 ? 's' : ''} made)</span>
              )}
            </p>
            {retryCount >= 3 && (
              <p className="retry-exhausted">
                Multiple retries failed. Gemini may be temporarily unavailable — try again in a few minutes.
              </p>
            )}
          </div>
          <button
            className={`btn-regenerate no-feedback-btn${isRegenerating ? ' btn-regenerate--loading' : ''}`}
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw size={15} className={isRegenerating ? 'spin-icon' : ''} />
            {isRegenerating ? 'Generating...' : retryCount === 0 ? 'Generate Analysis' : 'Retry Analysis'}
          </button>
        </div>
      )}

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
              {history.length === 0 ? (
                <div className="timeline-empty" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                  No previous sessions found yet.
                </div>
              ) : (
                history.map((s: any) => {
                  const dateStr = s.created_at 
                    ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
                    : 'UNKNOWN DATE';
                  
                  return (
                    <div className="timeline-item" key={s.id}>
                      <span className="timeline-date">{dateStr}</span>
                      <div className="timeline-topic">{s.role || 'General Interview'}</div>
                      <p className="timeline-desc">
                        Status: <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{s.status}</span>. 
                        Metrics available in archive.
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <button className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#888', marginTop: '32px' }}>
              View Historical Archive
            </button>
          </div>
        </div>
      </div>

      {/* Concept Mastery (Formerly Trends) */}
      <div className="trends-section">
        <h3 className="section-title">
          <TrendingUp size={20} color="#26d0ce" />
          Individual Concept Mastery
        </h3>
        <div className="trends-grid">
          <div className="trend-card">
            <div className="trend-header">
              <span>Technical Mastery</span>
              <span className="trend-mastery">{data.technical_score || 0}%</span>
            </div>
            <Sparkline data={[50, 55, 62, 70, data.technical_score || 0]} />
            <div className="trend-footer">
              <span>PREVIOUS</span>
              <span>{data.started_at ? new Date(data.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'TODAY'}</span>
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-header">
              <span>Solution Architecture</span>
              <span className="trend-mastery">{data.problem_solving_score || 0}%</span>
            </div>
            <Sparkline data={[40, 48, 55, 65, data.problem_solving_score || 0]} />
            <div className="trend-footer">
              <span>PREVIOUS</span>
              <span>{data.started_at ? new Date(data.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'TODAY'}</span>
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-header">
              <span>Verbal Delivery</span>
              <span className="trend-mastery">{data.communication_score || 0}%</span>
            </div>
            <Sparkline data={[60, 62, 68, 72, data.communication_score || 0]} />
            <div className="trend-footer">
              <span>PREVIOUS</span>
              <span>{data.started_at ? new Date(data.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'TODAY'}</span>
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
