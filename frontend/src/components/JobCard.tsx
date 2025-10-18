import { Job } from '@/types';
import { formatPostedDate } from '@/utils/dateFormatter';

interface JobCardProps {
  job: Job;
  onViewApplications: (jobId: number) => void;
  onEditJob: (jobId: number) => void;
}

export default function JobCard({ job, onViewApplications, onEditJob }: JobCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex items-start">
        {job.company_logo ? (
          <img
            src={job.company_logo}
            alt={job.company_name}
            className="w-10 h-10 rounded-full mr-4 object-cover"
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-4 flex items-center justify-center">
            <span className="text-gray-500 text-xs">Logo</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{job.company_name}</h3>
              <p className="text-sm text-gray-700">{job.title}</p>
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                <span>📍 {job.location}</span>
                <span>•</span>
                <span>{job.employment_type_display}</span>
                <span>•</span>
                <span>{job.work_type_display}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                <span>Posted: {formatPostedDate(job.created_at)}</span>
                <span>•</span>
                <span>{job.experience_level_display}</span>
                {job.salary_range && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">{job.salary_range}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {/* {job.skills_required.slice(0, 3).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {skill.name}
                  </span>
                ))} */}
                {/* {job.skills_required.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{job.skills_required.length - 3} more
                  </span>
                )} */}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                job.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {job.is_active ? 'Active' : 'Closed'}
              </div>
              {job.closing_date && (
                <div className="text-xs text-gray-500 mt-1">
                  Closes: {formatPostedDate(job.closing_date)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onViewApplications(job.id)}
            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label={`View applications for ${job.title}`}
            title="View Applications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEditJob(job.id)}
            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label={`Edit job ${job.title}`}
            title="Edit Job"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}