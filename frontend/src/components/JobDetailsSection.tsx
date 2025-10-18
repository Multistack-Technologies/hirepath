import { Job } from '@/types';

interface JobDetailsSectionProps {
  job: Job | null;
  isLoading: boolean;
}

export default function JobDetailsSection({ job, isLoading }: JobDetailsSectionProps) {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading job details...</p>;
  }

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Title</h2>
            <p className="text-lg font-bold text-gray-900">{job?.title || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Location</h2>
            <p className="text-lg text-gray-900">{job?.location || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-purple-700">Description</h2>
            <p className="text-lg text-gray-900">{job?.description || 'No description available.'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">Requirements</h2>
          <div className="flex flex-wrap gap-2">
            {job?.skills_required && job.skills_required.length > 0 ? (
              job.skills_required.map((skill) => (
                <span key={skill.id} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                  {skill.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No requirements specified.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}