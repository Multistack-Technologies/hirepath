// hooks/useJobSearch.ts
import { useState, useEffect } from 'react';
import { Job, JobFilters } from '@/types';
import { jobService } from '@/services/jobService';

export const useJobSearch = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const jobsData = await jobService.getActiveJobs();
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJob) {
        setSelectedJob(jobsData[0]);
      }
    } catch (err: any) {
      setError(jobService.getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company_name.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills_required.some(skill => skill.name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.employment_type?.length) {
      filtered = filtered.filter(job => filters.employment_type!.includes(job.employment_type));
    }

    if (filters.work_type?.length) {
      filtered = filtered.filter(job => filters.work_type!.includes(job.work_type));
    }

    if (filters.experience_level?.length) {
      filtered = filtered.filter(job => filters.experience_level!.includes(job.experience_level));
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.min_salary) {
      filtered = filtered.filter(job => job.min_salary && job.min_salary >= filters.min_salary!);
    }

    if (filters.max_salary) {
      filtered = filtered.filter(job => job.max_salary && job.max_salary <= filters.max_salary!);
    }

    setFilteredJobs(filtered);
  };

  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    jobs: filteredJobs,
    selectedJob,
    filters,
    isLoading,
    error,
    setSelectedJob,
    updateFilters,
    clearFilters,
    refetch: fetchJobs,
  };
};