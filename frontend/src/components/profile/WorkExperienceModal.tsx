// components/profile/WorkExperienceModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import api from '@/lib/api';
import { WorkExperience } from '@/types';

interface WorkExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkExperienceAdded: (workExperience: WorkExperience) => void;
  existingWorkExperience?: WorkExperience | null;
}

interface WorkExperienceFormData {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

export default function WorkExperienceModal({ 
  isOpen, 
  onClose, 
  onWorkExperienceAdded,
  existingWorkExperience 
}: WorkExperienceModalProps) {
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (existingWorkExperience && isOpen) {
      setFormData({
        company_name: existingWorkExperience.company_name,
        job_title: existingWorkExperience.job_title,
        start_date: existingWorkExperience.start_date,
        end_date: existingWorkExperience.end_date || '',
        is_current: existingWorkExperience.is_current,
        description: existingWorkExperience.description || ''
      });
    } else {
      // Reset form for new work experience
      setFormData({
        company_name: '',
        job_title: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
      });
    }
    setErrors({});
  }, [existingWorkExperience, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.is_current && !formData.end_date) {
      newErrors.end_date = 'End date is required if not current position';
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date cannot be before start date';
    }
    if (formData.is_current && formData.end_date) {
      newErrors.end_date = 'Current positions cannot have an end date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        company_name: formData.company_name.trim(),
        job_title: formData.job_title.trim(),
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date,
        is_current: formData.is_current,
        description: formData.description || null
      };

      let response;
      if (existingWorkExperience) {
        response = await api.put(`/work-experience/${existingWorkExperience.id}/`, payload);
      } else {
        response = await api.post('/work-experience/create/', payload);
      }

      onWorkExperienceAdded(response.data);
      onClose();
    } catch (error: any) {
      console.error('Failed to save work experience:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save work experience';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof WorkExperienceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingWorkExperience ? "Edit Work Experience" : "Add Work Experience"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <TextField
            label="Company Name *"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            error={errors.company_name}
            placeholder="e.g., Google, Microsoft"
          />

          {/* Job Title */}
          <TextField
            label="Job Title *"
            value={formData.job_title}
            onChange={(e) => handleInputChange('job_title', e.target.value)}
            error={errors.job_title}
            placeholder="e.g., Software Engineer, Product Manager"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <TextField
            label="Start Date *"
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            error={errors.start_date}
          />

          {/* End Date */}
          <div>
            <TextField
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              disabled={formData.is_current}
              error={errors.end_date}
              helperText={formData.is_current ? "Disabled for current position" : undefined}
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => handleInputChange('is_current', e.target.checked)}
                className="rounded border-gray-300 text-[#130160] focus:ring-[#130160]"
              />
              <span className="ml-2 text-sm text-gray-600">I currently work here</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#130160] mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:border-[#130160]"
            placeholder="Describe your responsibilities, achievements, and key contributions..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe your role, responsibilities, and key achievements
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : existingWorkExperience ? 'Update' : 'Add Experience'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}