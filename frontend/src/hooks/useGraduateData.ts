// hooks/useGraduateData.ts
import { useState, useEffect } from 'react';
import { Job } from '@/types';
import api from '@/lib/api';

interface GraduateStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

interface UseGraduateDataReturn {
  stats: GraduateStats;
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGraduateData(): UseGraduateDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<GraduateStats>({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  const fetchGraduateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        api.get('/applications/graduate/stats/'),
        api.get<{ results: Job[] }>('/jobs/'),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (jobsResponse.data?.results) {
        setJobs(jobsResponse.data.results);
      }
    } catch (err: any) {
      console.error('Error fetching graduate data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load graduate dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduateData();
  }, []);

  return {
    stats,
    jobs,
    isLoading,
    error,
    refetch: fetchGraduateData,
  };
}