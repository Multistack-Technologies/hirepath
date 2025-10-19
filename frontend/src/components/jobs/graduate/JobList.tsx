// components/jobs/JobList.tsx
import Link from 'next/link';
import { Job } from '@/types';

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  showFullPageLink?: boolean;
}

export default function JobList({ jobs, selectedJob, onSelectJob, showFullPageLink = false }: JobListProps) {
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
    <div className="space-y-4">
      {jobs.map((job) => {
        const skills = job.skills_required || [];
        const companyInitial = job.company_name?.charAt(0) || 'C';
        
        return (
          <div
            key={job.id}
            className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
              selectedJob?.id === job.id 
                ? 'border-blue-500 ring-2 ring-blue-100' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {companyInitial}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        {showFullPageLink ? (
                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 
                            className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer"
                            onClick={() => onSelectJob(job)}
                          >
                            {job.title}
                          </h3>
                        )}
                        <p className="text-gray-700 font-medium mb-2">
                          {job.company_name}
                        </p>
                      </div>
                      
                      {job.salary_range && job.salary_range !== 'Salary not specified' && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                            {job.salary_range}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>📍 {job.location}</span>
                    </div>

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

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border border-blue-200"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                            +{skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {showFullPageLink && (
                      <div className="mt-4">
                        <Link 
                          href={`/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
                        >
                          View full details →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}