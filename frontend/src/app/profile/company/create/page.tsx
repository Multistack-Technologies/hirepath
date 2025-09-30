'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import  api  from '@/lib/api';

interface CompanyProfile {
  name: string;
  description: string;
  website: string;
  location: string;
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
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const response = await api.post('/companies/create/', formData);

      setSuccess('Company profile created successfully!');

      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err: any) {
      console.error("Create error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create company profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <DashboardLayout pageTitle="Create Company Profile">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Company Profile</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/profile')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      <section>
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <TextField
              id="website"
              name="website"
              label="Website (Optional)"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.techsolutions.co.za"
            />
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about your company..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'CREATE COMPANY'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => router.push('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
}