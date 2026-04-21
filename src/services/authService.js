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
            if (!res.ok) return null;
            const { access_token } = await res.json();
            localStorage.setItem('backend_token', access_token);
            return access_token;
        } catch (err) {
            console.error('[authService] Backend login failed:', err);
            return null;
        }
    },

    // Register a new user on the backend
    async registerUser(email, password, fullName) {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            if (!res.ok) throw new Error('Registration failed');
            return await res.json();
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
            if (!res.ok) throw new Error('Failed to fetch user profile');
            return await res.json();
        } catch (err) {
            console.error('[authService] Fetching profile failed:', err);
            return null;
        }
    },

    // Get the stored token for use in other services
    getToken() {
        return localStorage.getItem('backend_token');
    },

    // Clear token on sign out
    clearToken() {
        localStorage.removeItem('backend_token');
    }
};