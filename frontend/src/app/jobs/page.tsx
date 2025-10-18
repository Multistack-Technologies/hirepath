'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import { useJobs } from '@/hooks/useJobs';
import { Job } from '@/types';
import JobCard from '@/components/JobCard';

export default function MyJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const { isLoading, error, fetchMyJobs } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const jobsData = await fetchMyJobs();
      setJobs(jobsData);
    } catch (err) {
      // Error handled in hook
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'RECRUITER') {
      return;
    }

    fetchJobs();
  }, [user, router]);

  const handlePostNewVacancy = () => {
    router.push('/jobs/post');
  };

  const handleEditJob = (jobId: number) => {
    router.push(`/jobs/edit/${jobId}`);
  };

  const handleViewApplications = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout pageTitle="My Jobs">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
        <Button variant="primary" size="md" onClick={handlePostNewVacancy}>
          POST NEW VACANCY
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={fetchJobs}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700">You haven't posted any jobs yet.</p>
          <Button variant="primary" size="md" onClick={handlePostNewVacancy} className="mt-4">
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewApplications={handleViewApplications}
              onEditJob={handleEditJob}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}