'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authService } from '@/src/services/authService';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing authentication...');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Wait for Supabase session
        const { data: { session }, error: supabaseError } = await supabase.auth.getSession();
        
        if (supabaseError || !session) {
          throw new Error(supabaseError?.message || 'No session found after redirect');
        }

        const user = session.user;
        setStatus(`Syncing ${user.email} with backend...`);

        // 2. Sync with Backend
        // For OAuth users, we attempt a sync with a default placeholder password
        // The backend will either login or auto-register them via authService.js
        const backendToken = await authService.syncWithBackend(user.email!);

        if (!backendToken) {
          throw new Error('Backend sync failed. Your identity is verified, but we could not reach the server.');
        }

        // 3. Success -> Redirect
        setStatus('Authentication complete! Redirecting...');
        window.location.href = '/interview-setup';

      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    handleCallback();
  }, [supabase]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md">
          <h1 className="text-xl font-bold mb-2 text-red-500">Sync Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white">
      <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
      <div className="text-xl font-medium tracking-tight">{status}</div>
      <p className="text-gray-500 mt-2">Connecting to production infrastructure...</p>
    </div>
  );
}
