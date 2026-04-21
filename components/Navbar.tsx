'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Settings, 
  HelpCircle, 
  ChevronDown,
  LayoutDashboard,
  Mic,
  BarChart3
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import './Navbar.css';

interface NavbarProps {
  activePage: 'interview' | 'dashboard' | 'analysis';
}

export default function Navbar({ activePage }: NavbarProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    initial: 'U',
  });

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        setUserProfile({
          name,
          initial: name.charAt(0).toUpperCase(),
        });
      }
    };
    loadUser();
  }, []);

  return (
    <nav className="global-navbar">
      <div className="nav-container">
        {/* Logo Section */}
        <div className="nav-logo" onClick={() => router.push('/')}>
          <span className="logo-text-lowercase">assessmentr</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button 
            className={`nav-item ${activePage === 'interview' ? 'active' : ''}`}
            onClick={() => router.push('/interview-setup')}
          >
            <Mic size={16} />
            <span>Mock Interview</span>
          </button>
          
          <button 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activePage === 'analysis' ? 'active' : ''}`}
            onClick={() => router.push('/analysis')}
          >
            <BarChart3 size={16} />
            <span>Analysis</span>
          </button>
        </div>

        {/* Right Section: Icons + Profile */}
        <div className="nav-right">
          <div className="nav-actions">
            <button className="icon-btn" title="Settings">
              <Settings size={18} />
            </button>
            <button className="icon-btn" title="Help">
              <HelpCircle size={18} />
            </button>
          </div>
          
          <div className="nav-profile-chip">
            <div className="profile-avatar">{userProfile.initial}</div>
            <div className="profile-details">
              <span className="profile-name">{userProfile.name}</span>
              <ChevronDown size={14} className="dropdown-arrow" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
