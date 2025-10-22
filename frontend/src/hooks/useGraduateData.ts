// hooks/useGraduateData.ts
import { useState, useEffect } from 'react';
import { GraduateStats, Job } from '@/types';
import api from '@/lib/api';



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
    totalApplications :0,
    averageMatchScore : 0,
    recentApplications : 0,
    applicationsByStatus :{
      PENDING: 0,
      REVIEWED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0
    },
    topMatchedJobs:[{
      job__title: '',
      match_score: 0
    }]

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

      if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
        setJobs(jobsResponse.data);
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