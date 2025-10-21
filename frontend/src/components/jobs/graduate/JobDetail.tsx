// components/jobs/JobDetail.tsx
import { Job } from '@/types';
import Button from '@/components/Button';

interface JobDetailProps {
  job: Job | null;
  onApply: (jobId: number) => void;
  isApplying?: boolean;
}

export default function JobDetail({ job, onApply, isApplying = false }: JobDetailProps) {
  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👆</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Job</h3>
          <p className="text-gray-600">Choose a job from the list to view details</p>
        </div>
      </div>
    );
  }

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

  const skills = job.skills_required || [];
  const companyInitial = job.company_name?.charAt(0) || 'C';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      {/* Company Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          {companyInitial}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{job.company_name}</h2>
          <p className="text-gray-600">{job.title}</p>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
         
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{job.applications_count || 0}</div>
          <div className="text-sm text-gray-500">Applied</div>
        </div>
      </div>

      {/* Job Info */}
      <div className="space-y-6">
        {/* Location and Type */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">📍 {job.location}</span>
            <span className="text-gray-600">•</span>
            <span className="font-medium text-gray-900">{job.employment_type_display}</span>
          </div>
          <span className="text-gray-500">{getTimeAgo(job.created_at)}</span>
        </div>

        {/* Salary */}
        {job.salary_range && job.salary_range !== 'Salary not specified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-lg font-bold text-green-800 text-center">
              {job.salary_range}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <div className="prose prose-sm text-gray-700 max-w-none">
            {job.description || 'No description available.'}
          </div>
        </div>

        {/* Requirements */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Type */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Type</h3>
          <p className="text-gray-700">{job.work_type_display}</p>
        </div>

        {/* Experience Level */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Level</h3>
          <p className="text-gray-700">{job.experience_level_display}</p>
        </div>

        {/* Closing Date */}
        {job.closing_date && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing Date</h3>
            <p className="text-gray-700">
              {new Date(job.closing_date).toLocaleDateString()} 
              {job.days_remaining !== null && (
                <span className="text-orange-600 ml-2">({job.days_remaining} days remaining)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onApply(job.id)}
          isLoading={isApplying}
          disabled={isApplying}
          className="w-full py-3 text-lg font-semibold"
        >
          {isApplying ? 'Applying...' : 'APPLY NOW'}
        </Button>
      </div>
    </div>
  );
}