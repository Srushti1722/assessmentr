const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
    // Saves the backend token after login
    async loginToBackend(email, password) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            if (res.ok) {
                const data = await res.json();
                // Handle both documented 'token' and common 'access_token' names
                const token = data.token || data.access_token;
                if (token) {
                    localStorage.setItem('backend_token', token);
                    return token;
                }
            }
            
            return null;
        } catch (err) {
            console.error('[authService] Backend login failed:', err);
            return null;
        }
    },

    // NEW: Sync backend token if user is logged into Supabase
    async syncWithBackend(email, password = 'DefaultPassword123!') {
        const existingToken = this.getToken();
        if (existingToken) return existingToken;

        console.log('[authService] Syncing session with backend for:', email);
        return await this.loginToBackend(email, password);
    },

    // Register a new user on the backend
    async registerUser(email, password, fullName) {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    full_name: fullName || email.split('@')[0] 
                }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Registration failed');
            }
            const data = await res.json();
            const token = data.token || data.access_token;
            if (token) {
                localStorage.setItem('backend_token', token);
            }
            return data;
        } catch (err) {
            console.error('[authService] Backend registration failed:', err);
            throw err;
        }
    },

    // Get current logged-in user's profile from the backend
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) return null;
            
            const res = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) {
                if (res.status === 401) this.clearToken();
                throw new Error('Failed to fetch user profile');
            }
            return await res.json();
        } catch (err) {
            console.error('[authService] Fetching profile failed:', err);
            return null;
        }
    },

    // Get the stored token for use in other services
    getToken() {
        const token = localStorage.getItem('backend_token');
        if (token === 'null' || token === 'undefined') return null;
        return token;
    },

    // Clear token on sign out
    clearToken() {
        localStorage.removeItem('backend_token');
    }
};