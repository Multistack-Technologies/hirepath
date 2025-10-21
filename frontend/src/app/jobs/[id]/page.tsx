// app/recruiter/jobs/[id]/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import JobDetailsHeader from '@/components/jobs/JobDetailsHeader';
import JobDetailsSection from '@/components/jobs/JobDetailsSection';
import JobCandidatesSection from '@/components/jobs/JobCandidatesSection';
import { useJobDetails } from '@/hooks/useJobDetails';
import JobErrorState from '@/components/jobs/JobErrorState';

export default function JobDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = Number(params.id);
  
  const { job, candidates, isLoading, error, refetch } = useJobDetails(jobId);

  // Redirect if not authenticated or not recruiter
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'RECRUITER') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleBack = () => {
    router.push('/jobs');
  };

  const handleEditJob = () => {
    router.push(`/jobs/edit/${jobId}`);
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <DashboardLayout pageTitle="Job Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render content if not recruiter (will redirect)
  if (user.role !== 'RECRUITER') {
    return null;
  }

  return (
    <DashboardLayout 
      pageTitle="Job Details"
      pageDescription="View job details and manage candidates"
    >
      {/* Header */}
      <JobDetailsHeader 
        jobTitle={job?.title}
        onBack={handleBack}
        onEdit={handleEditJob}
        showEdit={!!job}
      />

      {/* Error State */}
      {error && (
        <JobErrorState 
          error={error} 
          onRetry={refetch}
        />
      )}

      {/* Job Details */}
      <JobDetailsSection 
        job={job} 
        isLoading={isLoading}
      />

      {/* Candidates Section */}
      <JobCandidatesSection 
        candidates={candidates}
        jobId={jobId}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}