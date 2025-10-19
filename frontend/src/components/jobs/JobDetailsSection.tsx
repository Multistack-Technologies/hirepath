// components/jobs/JobDetailsSection.tsx
import { Job } from '@/types';

interface JobDetailsSectionProps {
  job: Job | null;
  isLoading?: boolean;
}

export default function JobDetailsSection({ job, isLoading = false }: JobDetailsSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  const getExperienceLevel = (level: string) => {
    const levels: Record<string, string> = {
      'ENTRY': 'Entry Level (0-2 years)',
      'MID': 'Mid Level (2-5 years)',
      'SENIOR': 'Senior Level (5-8 years)',
      'LEAD': 'Lead (8+ years)'
    };
    return levels[level] || level;
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            {getStatusBadge(job.is_active)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{job.company_name}</span>
            {job.location && (
              <>
                <span className="mx-2">•</span>
                <span>{job.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Job Type</h3>
            <p className="text-gray-900">{job.work_type_display.replace('_', ' ')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Experience Level</h3>
            <p className="text-gray-900">{getExperienceLevel(job.experience_level)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Salary Range</h3>
            {/* <p className="text-gray-900">{formatSalary(job.salary_range)}</p> */}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Application Count</h3>
            <p className="text-gray-900">{job.application_count || 0} applications</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date Posted</h3>
            <p className="text-gray-900">{new Date(job.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-gray-900">{new Date(job.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Job Description</h3>
        <p className="text-gray-900 whitespace-pre-line">{job.description}</p>
      </div>

      {/* Requirements */}
      {/* {job.requirements && job.requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-900">
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )} */}

      {/* Skills */}
      {/* {job.skills && job.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}