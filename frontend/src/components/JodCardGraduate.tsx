// components/JobCard.tsx (Enhanced)
import { Job } from '@/types';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

interface JobCardProps {
  job: Job;
  onApplyClick: () => void;
  onViewClick?: () => void;
  showApplyButton?: boolean;
}

export default function JobCardGraduate({ 
  job, 
  onApplyClick, 
  onViewClick,
  showApplyButton = true 
}: JobCardProps) {
  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
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
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="font-medium">{job.company_name}</span>
            {job.location && (
              <>
                <span className="mx-2">•</span>
                <span>{job.location}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getExperienceLevel(job.experience_level)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {job.work_type_display.replace('_', ' ')}
            </span>
            {job.skills?.slice(0, 3).map((skill: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {skill.name}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {job.description}
          </p>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
             {/* // {formatSalary(job.salary_range?)} */}
            </div>
            <div className="flex space-x-2">
              {onViewClick && (
                <button
                  onClick={onViewClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Details
                </button>
              )}
              {showApplyButton && (
                <button
                  onClick={onApplyClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}