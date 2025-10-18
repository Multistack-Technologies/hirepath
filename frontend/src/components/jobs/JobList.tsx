// components/jobs/JobList.tsx
import { Job } from '@/types';
import JobCard from '@/components/JobCard';

interface JobListProps {
  jobs: Job[];
  onViewApplications: (jobId: number) => void;
  onEditJob: (jobId: number) => void;
  isLoading?: boolean;
}

export default function JobList({ 
  jobs, 
  onViewApplications, 
  onEditJob, 
  isLoading = false 
}: JobListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by posting your first job vacancy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onViewApplications={onViewApplications}
          onEditJob={onEditJob}
          showStatus
          showApplicationCount
        />
      ))}
    </div>
  );
}