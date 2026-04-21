import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const resumeService = {
    // Upload a resume file to the backend
    async uploadResume(file) {
        const token = authService.getToken();
        if (!token) {
            console.warn('[resumeService] No token found, redirecting to login...');
            window.location.href = '/auth';
            throw new Error('Please sign in to upload your resume.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/resume/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
            // Do NOT set Content-Type header; fetch sets it automatically with boundary for FormData
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(errorBody.detail || 'Upload failed');
        }

        const data = await res.json();
        return data.resume_id;
    },

    // Poll every 2 seconds until Gemini finishes parsing the resume
    async pollUntilParsed(resumeId, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            const resume = await this.getResume(resumeId);
            if (resume && resume.summary !== null) return resume;
            await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
        }
        throw new Error('Resume parsing timed out');
    },

    // Get a specific resume by ID
    async getResume(resumeId) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/${resumeId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to get resume');
        return await res.json();
    },

    // Delete a specific resume
    async deleteResume(resumeId) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/${resumeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete resume');
    },

    // List all uploaded resumes for the user
    async listResumes() {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to list resumes');
        return await res.json();
    },

    // Create a new job target profile (Match Swagger Screenshot)
    async createJobTarget(jobTitle, company = null, jobDescription = null) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/job-target`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_title: jobTitle,
                company: company,
                job_description: jobDescription,
            }),
        });
        if (!res.ok) throw new Error('Failed to create job target');
        return await res.json();
    },

    // Get a specific job target
    async getJobTarget(profileId) {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/job-target/${profileId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to get job target');
        return await res.json();
    },

    // List all job targets for the user
    async listJobTargets() {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/resume/job-targets/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to list job targets');
        return await res.json();
    }
};