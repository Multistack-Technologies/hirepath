// context/JobContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useToast } from './ToastContext';

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  skills: any[];
  location: string;
  job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  experience_level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  company: any;
  created_by: number;
  is_active: boolean;
  application_count?: number;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  search?: string;
  job_type?: string[];
  experience_level?: string[];
  location?: string;
  skills?: number[];
  salary_min?: number;
  salary_max?: number;
  is_active?: boolean;
}

interface JobContextType {
  // State
  jobs: Job[];
  featuredJobs: Job[];
  userJobs: Job[];
  currentJob: Job | null;
  filters: JobFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Actions
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  fetchFeaturedJobs: () => Promise<void>;
  fetchUserJobs: () => Promise<void>;
  getJob: (id: number) => Promise<Job | null>;
  createJob: (jobData: Partial<Job>) => Promise<Job | null>;
  updateJob: (id: number, jobData: Partial<Job>) => Promise<Job | null>;
  deleteJob: (id: number) => Promise<boolean>;
  applyToJob: (jobId: number, coverLetter?: string) => Promise<boolean>;
  setFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { addToast } = useToast();

  // Fetch all jobs with filters
  const fetchJobs = async (newFilters?: JobFilters) => {
    setIsLoading(true);
    try {
      const appliedFilters = newFilters || filters;
      const params = new URLSearchParams();
      
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await api.get(`/jobs/?${params}`);
      setJobs(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      addToast({
        type: 'error',
        title: 'Failed to load jobs',
        message: error.response?.data?.error || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch featured jobs
  const fetchFeaturedJobs = async () => {
    try {
      const response = await api.get('/jobs/featured/');
      setFeaturedJobs(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error fetching featured jobs:', error);
    }
  };

  // Fetch user's jobs (for recruiters) or applications (for graduates)
  const fetchUserJobs = async () => {
    try {
      const response = await api.get('/jobs/me/');
      setUserJobs(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error fetching user jobs:', error);
    }
  };

  // Get single job by ID
  const getJob = async (id: number): Promise<Job | null> => {
    try {
      const response = await api.get(`/jobs/${id}/`);
      setCurrentJob(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job:', error);
      addToast({
        type: 'error',
        title: 'Failed to load job',
        message: error.response?.data?.error || 'Job not found.',
      });
      return null;
    }
  };

  // Create new job
  const createJob = async (jobData: Partial<Job>): Promise<Job | null> => {
    setIsCreating(true);
    try {
      const response = await api.post('/jobs/', jobData);
      addToast({
        type: 'success',
        title: 'Job created successfully!',
      });
      await fetchUserJobs(); // Refresh user jobs
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      addToast({
        type: 'error',
        title: 'Failed to create job',
        message: error.response?.data?.error || 'Please check your input and try again.',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Update job
  const updateJob = async (id: number, jobData: Partial<Job>): Promise<Job | null> => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/jobs/${id}/`, jobData);
      addToast({
        type: 'success',
        title: 'Job updated successfully!',
      });
      await fetchUserJobs(); // Refresh user jobs
      return response.data;
    } catch (error: any) {
      console.error('Error updating job:', error);
      addToast({
        type: 'error',
        title: 'Failed to update job',
        message: error.response?.data?.error || 'Please try again.',
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete job
  const deleteJob = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/jobs/${id}/`);
      addToast({
        type: 'success',
        title: 'Job deleted successfully!',
      });
      await fetchUserJobs(); // Refresh user jobs
      return true;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete job',
        message: error.response?.data?.error || 'Please try again.',
      });
      return false;
    }
  };

  // Apply to job
  const applyToJob = async (jobId: number, coverLetter?: string): Promise<boolean> => {
    try {
      await api.post('/applications/', {
        job: jobId,
        cover_letter: coverLetter,
      });
      addToast({
        type: 'success',
        title: 'Application submitted!',
        message: 'Your application has been submitted successfully.',
      });
      return true;
    } catch (error: any) {
      console.error('Error applying to job:', error);
      addToast({
        type: 'error',
        title: 'Application failed',
        message: error.response?.data?.error || 'Please try again.',
      });
      return false;
    }
  };

  const handleSetFilters = (newFilters: JobFilters) => {
    setFilters(newFilters);
    fetchJobs(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchJobs({});
  };

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
    fetchFeaturedJobs();
  }, []);

  const value: JobContextType = {
    // State
    jobs,
    featuredJobs,
    userJobs,
    currentJob,
    filters,
    isLoading,
    isCreating,
    isUpdating,
    
    // Actions
    fetchJobs,
    fetchFeaturedJobs,
    fetchUserJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    setFilters: handleSetFilters,
    clearFilters,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};