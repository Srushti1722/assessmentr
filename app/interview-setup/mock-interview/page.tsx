'use client';

/**
 * Page 1 — Mock Interview (/interview-setup/mock-interview)
 * Live voice-based CS technical interview session with Assessmentr.
 * LiveKit integration modelled after ELEVEN's session-view pattern:
 *   - LiveKitRoom wraps everything
 *   - SessionProvider enables useSessionContext + useSessionMessages
 *   - useVoiceAssistant gives agent state + audio track
 *   - useSessionMessages gives the full transcript
 *   - RoomAudioRenderer plays remote audio
 */

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Mic, MicOff, PhoneOff, Timer,
    Bot, User, Settings, HelpCircle, Subtitles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { interviewService } from '@/src/services/interviewService';
import { ROLE_GROUPS } from '../roleData';
import Navbar from '@/components/Navbar';
import './mock-interview.css';

// ─── LiveKit imports ──────────────────────────────────────────────────────────
import {
    LiveKitRoom,
    useRoomContext,
    useVoiceAssistant,
    RoomAudioRenderer,
    useChat,
} from '@livekit/components-react';

import { MediaDeviceFailure, RoomEvent, Participant, TrackPublication, TranscriptionSegment } from 'livekit-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectionDetails {
    serverUrl: string;
    roomName: string;
    participantName: string;
    participantToken: string;
}

type VoiceAgentState =
    | 'disconnected'
    | 'connecting'
    | 'initializing'
    | 'listening'
    | 'thinking'
    | 'speaking';

// ─── Sub-components ───────────────────────────────────────────────────────────

function WaveformBars({ active = true }: { active?: boolean }) {
    const heights = [18, 30, 48, 54, 40, 26, 14];
    const delays = [0.05, 0.15, 0.25, 0.1, 0.3, 0.05, 0.2];
    return (
        <div className="waveform-bars">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="wbar"
                    style={{
                        animationDelay: `${delays[i]}s`,
                        animationPlayState: active ? 'running' : 'paused',
                        height: active ? `${h}px` : '6px',
                    }}
                />
            ))}
        </div>
    );
}

function LiveDot() {
    return <div className="live-dot" />;
}

function ListeningDots() {
    return (
        <div className="listening-row">
            <div className="dots-row">
                <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <span className="listening-text">Assessmentr is listening&hellip;</span>
        </div>
    );
}

function ThinkingDots() {
    return (
        <div className="listening-row">
            <div className="dots-row">
                <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <span className="listening-text">Assessmentr is thinking&hellip;</span>
        </div>
    );
}

// ─── Message bubble — works with LiveKit session message shape ────────────────

function MessageBubble({ message, userName }: { message: any; userName: string }) {
    const isUser = message.from?.isLocal === true;
    const senderName = isUser ? userName : 'Assessmentr';
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="msg-row">
            <div className={`msg-meta${isUser ? ' right' : ''}`}>
                {isUser ? (
                    <>
                        <span className="msg-time">{time}</span>
                        <span className="sender-you">{senderName}</span>
                        <User size={12} color="var(--text-secondary)" />
                    </>
                ) : (
                    <>
                        <Bot size={12} color="var(--accent)" />
                        <span className="sender-ai">{senderName}</span>
                        <span className="msg-time">{time}</span>
                    </>
                )}
            </div>
            <div className={isUser ? 'bubble-wrap-right' : undefined}>
                <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
                    {message.message}
                </div>
            </div>
        </div>
    );
}

// ─── Inner session UI — must be inside <LiveKitRoom> + <SessionProvider> ──────

/**
 * SessionView — the actual interview UI.
 * Lives inside LiveKitRoom + SessionProvider so it can use:
 *   - useSessionMessages  → full transcript from LiveKit
 *   - useVoiceAssistant   → agent speaking/thinking/listening state
 *   - useSessionContext   → session.end() to disconnect cleanly
 */
function SessionView({
    userName,
    userInitial,
    interviewRole,
    totalSecs,
    isMicActive,
    setIsMicActive,
    showTextInput,
    setShowTextInput,
    manualText,
    setManualText,
    onEndSession,
    onAgentStateChange,
}: {
    userName: string;
    userInitial: string;
    interviewRole: string;
    totalSecs: number;
    isMicActive: boolean;
    setIsMicActive: (v: boolean | ((p: boolean) => boolean)) => void;
    showTextInput: boolean;
    setShowTextInput: (v: boolean | ((p: boolean) => boolean)) => void;
    manualText: string;
    setManualText: (v: string) => void;
    onEndSession: () => void;
    onAgentStateChange: (s: VoiceAgentState) => void;
}) {
    const room = useRoomContext();
    const { chatMessages, send: sendChat } = useChat();
    const { state: agentState } = useVoiceAssistant();
    const transcriptRef = useRef<HTMLDivElement>(null);
    const [transcripts, setTranscripts] = useState<any[]>([]);



    // ─── LiveKit Transcription & Greeting Voice ──────────────────────────────
    useEffect(() => {
        if (!room) return;
        const handleTranscription = (segments: TranscriptionSegment[], participant?: Participant, track?: TrackPublication) => {
            setTranscripts(prev => {
                const map = new Map(prev.map(t => [t.id, t]));
                for (const segment of segments) {
                    map.set(segment.id, {
                        id: segment.id,
                        timestamp: Date.now(), // Fallback timestamp since firstReceivedTime isn't in core Segment
                        from: { isLocal: participant?.isLocal === true },
                        message: segment.text,
                        final: segment.final
                    });
                }
                return Array.from(map.values()).filter(t => t.message.trim().length > 0).sort((a, b) => a.timestamp - b.timestamp);
            });
        };
        room.on(RoomEvent.TranscriptionReceived, handleTranscription);
        return () => { room.off(RoomEvent.TranscriptionReceived, handleTranscription); };
    }, [room]);

    // Combine manually typed chat messages and voice transcripts
    const messages = [...chatMessages, ...transcripts].sort((a, b) => a.timestamp - b.timestamp);



    // Push agent state up so parent can show correct speaking label
    useEffect(() => {
        onAgentStateChange(agentState as VoiceAgentState);
    }, [agentState, onAgentStateChange]);

    // Auto-scroll to latest message (only when user sends — mirrors ELEVEN behaviour)
    useEffect(() => {
        const last = messages.at(-1);
        if (scrollAreaRef.current && last?.from?.isLocal) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Always scroll to bottom on new message
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [messages]);

    const agentIsSpeaking = agentState === 'speaking';
    const agentIsThinking = agentState === 'thinking';
    const agentIsConnecting = agentState === 'connecting' || agentState === 'initializing';
    const micWaveformActive = isMicActive && !agentIsSpeaking;

    const mm = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const ss = String(totalSecs % 60).padStart(2, '0');

    const speakingStatusLabel = agentIsSpeaking
        ? 'Assessmentr is speaking'
        : agentIsThinking
            ? 'Assessmentr is thinking...'
            : agentIsConnecting
                ? 'Connecting...'
                : isMicActive
                    ? 'Your Turn: Listening'
                    : 'Mic is muted';

    const handleEndConfirm = async () => {
        await room.disconnect(); // cleanly disconnect from LiveKit room
        onEndSession();
    };

    const commitManualText = async () => {
        const trimmed = manualText.trim();
        if (!trimmed) return;
        // Send as a chat message through the LiveKit session
        try {
            await sendChat(trimmed);
        } catch (err) {
            console.error(err);
        }
        setManualText('');
        setShowTextInput(false);
    };

    return (
        <>
            {/* ── LEFT PANEL: Transcript ── */}
            <div className="left-panel">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Mock Interview &mdash; Live Verbal Session</h1>
                        <p className="page-subtitle">
                            Currently interviewing with{' '}
                            <span className="accent">
                                Assessmentr{interviewRole ? ` \u2013 ${interviewRole}` : ''}
                            </span>
                        </p>
                    </div>
                    <div className="header-right">
                        <div className="timer-block">
                            <span className="timer-label">SESSION TIMER</span>
                            <div className="timer-value">
                                <Timer size={16} color="var(--accent)" />
                                <span>{mm}:{ss}</span>
                            </div>
                        </div>
                        <button className="btn-end" onClick={handleEndConfirm}>
                            <PhoneOff size={15} />
                            END SESSION
                        </button>
                    </div>
                </div>

                <div className="transcript-label-row">
                    <span className="section-label">CONVERSATION TRANSCRIPT</span>
                    <div className="live-badge">
                        <LiveDot />
                        LIVE RECORDING
                    </div>
                </div>

                {/* Transcript — driven by useSessionMessages, same as ELEVEN */}
                <div className="transcript-scroll" ref={transcriptRef}>
                    {messages.length === 0 ? (
                        <div className="start-overlay" style={{ pointerEvents: 'none' }}>
                            <p style={{ opacity: 0.5 }}>
                                {agentIsConnecting
                                    ? 'Assessmentr is joining the session...'
                                    : 'Waiting for the session to begin...'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg: any) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    userName={userName}
                                />
                            ))}
                            {agentIsThinking && <ThinkingDots />}
                            {!agentIsSpeaking && !agentIsThinking && isMicActive && (
                                <ListeningDots />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── RIGHT PANEL: Speaking Indicator + Mic ── */}
            <div className="right-panel">
                <div className="speaking-label-area">
                    <span className="speaking-section-label">SPEAKING TURN INDICATOR</span>
                    <span className="speaking-status">{speakingStatusLabel}</span>
                </div>

                <div className="waveform-container">
                    <div className="waveform-circle">
                        <WaveformBars active={micWaveformActive} />
                    </div>
                    <span className="input-active-label">
                        {agentIsSpeaking ? 'AGENT SPEAKING' : 'INPUT ACTIVE'}
                    </span>
                </div>

                <div className="mic-area">
                    {showTextInput && (
                        <div className="manual-input-area" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexDirection: 'column', width: '100%' }}>
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Type your answer here..."
                                rows={3}
                                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.95rem', resize: 'none', fontFamily: 'inherit' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        commitManualText();
                                    }
                                }}
                            />
                            <button
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '6px', alignSelf: 'flex-end' }}
                                onClick={commitManualText}
                            >
                                Send Answer
                            </button>
                        </div>
                    )}

                    <button
                        className="mic-btn"
                        onClick={() => setIsMicActive(v => !v)}
                        title={isMicActive ? 'Mute' : 'Unmute'}
                    >
                        {isMicActive
                            ? <Mic size={26} color="#0a0f0f" strokeWidth={2} />
                            : <MicOff size={26} color="#0a0f0f" strokeWidth={2} />
                        }
                    </button>

                    <div className="control-row">
                        <button className="ctrl-btn" title="Type Answer Manually" onClick={() => setShowTextInput(v => !v)}>
                            <Subtitles size={18} />
                        </button>
                        <button className="ctrl-btn" title={isMicActive ? 'Mute mic' : 'Unmute mic'} onClick={() => setIsMicActive(v => !v)}>
                            {isMicActive ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Required — plays the agent's audio */}
            <RoomAudioRenderer />
        </>
    );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

function MockInterviewPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const livekitToken = searchParams.get('livekit_token');
    const sessionId = searchParams.get('session_id');
    const serverUrlParam = searchParams.get('server_url');


    // ── Session state ─────────────────────────────────────────────────────
    const [totalSecs, setTotalSecs] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);

    // ── UI state ──────────────────────────────────────────────────────────
    const [isMicActive, setIsMicActive] = useState(true);
    const [showTextInput, setShowTextInput] = useState(false);
    const [manualText, setManualText] = useState('');

    // ── User info ─────────────────────────────────────────────────────────
    const [userName, setUserName] = useState('Guest');
    const [userInitial, setUserInitial] = useState('G');
    const [userEmail, setUserEmail] = useState('');
    const [interviewRole, setInterviewRole] = useState('');

    // ── LiveKit connection ─────────────────────────────────────────────────
    const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
    const [agentState, setAgentState] = useState<VoiceAgentState>('disconnected');

    // ── Fetch user + session data ─────────────────────────────────────────
    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest';
            setUserName(name);
            setUserInitial(name.charAt(0).toUpperCase());
            setUserEmail(user.email ?? '');

            let sessions = null;
            try {
                const { data, error } = await supabase
                    .from('interview_sessions')
                    .select('role, job_description')
                    .eq('user_email', user.email)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) {
                    console.warn('[MockInterview] Could not fetch session role (table likely not deployed):', error.message);
                } else {
                    sessions = data;
                }
            } catch (err) {
                 console.warn('[MockInterview] Supabase select failed (safely ignored):', err);
            }

            if (sessions && sessions.length > 0 && sessions[0].role) {
                const rawRole = sessions[0].role;
                let foundLabel = rawRole;
                for (const group of ROLE_GROUPS) {
                    const opt = group.options.find((o: any) => o.value === rawRole);
                    if (opt) {
                        foundLabel = opt.label.replace(/\s?—?\s?\(.*?\)/, '');
                        break;
                    }
                }
                setInterviewRole(foundLabel);
            }
        };
        fetchUserData();
    }, []);

    // ── Fetch LiveKit token ───────────────────────────────────────────────
    const fetchConnectionDetails = useCallback(async () => {
        setIsConnecting(true);
        try {
            // Use the LiveKit token passed from the setup page
            setConnectionDetails({
                participantToken: livekitToken!,
                serverUrl: serverUrlParam || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://thinkloud-9x8bbl7h.livekit.cloud',
                roomName: '',
                participantName: '',
            });
        } catch (err) {
            console.error('[MockInterview] Failed to set connection details:', err);
            alert('Could not connect. Please try again.');
            setIsStarted(false);
        } finally {
            setIsConnecting(false);
        }
    }, [userName, userEmail, livekitToken]);

    const handleStartInterview = async () => {
        setIsStarted(true);
        await fetchConnectionDetails();
    };

    const handleAgentStateChange = useCallback((state: VoiceAgentState) => {
        setAgentState(state);
    }, []);

    const handleEndSession = async () => {
        if (sessionId) {
            try {
                await interviewService.endSession(sessionId);
            } catch (e) {
                console.error('Failed to notify backend to end session:', e);
            }
        }
        setConnectionDetails(null); // unmounts room → disconnects
        router.push(`/analysis${sessionId ? `?session_id=${sessionId}` : ''}`);
    };

    // ── Timer ─────────────────────────────────────────────────────────────
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isStarted) {
            interval = setInterval(() => setTotalSecs(s => s + 1), 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isStarted]);

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            <Navbar activePage="interview" />

            {/* ── PAGE BODY ── */}
            <div className="page">
                {!isStarted ? (
                    /* ── Pre-connect screen (like ELEVEN's welcome view) ── */
                    <div className="left-panel" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="start-overlay">
                            <h2>Ready for your mock interview?</h2>
                            <p>Make sure your microphone is enabled before starting the session.</p>
                            <button
                                className="btn-primary"
                                onClick={handleStartInterview}
                                disabled={isConnecting}
                            >
                                {isConnecting ? 'Connecting...' : 'Start Interview'}
                            </button>
                        </div>
                    </div>
                ) : connectionDetails ? (
                    /*
                     * ── LIVEKIT ROOM + SESSION PROVIDER ──
                     * Mirrors ELEVEN's pattern:
                     *   <LiveKitRoom> → <SessionProvider> → session UI
                     * SessionProvider enables useSessionContext + useSessionMessages
                     * inside SessionView.
                     */
                    <LiveKitRoom
                        token={connectionDetails.participantToken}
                        serverUrl={connectionDetails.serverUrl}
                        connect={true}
                        audio={isMicActive}
                        video={false}
                        onMediaDeviceFailure={(failure) => {
                            if (failure === MediaDeviceFailure.PermissionDenied) {
                                alert('Microphone access was denied. Please allow microphone and try again.');
                            }
                        }}
                        onDisconnected={() => {
                            console.log('[LiveKit] Room disconnected');
                        }}
                        onConnected={async () => {
                            try {
                                if (sessionId) {
                                    await interviewService.startSession(sessionId);
                                    console.log('Backend notified that session has started');
                                }
                            } catch (e) {
                                console.error('Failed to notify backend to start session:', e);
                            }
                        }}
                        style={{ display: 'contents' }}
                    >
                        <SessionView
                            userName={userName}
                            userInitial={userInitial}
                            interviewRole={interviewRole}
                            totalSecs={totalSecs}
                            isMicActive={isMicActive}
                            setIsMicActive={setIsMicActive}
                            showTextInput={showTextInput}
                            setShowTextInput={setShowTextInput}
                            manualText={manualText}
                            setManualText={setManualText}
                            onEndSession={handleEndSession}
                            onAgentStateChange={handleAgentStateChange}
                        />
                    </LiveKitRoom>
                ) : (
                    /* Connecting state — token fetch in progress */
                    <div className="left-panel" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Connecting to session...</p>
                    </div>
                )}
            </div>

            {/* ── End Session Modal ── */}
            {showEndModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">End Session?</h2>
                        <p className="modal-text">
                            Your session will be saved and you&apos;ll be redirected to your analysis.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowEndModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-end-confirm" onClick={handleEndSession}>
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function MockInterviewPage() {
    return (
        <Suspense fallback={<div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40vh' }}>Loading session...</div>}>
            <MockInterviewPageInner />
        </Suspense>
    );
}
