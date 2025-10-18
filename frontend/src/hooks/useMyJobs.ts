// hooks/useMyJobs.ts
import { useState, useEffect } from 'react';
import { Job } from '@/types';
import { useJobs } from './useJobs';

interface UseMyJobsReturn {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fetchMyJobs, isLoading } = useJobs();

  const fetchJobs = async () => {
    try {
      setError(null);
      const jobsData = await fetchMyJobs();
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Error fetching my jobs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load your jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
  };
}