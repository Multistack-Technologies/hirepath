// components/profile/CertificateModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import api from '@/lib/api';
import { Certificate, CertificateProvider } from '@/types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificateAdded: (certificate: Certificate) => void;
  existingCertificate?: Certificate | null;
}

interface CertificateFormData {
  provider_id: number | '';
  credential_id: string;
  certificate_url: string;
  issue_date: string;
  expiration_date: string;
  is_permanent: boolean;
  score: string;
  notes: string;
}

export default function CertificateModal({ 
  isOpen, 
  onClose, 
  onCertificateAdded,
  existingCertificate 
}: CertificateModalProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    provider_id: '',
    credential_id: '',
    certificate_url: '',
    issue_date: '',
    expiration_date: '',
    is_permanent: false,
    score: '',
    notes: ''
  });
  const [providers, setProviders] = useState<CertificateProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch certificate providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const providersResponse = await api.get('/certificate-providers/');
        setProviders(providersResponse.data);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (existingCertificate && isOpen) {
      setFormData({
        provider_id: existingCertificate.provider.id,
        credential_id: existingCertificate.credential_id || '',
        certificate_url: existingCertificate.certificate_url || '',
        issue_date: existingCertificate.issue_date,
        expiration_date: existingCertificate.expiration_date || '',
        is_permanent: existingCertificate.is_permanent,
        score: existingCertificate.score?.toString() || '',
        notes: existingCertificate.notes || ''
      });
    } else {
      // Reset form for new certificate
      setFormData({
        provider_id: '',
        credential_id: '',
        certificate_url: '',
        issue_date: '',
        expiration_date: '',
        is_permanent: false,
        score: '',
        notes: ''
      });
    }
    setErrors({});
  }, [existingCertificate, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.provider_id) {
      newErrors.provider_id = 'Provider is required';
    }
    if (!formData.issue_date) {
      newErrors.issue_date = 'Issue date is required';
    }
    if (!formData.is_permanent && !formData.expiration_date) {
      newErrors.expiration_date = 'Expiration date is required if not permanent';
    }
    if (formData.issue_date && formData.expiration_date && formData.issue_date > formData.expiration_date) {
      newErrors.expiration_date = 'Expiration date cannot be before issue date';
    }
    if (formData.score) {
      const scoreValue = parseFloat(formData.score);
      if (scoreValue < 0 || scoreValue > 100) {
        newErrors.score = 'Score must be between 0 and 100';
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
        provider_id: Number(formData.provider_id),
        credential_id: formData.credential_id || null,
        certificate_url: formData.certificate_url || null,
        issue_date: formData.issue_date,
        expiration_date: formData.is_permanent ? null : formData.expiration_date,
        is_permanent: formData.is_permanent,
        score: formData.score ? parseFloat(formData.score) : null,
        notes: formData.notes || null
      };

      let response;
      if (existingCertificate) {
        response = await api.put(`/certificates/${existingCertificate.id}/`, payload);
      } else {
        response = await api.post('/certificates/create/', payload);
      }

      onCertificateAdded(response.data);
      onClose();
    } catch (error: any) {
      console.error('Failed to save certificate:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save certificate';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CertificateFormData, value: any) => {
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
      title={existingCertificate ? "Edit Certificate" : "Add Certificate"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Provider */}
          <div>
            <label className="block text-sm font-semibold text-[#130160] mb-1">
              Provider *
            </label>
            <select
              required
              value={formData.provider_id}
              onChange={(e) => handleInputChange('provider_id', e.target.value)}
              className={`w-full p-2 border rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2
                ${errors.provider_id 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#ffffff] focus:border-[#130160]'
                }`}
            >
              <option value="" className="text-gray-400">Select Provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id} className="text-gray-700">
                  {provider.name}
                </option>
              ))}
            </select>
            {errors.provider_id && (
              <p className="mt-1 text-sm text-red-600">{errors.provider_id}</p>
            )}
          </div>

          {/* Credential ID */}
          <TextField
            label="Credential ID"
            value={formData.credential_id}
            onChange={(e) => handleInputChange('credential_id', e.target.value)}
            placeholder="e.g., UC-123456"
            helperText="Optional certificate identifier"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issue Date */}
          <TextField
            label="Issue Date *"
            type="date"
            required
            value={formData.issue_date}
            onChange={(e) => handleInputChange('issue_date', e.target.value)}
            error={errors.issue_date}
          />

          {/* Expiration Date */}
          <div>
            <TextField
              label="Expiration Date"
              type="date"
              value={formData.expiration_date}
              onChange={(e) => handleInputChange('expiration_date', e.target.value)}
              disabled={formData.is_permanent}
              error={errors.expiration_date}
              helperText={formData.is_permanent ? "Disabled for permanent certificates" : undefined}
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={formData.is_permanent}
                onChange={(e) => handleInputChange('is_permanent', e.target.checked)}
                className="rounded border-gray-300 text-[#130160] focus:ring-[#130160]"
              />
              <span className="ml-2 text-sm text-gray-600">This certificate does not expire</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Certificate URL */}
          <TextField
            label="Certificate URL"
            type="url"
            value={formData.certificate_url}
            onChange={(e) => handleInputChange('certificate_url', e.target.value)}
            placeholder="https://example.com/certificate"
            helperText="Link to view certificate online"
          />

          {/* Score */}
          <TextField
            label="Score"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.score}
            onChange={(e) => handleInputChange('score', e.target.value)}
            error={errors.score}
            helperText="Score between 0-100 (optional)"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-[#130160] mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffffff] focus:border-[#130160]"
            placeholder="Additional information about this certificate..."
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
            {isLoading ? 'Saving...' : existingCertificate ? 'Update' : 'Add Certificate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}