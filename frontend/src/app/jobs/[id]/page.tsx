'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import { useJobs } from '@/hooks/useJobs';
import { Job, Candidate } from '@/types';
import JobDetailsSection from '@/components/JobDetailsSection';
import CandidatesSection from '@/components/CandidatesSection';

export default function JobDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = Number(params.id);
  
  const { isLoading, error, setError, fetchJobDetails, fetchJobCandidates } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const fetchData = async () => {
    try {
      const [jobData, candidatesData] = await Promise.all([
        fetchJobDetails(jobId),
        fetchJobCandidates(jobId),
      ]);
      
      setJob(jobData);
      setCandidates(candidatesData);
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
      setError("Access Denied. Recruiters only.");
      return;
    }

    if (!isNaN(jobId)) {
      fetchData();
    } else {
      setError("Invalid Job ID");
    }
  }, [user, router, jobId]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout pageTitle="Job Details">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Details</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/jobs')}>
          Back to My Jobs
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      <JobDetailsSection job={job} isLoading={isLoading} />
      <CandidatesSection 
        candidates={candidates} 
        isLoading={isLoading}
        jobId={jobId}
      />
    </DashboardLayout>
  );
}