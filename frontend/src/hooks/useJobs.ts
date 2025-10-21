import { useState, useCallback } from 'react';
import { jobsService } from '@/lib/api/jobsService';
import { Job, Candidate } from '@/types';

export const useJobs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyJobs = useCallback(async (): Promise<Job[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobsService.getMyJobs();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load jobs';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchJobDetails = useCallback(async (jobId: number): Promise<Job> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobsService.getJobDetailsView(jobId);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load job details';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

   const fetchMyDetails = useCallback(async (jobId: number): Promise<Job> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobsService.getJobDetails(jobId);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load job details';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
 

  const fetchJobCandidates = useCallback(async (jobId: number): Promise<Candidate[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobsService.getJobApplications(jobId);
      if (response.data) {
        return response.data
      }
      return [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load candidates';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    setError,
    fetchMyJobs,
    fetchJobDetails,
    fetchJobCandidates,
    fetchMyDetails
  };
};