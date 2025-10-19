// components/find-work/JobList.tsx
import { Job } from '@/types';
import Image from 'next/image';

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
}

export default function JobList({ jobs, selectedJob, onSelectJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💼</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {jobs.map((job) => (
        <JobListItem
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          onSelect={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

interface JobListItemProps {
  job: Job;
  isSelected: boolean;
  onSelect: () => void;
}

function JobListItem({ job, isSelected, onSelect }: JobListItemProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div
      className={`p-6 cursor-pointer transition-all hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : 'bg-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {job.company_name?.charAt(0) || 'C'}
          </div>
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-gray-700 font-medium mb-2">
            {job.company_name}
          </p>
          
          {/* Location and Info */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span>📍 {job.location}</span>
          </div>

          {/* Time and Applications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <span>{getTimeAgo(job.created_at)}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">{job.employment_type_display}</span>
            </div>
            <div className="text-sm text-gray-500">
              {job.application_count || 0} applied
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}