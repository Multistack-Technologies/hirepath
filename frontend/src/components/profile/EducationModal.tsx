// components/profile/EducationModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import api from '@/lib/api';
import { Education, University, Degree } from '@/types';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEducationAdded: (education: Education) => void;
  existingEducation?: Education | null;
}

interface EducationFormData {
  university_id: number | '';
  degree_id: number | '';
  start_date: string;
  end_date: string;
  is_current: boolean;
  gpa: string;
  gpa_scale: string;
  description: string;
}

export default function EducationModal({ 
  isOpen, 
  onClose, 
  onEducationAdded,
  existingEducation 
}: EducationModalProps) {
  const [formData, setFormData] = useState<EducationFormData>({
    university_id: '',
    degree_id: '',
    start_date: '',
    end_date: '',
    is_current: false,
    gpa: '',
    gpa_scale: '4.0',
    description: ''
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch universities and degrees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unisResponse, degsResponse] = await Promise.all([
          api.get('/universities/'),
          api.get('/degrees/')
        ]);
        setUniversities(unisResponse.data);
        setDegrees(degsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (existingEducation && isOpen) {
      setFormData({
        university_id: existingEducation.university.id,
        degree_id: existingEducation.degree.id,
        start_date: existingEducation.start_date,
        end_date: existingEducation.end_date || '',
        is_current: existingEducation.is_current,
        gpa: existingEducation.gpa?.toString() || '',
        gpa_scale: existingEducation.gpa_scale?.toString() || '4.0',
        description: existingEducation.description || ''
      });
    } else {
      // Reset form for new education
      setFormData({
        university_id: '',
        degree_id: '',
        start_date: '',
        end_date: '',
        is_current: false,
        gpa: '',
        gpa_scale: '4.0',
        description: ''
      });
    }
    setErrors({});
  }, [existingEducation, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.university_id) {
      newErrors.university_id = 'University is required';
    }
    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.is_current && !formData.end_date) {
      newErrors.end_date = 'End date is required if not current';
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date cannot be before start date';
    }
    if (formData.gpa) {
      const gpaValue = parseFloat(formData.gpa);
      const scaleValue = parseFloat(formData.gpa_scale);
      if (gpaValue > scaleValue) {
        newErrors.gpa = `GPA cannot exceed ${scaleValue}`;
      }
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
        university_id: Number(formData.university_id),
        degree_id: Number(formData.degree_id),
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        gpa_scale: parseFloat(formData.gpa_scale),
        description: formData.description
      };

      let response;
      if (existingEducation) {
        response = await api.put(`/education/${existingEducation.id}/`, payload);
      } else {
        response = await api.post('/education/create/', payload);
      }

      onEducationAdded(response.data);
      onClose();
    } catch (error: any) {
      console.error('Failed to save education:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save education';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EducationFormData, value: any) => {
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
      title={existingEducation ? "Edit Education" : "Add Education"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* University */}
          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-1">
              University *
            </label>
            <select
              required
              value={formData.university_id}
              onChange={(e) => handleInputChange('university_id', e.target.value)}
              className={`w-full p-2 border rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2
                ${errors.university_id 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#ffffff] focus:border-[#130160]'
                }`}
            >
              <option value="" className="text-gray-400">Select University</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id} className="text-gray-700">
                  {uni.name}
                </option>
              ))}
            </select>
            {errors.university_id && (
              <p className="mt-1 text-sm text-red-600">{errors.university_id}</p>
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-1">
              Degree *
            </label>
            <select
              required
              value={formData.degree_id}
              onChange={(e) => handleInputChange('degree_id', e.target.value)}
              className={`w-full p-2 border rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2
                ${errors.degree_id 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#ffffff] focus:border-[#130160]'
                }`}
            >
              <option value="" className="text-gray-400">Select Degree</option>
              {degrees.map((degree) => (
                <option key={degree.id} value={degree.id} className="text-gray-700">
                  {degree.name}
                </option>
              ))}
            </select>
            {errors.degree_id && (
              <p className="mt-1 text-sm text-red-600">{errors.degree_id}</p>
            )}
          </div>
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
              helperText={formData.is_current ? "Disabled for current education" : undefined}
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => handleInputChange('is_current', e.target.checked)}
                className="rounded border-gray-300 text-[#130160] focus:ring-[#130160]"
              />
              <span className="ml-2 text-sm text-gray-600">Currently studying here</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GPA */}
          <TextField
            label="GPA"
            type="number"
            step="0.01"
            min="0"
            max={formData.gpa_scale}
            value={formData.gpa}
            onChange={(e) => handleInputChange('gpa', e.target.value)}
            error={errors.gpa}
            helperText={`Scale: ${formData.gpa_scale}`}
          />

          {/* GPA Scale */}
          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-1">
              GPA Scale
            </label>
            <select
              value={formData.gpa_scale}
              onChange={(e) => handleInputChange('gpa_scale', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:border-[#130160]"
            >
              <option value="4.0" className="text-gray-700">4.0 Scale</option>
              <option value="5.0" className="text-gray-700">5.0 Scale</option>
              <option value="10.0" className="text-gray-700">10.0 Scale</option>
            </select>
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
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:border-[#130160]"
            placeholder="Additional information about your studies..."
          />
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
            {isLoading ? 'Saving...' : existingEducation ? 'Update' : 'Add Education'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}