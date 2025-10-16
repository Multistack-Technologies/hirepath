import { Job } from '@/types';

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
}

export default function JobList({ jobs, selectedJob, onSelectJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-700">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {jobs.map((job) => (
        <JobListItem
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          onSelect={() => onSelectJob(job)}
        />
      ))}
    </section>
  );
}

interface JobListItemProps {
  job: Job;
  isSelected: boolean;
  onSelect: () => void;
}

function JobListItem({ job, isSelected, onSelect }: JobListItemProps) {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer transition-all ${
        isSelected
          ? 'border-2 border-indigo-500 shadow-md'
          : 'border border-gray-200 hover:shadow-md hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h3>
          <p className="text-sm text-gray-700 mb-2">
            {/* {job.company} • {job.department || 'Various Departments'} */}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <span>📍 {job.location}</span>
            <span className="mx-2">•</span>
            <span>{job.employment_type}</span>
            {job.remote_ok && (
              <>
                <span className="mx-2">•</span>
                <span>Remote OK</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-sm text-gray-500 mb-1">{job.employment_type}</div>
          <div className="text-lg font-bold text-indigo-700">
            {job.salary_range || 'Salary not specified'}
          </div>
        </div>
      </div>
    </div>
  );
}