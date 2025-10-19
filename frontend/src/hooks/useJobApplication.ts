// hooks/useJobApplication.ts
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { jobService } from '@/services/jobService';

export const useJobApplication = () => {
  const { addToast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const applyToJob = async (jobId: number, coverLetter: string = ''): Promise<boolean> => {
    setIsApplying(true);
    try {
      await jobService.applyToJob(jobId, coverLetter);
      addToast({
        type: 'success',
        title: 'Application Submitted!',
        message: 'Your application has been sent successfully.',
      });
      return true;
    } catch (error: any) {
      const errorMessage = jobService.getErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Application Failed',
        message: errorMessage,
      });
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  return {
    applyToJob,
    isApplying,
  };
};