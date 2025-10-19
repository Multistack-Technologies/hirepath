// hooks/useJobForm.ts
import { useState } from 'react';
import { JobCreateData } from '@/types';

export const useJobForm = (initialData: JobCreateData) => {
  const [formData, setFormData] = useState<JobCreateData>(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : parseInt(value)
    }));
  };

  const updateSkills = (skillIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      skills_required_ids: skillIds
    }));
  };

  const updateDegrees = (degreeIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      courses_preferred_ids: degreeIds
    }));
  };

  const updateCertificateProviders = (providerIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      certificates_preferred_ids: providerIds
    }));
  };

  const resetForm = () => {
    setFormData(initialData);
  };

  return {
    formData,
    handleChange,
    handleNumberChange,
    updateSkills,
    updateDegrees,
    updateCertificateProviders,
    resetForm,
    setFormData
  };
};