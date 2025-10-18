// app/recruiter/jobs/post/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useJobPost } from '@/hooks/useJobPost';
import { JobCreateData, EMPLOYMENT_TYPES, WORK_TYPES, EXPERIENCE_LEVELS } from '@/types';


export default function PostJobPage() {
  const router = useRouter();
  const { createJob, isCreating, validationErrors, hasCompany, company } = useJobPost();
  
  const [formData, setFormData] = useState<JobCreateData>({
    title: '',
    description: '',
    location: '',
    employment_type: 'FULL_TIME',
    work_type: 'ONSITE',
    experience_level: 'MID',
    min_salary: undefined,
    max_salary: undefined,
    closing_date: '',
    skills_required_ids: [],
    certificates_preferred_ids: [],
    courses_preferred_ids: [],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createJob(formData);
    if (success) {
      router.push('/jobs');
    }
  };

  // Header action button for the dashboard layout
  const headerAction = (
    <Link href="/jobs">
      <Button variant="secondary" size="sm">
        View All Jobs
      </Button>
    </Link>
  );

  if (!hasCompany) {
    return (
      <DashboardLayout 
        pageTitle="Post a Job" 
        pageDescription="Create a new job posting"
        headerAction={headerAction}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Company Profile Required
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              You need to create a company profile before you can post jobs. This helps candidates learn more about your company and builds trust.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => router.push('/recruiter/company')}
                variant="primary"
                size="lg"
              >
                Create Company Profile
              </Button>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                size="lg"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      pageTitle="Post a New Job" 
      pageDescription="Fill out the form below to create a new job posting"
      headerAction={headerAction}
    >
      <div className="max-w-4xl mx-auto">
        {/* Company Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-semibold">
                Posting as: {company?.name}
              </p>
              <p className="text-sm text-blue-600">
                {company?.industry} • {company?.location}
              </p>
            </div>
            <Link 
              href="/recruiter/company"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Edit Company
            </Link>
          </div>
        </div>

        {/* Job Post Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <TextField
                label="Job Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={validationErrors.title}
                placeholder="e.g. Senior Frontend Developer"
                required
              />

              <div>
                <label className="block text-sm font-semibold text-[#130160] mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full p-3 border rounded-lg text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2 text-base
                    ${validationErrors.description 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
                  required
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>

              <TextField
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={validationErrors.location}
                placeholder="e.g. New York, NY or Remote"
                required
              />
            </div>
          </div>

          {/* Job Details Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#130160] mb-2">
                  Employment Type *
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#130160] mb-2">
                  Work Type *
                </label>
                <select
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {WORK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#130160] mb-2">
                  Experience Level *
                </label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information (USD)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Minimum Salary"
                name="min_salary"
                type="number"
                value={formData.min_salary || ''}
                onChange={handleNumberChange}
                error={validationErrors.min_salary}
                placeholder="50000"
                min="0"
              />

              <TextField
                label="Maximum Salary"
                name="max_salary"
                type="number"
                value={formData.max_salary || ''}
                onChange={handleNumberChange}
                placeholder="120000"
                min="0"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Providing salary information can increase application rates by up to 40%
            </p>
          </div>

          {/* Application Details Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>
            
            <div className="max-w-md">
              <TextField
                label="Closing Date"
                name="closing_date"
                type="date"
                value={formData.closing_date}
                onChange={handleChange}
                error={validationErrors.closing_date}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-sm text-gray-500 mt-2">
                Leave empty if the job doesn't have a specific closing date. Candidates will see how many days are remaining to apply.
              </p>
            </div>
          </div>

          {/* Skills & Preferences Card (Placeholder for future enhancement) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills & Preferences</h2>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Skills, certificates, and course preferences can be added after creating the job.
              </p>
              <p className="text-sm text-gray-400">
                Feature coming soon - you'll be able to add required skills and preferred qualifications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-600">
                  All fields marked with * are required
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/recruiter/jobs">
                  <Button variant="secondary" size="lg">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isCreating}
                  disabled={isCreating}
                >
                  {isCreating ? 'Posting Job...' : 'Post Job'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}