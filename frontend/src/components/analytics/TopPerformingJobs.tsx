// components/analytics/TopPerformingJobs.tsx
interface Job {
  title: string;
  applications: number;
  match_score: number;
}

interface TopPerformingJobsProps {
  jobs: Job[];
  loading?: boolean;
}

export const TopPerformingJobs: React.FC<TopPerformingJobsProps> = ({ jobs, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
        <p className="text-gray-500 text-center py-4">No job performance data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div key={index} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-900">{job.title}</p>
              <p className="text-sm text-gray-500">{job.applications} applications</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.match_score}% match
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};