import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';
import api from '@/lib/api';
import StatWidget from '@/components/StatWidget';
import CandidateCard from '@/components/CandidateCard';
import Link from 'next/link';
import DashboardError from './DashboardError';
import DashboardLoading from './DashboardLoading';

interface RecruiterStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  const fetchRecruiterData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, candidatesResponse] = await Promise.all([
        api.get('/recruiter/stats/'),
        api.get<{ results: Candidate[] }>('/recruiter/candidates/'),
      ]);

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (candidatesResponse.data?.results) {
        setCandidates(candidatesResponse.data.results);
      }
    } catch (err: any) {
      console.error('Error fetching recruiter data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load recruiter dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={fetchRecruiterData} />;

  return (
    <>
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatWidget title="Total Jobs" value={stats.totalJobs} color="blue" />
        <StatWidget title="Active Applications" value={stats.activeApplications} color="purple" />
        <StatWidget title="Shortlisted" value={stats.shortlisted} color="orange" />
        <StatWidget title="Hired" value={stats.hired} color="indigo" />
      </div>

      {/* Candidates Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Top Candidates</h2>
          <Link href="/jobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Jobs
          </Link>
        </div>
        
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No candidates have applied to your jobs yet.
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                name={`${candidate.first_name} ${candidate.last_name}`}
                jobTitle=""
                location={candidate.location}
                postedAgo={candidate.applied_date}
                matchScore={`${candidate.match_score}/100`}
                onViewProfileClick={() => router.push(`/candidates/${candidate.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}