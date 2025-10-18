'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import api from '@/lib/api';

interface CompanyProfile {
  name: string;
  description: string;
  website: string;
  location: string;
  email: string;
  phone: string;
  industry: string;
  logo: File | null;
}

interface IndustryOption {
  value: string;
  label: string;
}

export default function CreateCompanyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'RECRUITER') {
    router.push('/dashboard');
    return <p>Access Denied. Recruiters only.</p>;
  }

  const [formData, setFormData] = useState<CompanyProfile>({
    name: '',
    description: '',
    website: '',
    location: '',
    email: '',
    phone: '',
    industry: 'TECH',
    logo: null,
  });
  
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await api.get('/companies/industries/');
        const industryData = response.data;
        
        const industryOptions = Object.entries(industryData).map(([value, label]) => ({
          value,
          label: label as string,
        }));
        
        setIndustries(industryOptions);
      } catch (err) {
        console.error('Failed to fetch industries:', err);
      }
    };

    fetchIndustries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, logo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, logo: null }));
      setLogoPreview(null);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('website', formData.website);
      submitData.append('location', formData.location);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('industry', formData.industry);
      
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      const response = await api.post('/companies/create/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Company profile created successfully!');

      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      console.error("Create error:", err);
      const errorMessage = err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Failed to create company profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Create Company Profile">
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Company Profile
              </h1>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                Cancel
              </Button>
            </div>
            <p className="text-gray-600">
              Set up your company profile to start posting jobs and attracting talent
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    id="name"
                    name="name"
                    label="Company Name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., TechSolutions SA"
                  />
                  
                  <TextField
                    id="location"
                    name="location"
                    label="Location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Johannesburg, South Africa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.co.za"
                  />
                  
                  <TextField
                    id="phone"
                    name="phone"
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+27 11 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    id="website"
                    name="website"
                    label="Website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.company.co.za"
                  />
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                    >
                      {industries.map((industry) => (
                        <option key={industry.value} value={industry.value} className="text-gray-900">
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Company Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  About Your Company
                </h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tell us about your company, culture, mission, and values..."
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Company Logo
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF, WEBP
                      </p>
                    </div>
                    
                    {logoPreview && (
                      <div className="relative">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Decreased Size */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Company Profile'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/profile')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at support@careerconnect.com
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}