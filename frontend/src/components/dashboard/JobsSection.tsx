// components/dashboard/JobsSection.tsx
import { Job } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JobCardGraduate from '../JodCardGraduate';

interface JobsSectionProps {
  jobs: Job[];
  isLoading?: boolean;
  showViewAll?: boolean;
}

export default function JobsSection({ jobs, isLoading = false, showViewAll = true }: JobsSectionProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-500">Available Jobs</h2>
          {showViewAll && (
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          )}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Available Jobs</h2>
        {showViewAll && (
          <Link href="/Myjobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Jobs
          </Link>
        )}
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Jobs
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.slice(0, 5).map((job) => (
            <JobCardGraduate
              key={job.id}
              job={job}
              onApplyClick={() => router.push(`/jobs/${job.id}/apply`)}
              onViewClick={() => router.push(`/jobs/${job.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}