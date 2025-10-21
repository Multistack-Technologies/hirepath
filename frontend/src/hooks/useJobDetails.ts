// hooks/useJobDetails.ts
import { useState, useEffect } from 'react';
import { Job, Application } from '@/types';
import { useJobs } from './useJobs';

interface UseJobDetailsReturn {
  job: Job | null;
  candidates: Application[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useJobDetails(jobId: number) {
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fetchMyDetails, fetchJobCandidates, isLoading } = useJobs();

  const fetchData = async () => {
    if (isNaN(jobId)) {
      setError("Invalid Job ID");
      return;
    }

    try {
      setError(null);
      const [jobData, candidatesData] = await Promise.all([
        fetchMyDetails(jobId),
        fetchJobCandidates(jobId),
      ]);
      
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load job details');
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  return {
    job,
    candidates,
    isLoading,
    error,
    refetch: fetchData,
  };
}