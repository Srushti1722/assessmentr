import { authService } from './authService';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const resumeService = {
    // Upload a resume file directly via Supabase Storage (bypassing backend)
    async uploadResume(file) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const path = `resumes/${user.email}/${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('resumes')
            .upload(path, file, { upsert: true });

        if (error) throw error;
        
        // Return the storage path for now as a makeshift ID
        return data.path;
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

    // Create a new job target profile
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