// hooks/useJobPost.ts
import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import { useLayout } from '@/context/LayoutContext';
import { useToast } from '@/context/ToastContext';
import { JobCreateData } from '@/types';
import { jobService } from '@/services/jobService';

export const useJobPost = () => {
  const { fetchUserJobs } = useJobs();
  const { company } = useLayout();
  const { addToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (data: JobCreateData): boolean => {
    const errors: Record<string, string> = {};

    if (!data.title?.trim()) {
      errors.title = 'Job title is required';
    }

    if (!data.description?.trim()) {
      errors.description = 'Job description is required';
    }

    if (!data.location?.trim()) {
      errors.location = 'Location is required';
    }

    if (data.min_salary && data.max_salary && data.min_salary > data.max_salary) {
      errors.min_salary = 'Minimum salary cannot be greater than maximum salary';
    }

    if (data.closing_date) {
      const closingDate = new Date(data.closing_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closingDate < today) {
        errors.closing_date = 'Closing date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createJob = async (jobData: JobCreateData): Promise<boolean> => {
    console.log(jobData)
   
    if (!company) {
      addToast({
        type: 'error',
        title: 'Company Profile Required',
        message: 'You need to create a company profile before posting jobs.',
      });
      return false;
    }

    if (!validateForm(jobData)) {
      return false;
    }

    setIsCreating(true);
    try {
      await jobService.createJob(jobData);
      
      addToast({
        type: 'success',
        title: 'Job Posted Successfully!',
        message: 'Your job listing is now live and visible to candidates.',
      });
      
      // Refresh the user's jobs list
      await fetchUserJobs();
      
      return true;
    } catch (error: any) {
      const errorMessage = jobService.getErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Failed to Post Job',
        message: errorMessage,
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createJob,
    isCreating,
    validationErrors,
    clearValidationErrors: () => setValidationErrors({}),
    hasCompany: !!company,
    company,
  };
};