// app/recruiter/jobs/page.tsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MyJobsHeader from '@/components/jobs/MyJobsHeader';
import JobList from '@/components/jobs/JobList';
import JobsErrorState from '@/components/jobs/JobsErrorState';
import { useMyJobs } from '@/hooks/useMyJobs';
import Button from '@/components/Button';

export default function MyJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const { jobs, isLoading, error, refetch } = useMyJobs();

  // Redirect if not authenticated or not recruiter
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'RECRUITER') {
      router.push('/dashboard'); // Redirect graduates to their dashboard
      return;
    }
  }, [user, router]);

  const handlePostNewVacancy = () => {
    router.push('/jobs/post');
  };

  const handleEditJob = (jobId: number) => {
    router.push(`jobs/edit/${jobId}`);
  };

  const handleViewApplications = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <DashboardLayout pageTitle="My Jobs">
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
      pageTitle="My Jobs"
      pageDescription="Manage your job postings and view applications"
    >
      {/* Header */}
      <MyJobsHeader 
        onPostNewVacancy={handlePostNewVacancy}
        jobCount={jobs.length}
      />

      {/* Error State */}
      {error && (
        <JobsErrorState 
          error={error} 
          onRetry={refetch}
        />
      )}

      {/* Job List */}
      <JobList
        jobs={jobs}
        onViewApplications={handleViewApplications}
        onEditJob={handleEditJob}
        isLoading={isLoading}
      />

      {/* Empty State Call to Action */}
      {!isLoading && jobs.length === 0 && !error && (
        <div className="text-center mt-8">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handlePostNewVacancy}
          >
            Post Your First Job
          </Button>
          <p className="text-gray-500 mt-2 text-sm">
            Start attracting qualified candidates to your company
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}