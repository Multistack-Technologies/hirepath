// hooks/useRecruiterData.ts
import { useState, useEffect } from 'react';
import { Candidate, RecruiterStats } from '@/types';
import api from '@/lib/api';



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
    totalApplications :0,
    applicationsByStatus : {
      PENDING: 0,
      REVIEWED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0
    },
    averageMatchScore:0,
    applicationsByJob : [{
      title: '',
      application_count: 0,
      avg_match_score: 0
    }]

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