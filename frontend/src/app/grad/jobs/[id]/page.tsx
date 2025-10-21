// app/jobs/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/Button";
import { useJobApplication } from "@/hooks/useJobApplication";
import { Job } from "@/types";
import { jobService } from "@/services/jobService";
import { useToast } from "@/context/ToastContext";
import ApplyModal from "@/components/jobs/graduate/ApplyModal";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const jobId = parseInt(params.id as string);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { applyToJob, isApplying } = useJobApplication();

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const jobData = await jobService.getJobById(jobId);
      setJob(jobData);
    } catch (err: any) {
      const errorMessage = jobService.getErrorMessage(err);
      setError(errorMessage);
      addToast({
        type: "error",
        title: "Failed to load job",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    setIsApplyModalOpen(true);
  };

 const handleSubmitApplication = async (coverLetter: string): Promise<boolean> => {
  if (!job) return false;

  try {
    await applyToJob(job.id, coverLetter);
    // Refresh job data to update application count
    fetchJob();
    return true;
  } catch (error) {
    console.error('Application failed:', error);
    return false;
  }
};

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <DashboardLayout
        pageTitle="Job Details"
        pageDescription="Loading job information..."
      >
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout
        pageTitle="Job Not Found"
        pageDescription="The requested job could not be found"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              {error ||
                "The job you are looking for does not exist or has been removed."}
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => router.push("/jobs")}
                variant="primary"
                size="lg"
              >
                Browse All Jobs
              </Button>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                size="lg"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={job.title}
      pageDescription={`${job.company_name} - ${job.location}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            ← Back to Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Job Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                      {job.company_name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h1>
                      <p className="text-xl text-gray-700 font-medium mb-3">
                        {job.company_name}
                      </p>
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span className="flex items-center">
                          📍 {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.employment_type_display}</span>
                        <span>•</span>
                        <span>{getTimeAgo(job.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {job.salary_range &&
                    job.salary_range !== "Salary not specified" && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {job.salary_range}
                        </div>
                        <div className="text-sm text-gray-500">
                          Annual Salary
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Job Stats */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {job.applications_count || 0}
                    </div>
                    <div className="text-sm text-gray-500">Applications</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {job.days_remaining || "∞"}
                    </div>
                    <div className="text-sm text-gray-500">Days Left</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {job.is_active ? "Active" : "Closed"}
                    </div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-8 space-y-8">
                {/* Job Description */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Job Description
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    {job.description.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>

                {/* Required Skills */}
                {(job.skills_required || []).length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {(job.skills_required || []).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Job Requirements */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Job Requirements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Employment Type
                        </h3>
                        <p className="text-gray-700">
                          {job.employment_type_display}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Work Type
                        </h3>
                        <p className="text-gray-700">{job.work_type_display}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Experience Level
                        </h3>
                        <p className="text-gray-700">
                          {job.experience_level_display}
                        </p>
                      </div>
                      {job.closing_date && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Closing Date
                          </h3>
                          <p className="text-gray-700">
                            {new Date(job.closing_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                            {job.days_remaining !== null && (
                              <span className="text-orange-600 ml-2">
                                ({job.days_remaining} days remaining)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Preferred Qualifications */}
                {/* Preferred Qualifications */}
                {((job.courses_preferred || []).length > 0 ||
                  (job.certificates_preferred || []).length > 0) && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Preferred Qualifications
                    </h2>

                    {(job.courses_preferred || []).length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Preferred Degrees
                        </h3>
                        <div className="space-y-2">
                          {(job.courses_preferred || []).map((degree) => (
                            <div
                              key={degree.id}
                              className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-green-800">
                                  {degree.name}
                                </div>
                                <div className="text-sm text-green-600">
                                  {degree.issuer_name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(job.certificates_preferred || []).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Preferred Certifications
                        </h3>
                        <div className="space-y-2">
                          {(job.certificates_preferred || []).map(
                            (provider) => (
                              <div
                                key={provider.id}
                                className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium text-purple-800">
                                    {provider.name}
                                  </div>
                                  {provider.description && (
                                    <div className="text-sm text-purple-600">
                                      {provider.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Apply Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  {job.is_active ? (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleApply}
                        isLoading={isApplying}
                        disabled={isApplying}
                        className="w-full py-3 text-lg font-semibold mb-4"
                      >
                        {isApplying ? "Applying..." : "APPLY NOW"}
                      </Button>
                      <p className="text-sm text-gray-600">
                        {job.applications_count || 0} people have applied for
                        this position
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                        <div className="text-lg font-semibold text-gray-700">
                          Position Closed
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          This job is no longer accepting applications
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => router.push("/jobs")}
                        className="w-full py-3 text-lg font-semibold"
                      >
                        Browse Other Jobs
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Company Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About the Company
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {job.company_name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {job.company_name}
                    </h4>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/companies/${job.company}`)}
                >
                  View Company Profile
                </Button>
              </div>

              {/* Job Meta Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium">
                      {getTimeAgo(job.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employment Type</span>
                    <span className="font-medium">
                      {job.employment_type_display}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Type</span>
                    <span className="font-medium">{job.work_type_display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level</span>
                    <span className="font-medium">
                      {job.experience_level_display}
                    </span>
                  </div>
                  {job.closing_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closing Date</span>
                      <span className="font-medium">
                        {new Date(job.closing_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onApply={handleSubmitApplication}
          jobTitle={job.title}
          companyName={job.company_name}
          isApplying={isApplying}
        />
      </div>
    </DashboardLayout>
  );
}
