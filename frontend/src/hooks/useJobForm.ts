import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jobsService, transformJobFormData } from '@/lib/api/jobsService';
import { JobFormData } from '@/types';
import { useLayout } from '@/context/LayoutContext';

export const useJobForm = () => {
  const router = useRouter();
  const { company, isCompanyLoading, companyError } = useLayout();
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    employment_type: 'FULL_TIME',
    work_type: 'ONSITE',
    experience_level: 'MID',
    skills_required_ids: [],
    certificates_preferred_ids: [],
    courses_preferred_ids: [],
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleAddRequirements = useCallback((requirementIds: number[]) => {
    setFormData((prev) => ({
      ...prev,
      skills_required_ids: requirementIds,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.title?.trim()) {
      setError("Please provide a Job Title.");
      return false;
    }

    if (!formData.location?.trim()) {
      setError("Please provide a Location.");
      return false;
    }

    if (!formData.description?.trim()) {
      setError("Please provide a Description.");
      return false;
    }

    if (isCompanyLoading) {
      setError("Please wait, still loading company information.");
      return false;
    }

    if (!company) {
      setError(
        companyError ||
        "Company profile is required. Please ensure your company profile is set up."
      );
      return false;
    }

    return true;
  }, [formData, isCompanyLoading, company, companyError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const jobPayload = transformJobFormData(formData, company!.id);
      await jobsService.createJob(jobPayload);
      
      setSuccess("Job vacancy created successfully!");

      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (err: any) {
      console.error("Create error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to create job vacancy. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, company, router, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      location: '',
      employment_type: 'FULL_TIME',
      work_type: 'ONSITE',
      experience_level: 'MID',
      skills_required_ids: [],
      certificates_preferred_ids: [],
      courses_preferred_ids: [],
    });
    setError(null);
    setSuccess(null);
  }, []);

  return {
    formData,
    error,
    success,
    isLoading,
    company,
    isCompanyLoading,
    companyError,
    handleChange,
    handleAddRequirements,
    handleSubmit,
    resetForm,
    setFormData,
    setError,
  };
};