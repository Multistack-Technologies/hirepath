// app/jobs/page.tsx
'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import JobSearchFilters from '@/components/jobs/JobSearchFilters';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useJobApplication } from '@/hooks/useJobApplication';
import JobDetail from '@/components/jobs/graduate/JobDetail';
import JobList from '@/components/jobs/graduate/JobList';
import ApplyModal from '@/components/jobs/graduate/ApplyModal';

export default function JobsPage() {
  const {
    jobs,
    selectedJob,
    filters,
    isLoading,
    error,
    setSelectedJob,
    updateFilters,
    clearFilters,
    refetch,
  } = useJobSearch();

  const { applyToJob, isApplying } = useJobApplication();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleApply = (jobId: number) => {
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (coverLetter: string): Promise<boolean> => {
    if (!selectedJob) return false;
    
    const success = await applyToJob(selectedJob.id, coverLetter);
    if (success) {
      refetch(); // Refresh to update application counts
      return true;
    }
    return false;
  };

  if (error) {
    return (
      <DashboardLayout pageTitle="Find Jobs" pageDescription="Browse available job opportunities">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Jobs</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      pageTitle="Find Jobs" 
      pageDescription="Browse available job opportunities and find your perfect match"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
              <p className="text-gray-600 mt-2">
                Discover {jobs.length} job{jobs.length !== 1 ? 's' : ''} matching your criteria
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
              <div className="text-sm text-gray-500">Jobs Available</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobSearchFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Job List */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Available Jobs {isLoading && '(Loading...)'}
                    </h2>
                  </div>
                  <div className="p-6">
                    <JobList
                      jobs={jobs}
                      selectedJob={selectedJob}
                      onSelectJob={setSelectedJob}
                        showFullPageLink={true}
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="xl:col-span-1">
                <JobDetail
                  job={selectedJob}
                  onApply={handleApply}
                  isApplying={isApplying}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {selectedJob && (
          <ApplyModal
            isOpen={isApplyModalOpen}
            onClose={() => setIsApplyModalOpen(false)}
            onApply={handleSubmitApplication}
            jobTitle={selectedJob.title}
            companyName={selectedJob.company_name}
            isApplying={isApplying}
          />
        )}
      </div>
    </DashboardLayout>
  );
}