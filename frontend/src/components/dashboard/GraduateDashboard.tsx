import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Job } from '@/types';
import api from '@/lib/api';
import StatWidget from '@/components/StatWidget';
import JobCard from '@/components/JobCard';
import Link from 'next/link';
import DashboardError from './DashboardError';
import DashboardLoading from './DashboardLoading';


interface GraduateStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

export default function GraduateDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<GraduateStats>({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  const fetchGraduateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, jobsResponse] = await Promise.all([
        api.get('/applications/graduate/stats/'),
        api.get<{ results: Job[] }>('/jobs/'),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (jobsResponse.data?.results) {
        setJobs(jobsResponse.data.results);
      }
    } catch (err: any) {
      console.error('Error fetching graduate data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load graduate dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduateData();
  }, []);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={fetchGraduateData} />;

  return (
    <>
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatWidget title="Total Jobs" value={stats.totalJobs} color="blue" />
        <StatWidget title="Active Applications" value={stats.activeApplications} color="purple" />
        <StatWidget title="Shortlisted" value={stats.shortlisted} color="orange" />
        <StatWidget title="Hired" value={stats.hired} color="indigo" />
      </div>

      {/* Jobs Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-500">Available Jobs</h2>
          <Link href="/Myjobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Jobs
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No jobs found. Check back later!
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApplyClick={() => router.push(`/jobs/${job.id}/apply`)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}