'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  FileText,
  X,
  Upload,
  ChevronDown,
  Sparkles,
  Settings,
  HelpCircle,
  User,
  Menu,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resumeService } from '@/src/services/resumeService';
import { interviewService } from '@/src/services/interviewService';
import Navbar from '@/components/Navbar';
import { ROLE_JDS, ROLE_GROUPS } from './roleData';
import './interview-setup.css';

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserMeta {
  name: string;
  email: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function InterviewSetupPage() {
  const supabase = createClient();
  const router = useRouter();

  // Auth
  const [user, setUser] = useState<UserMeta | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Resume
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // JD
  const [jdText, setJdText] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // UI
  const [starting, setStarting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userChipRef = useRef<HTMLDivElement>(null);

  // ── Check auth ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        setUser({
          name: sbUser.user_metadata?.full_name ?? sbUser.email?.split('@')[0] ?? 'User',
          email: sbUser.email ?? '',
        });
      }
      setAuthLoading(false);
    })();
  }, [supabase]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userChipRef.current && !userChipRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a PDF or DOC/DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB.');
      return;
    }
    setUploadedFile(file);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ── Role select → auto-fill JD ────────────────────────────────────────────
  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRole(val);
    if (val && ROLE_JDS[val]) {
      setJdText(ROLE_JDS[val]);
      setIsAutoFilled(true);
    } else {
      setIsAutoFilled(false);
    }
  };

  const onJdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJdText(e.target.value);
    if (isAutoFilled) setIsAutoFilled(false);
  };

  // ── Start interview ───────────────────────────────────────────────────────
  const handleStart = async () => {
    setStarting(true);
    try {
      // Step 1: Upload resume to the backend (if user uploaded one)
      let resumeId = null;
      if (uploadedFile) {
        try {
          resumeId = await resumeService.uploadResume(uploadedFile);
        } catch (uploadObjErr) {
          console.warn('Resume upload failed (likely missing bucket setup), skipping upload:', uploadObjErr);
        }
      }

      // Step 2: Create a Job Target profile (Links Resume + JD + Role)
      // This is a MISSION CRITICAL step for the Senior's backend
      let jobTargetId = null;
      if (resumeId) {
        try {
          console.log('Creating job target profile for role:', selectedRole);
          const jobTargetData = await resumeService.createJobTarget(
            selectedRole || 'software-engineer', // jobTitle
            'Assessmentr',                        // company (placeholder)
            jdText                               // jobDescription
          );
          jobTargetId = jobTargetData.profileId || jobTargetData.job_target_id || jobTargetData.id;
        } catch (jtErr) {
          console.warn('Job target creation failed, proceeding with basic session:', jtErr);
        }
      }

      // Step 3: Create the interview session (Metadata + Token) directly from backend link
      console.log('Initiating interview session via senior backend link...');
      const sessionData = await interviewService.createSession({
        resumeId: (resumeId as string | null),
        jobTargetId: (jobTargetId as string | null),
        difficulty: 'medium',
      });

      const sessionId = sessionData.session.id;
      const participantToken = sessionData.livekit_token.token;
      const serverUrl = sessionData.livekit_token.server_url;

      // Step 4: Go to the interview page
      router.push(
        `/interview-setup/mock-interview?session_id=${sessionId}&livekit_token=${participantToken}&server_url=${serverUrl || ''}`
      );
    } catch (error) {
      console.error('Setup failed:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setStarting(false);
    }
  };


  // ─── Loading state ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div
        className="setup-wrapper"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}
      >
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Background glow */}
      <div className="page-glow" aria-hidden="true" />

      {/* ── NAVBAR ── */}
      <Navbar activePage="interview" />

      {/* ── MAIN ── */}
      <main className="setup-wrapper">
        {!user ? (
          <div className="auth-guard">
            <Sparkles size={36} color="var(--accent)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              Sign in to continue
            </h2>
            <p>You need an account to set up your mock interview session.</p>
            <a href="/auth">Get Started</a>
          </div>
        ) : (
          <div className="setup-inner">

            {/* Page header */}

            <span className="setup-label">Interview Setup</span>
            <h1 className="setup-heading">Let&apos;s Prepare Your Session</h1>
            <p className="setup-subtitle">
              Upload your resume and paste the job description &mdash; or pick a role to get started.
            </p>

            {/* ── Card 1: Resume ── */}
            <div className="setup-card">
              <span className="card-label">Your Resume</span>

              {uploadedFile ? (
                <div className="file-chip">
                  <FileText size={18} className="file-chip-icon" />
                  <span className="file-chip-name">{uploadedFile.name}</span>
                  <button
                    className="file-chip-remove"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className={`upload-zone${isDragOver ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload resume PDF"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onClick={e => e.stopPropagation()}
                    onChange={onFileInputChange}
                    tabIndex={-1}
                  />
                  <Upload size={32} className="upload-icon" />
                  <p className="upload-text">Drag &amp; drop your resume or click to browse</p>
                  <p className="upload-note">PDF, DOC, DOCX &middot; Max 5MB</p>
                </div>
              )}
            </div>

            {/* ── Card 2: JD ── */}
            <div className="setup-card">
              <span className="card-label">Job Description</span>

              <textarea
                id="jd-textarea"
                className={`jd-textarea${isAutoFilled ? ' autofilled' : ''}`}
                rows={6}
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={onJdChange}
              />

              {isAutoFilled && (
                <div className="autofill-badge">
                  <Sparkles size={11} />
                  Auto-filled &middot; You can edit this
                </div>
              )}

              {/* Or divider */}
              <div className="or-divider">
                <span>or</span>
              </div>

              {/* Role select */}
              <label htmlFor="role-select" className="role-label">Select a Job Role</label>
              <div className="select-wrapper">
                <select
                  id="role-select"
                  className="role-select"
                  value={selectedRole}
                  onChange={onRoleChange}
                >
                  <option value="">Select a predefined role</option>
                  {ROLE_GROUPS.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown size={16} className="chevron-icon" />
              </div>
            </div>

            {/* ── CTA ── */}
            <div className="cta-section">
              <button
                id="start-interview-btn"
                className="btn-start"
                onClick={handleStart}
                disabled={starting}
              >
                <Mic size={18} />
                {starting ? 'Starting...' : 'Start Mock Interview'}
              </button>
              <p className="cta-note">Your session will begin immediately after setup.</p>
            </div>

          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="setup-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">assessmentr</div>
            <div className="footer-copy">&copy; assessmentr. Precision Voice Intelligence.</div>
          </div>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}