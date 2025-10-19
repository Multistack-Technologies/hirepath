// app/recruiter/jobs/page.tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { useJobs } from '@/context/JobContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RecruiterJobsPage() {
  const { userJobs, fetchUserJobs, isLoading } = useJobs();

  // Header action button for posting new job
  const headerAction = (
    <Link href="/recruiter/jobs/post">
      <Button variant="primary" size="sm">
        Post a Job
      </Button>
    </Link>
  );


  useEffect(() => {
    fetchUserJobs();
  }, [fetchUserJobs]);

  return (
    <DashboardLayout 
      pageTitle="Job Posts" 
      pageDescription="Manage your job listings and applications"
      headerAction={headerAction}
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{userJobs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Active Jobs</p>
            <p className="text-2xl font-bold text-green-600">
              {userJobs.filter(job => job.is_active).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Applications</p>
            <p className="text-2xl font-bold text-blue-600">
              {userJobs.reduce((total, job) => total + (job.application_count || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Draft Jobs</p>
            <p className="text-2xl font-bold text-yellow-600">
              {userJobs.filter(job => !job.is_active).length}
            </p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Job Posts</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading jobs...</p>
            </div>
          ) : userJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">💼</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first job to attract candidates</p>
              <Link href="/recruiter/jobs/post">
                <Button variant="primary" size="lg">
                  Post Your First Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-gray-600 mt-1">{job.location}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.is_active ? 'Active' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {job.application_count || 0} applications
                        </span>
                        <span className="text-sm text-gray-500">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/recruiter/jobs/${job.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Button variant="primary" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}