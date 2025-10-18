// components/JobCard.tsx (Enhanced for Recruiter)
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onViewApplications?: (jobId: number) => void;
  onEditJob?: (jobId: number) => void;
  showStatus?: boolean;
  showApplicationCount?: boolean;
}

export default function JobCard({ 
  job, 
  onViewApplications, 
  onEditJob,
  showStatus = false,
  showApplicationCount = false
}: JobCardProps) {
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

  const formatApplicationCount = (count?: number) => {
    if (count === undefined) return 'No applications';
    if (count === 0) return 'No applications yet';
    if (count === 1) return '1 application';
    return `${count} applications`;
  };

  const getExperienceLevel = (level: string) => {
    const levels: Record<string, string> = {
      'ENTRY': 'Entry Level',
      'MID': 'Mid Level',
      'SENIOR': 'Senior Level',
      'LEAD': 'Lead'
    };
    return levels[level] || level;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            {showStatus && getStatusBadge(job.is_active)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="font-medium">{job.company_name}</span>
            {job.location && (
              <>
                <span className="mx-2">•</span>
                <span>{job.location}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getExperienceLevel(job.experience_level)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {job.work_type_display?.replace('_', ' ')}
            </span>
            {showApplicationCount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {formatApplicationCount(job.application_count)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {job.description}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          {onViewApplications && (
            <button
              onClick={() => onViewApplications(job.id)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Applications
            </button>
          )}
          {onEditJob && (
            <button
              onClick={() => onEditJob(job.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}