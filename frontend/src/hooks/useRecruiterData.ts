// hooks/useRecruiterData.ts
import { useState, useEffect } from 'react';
import { Candidate } from '@/types';
import api from '@/lib/api';

interface RecruiterStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

interface UseRecruiterDataReturn {
  stats: RecruiterStats;
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecruiterData(): UseRecruiterDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  const fetchRecruiterData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, candidatesResponse] = await Promise.all([
        api.get('applications/recruiter/stats/'),
        api.get<{ results: Candidate[] }>('applications/recruiter/candidates/'),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (candidatesResponse.data?.results) {
        setCandidates(candidatesResponse.data.results);
      }
    } catch (err: any) {
      console.error('Error fetching recruiter data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load recruiter dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  return {
    stats,
    candidates,
    isLoading,
    error,
    refetch: fetchRecruiterData,
  };
}