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
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  LightBulbIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const jobId = parseInt(params.id as string);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.company_name}`,
          url: window.location.href,
        });
      } catch (err) {
        // Share failed or was cancelled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: "success",
        title: "Link copied!",
        message: "Job link copied to clipboard",
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    addToast({
      type: "success",
      title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
      message: isBookmarked ? "Removed from saved jobs" : "Added to saved jobs",
    });
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

  const getExperienceLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'ENTRY': 'bg-green-100 text-green-800 border-green-200',
      'MID': 'bg-blue-100 text-blue-800 border-blue-200',
      'SENIOR': 'bg-purple-100 text-purple-800 border-purple-200',
      'LEAD': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWorkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'REMOTE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'HYBRID': 'bg-amber-100 text-amber-800 border-amber-200',
      'ONSITE': 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <DashboardLayout
        pageTitle="Job Details"
        pageDescription="Loading job information..."
      >
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Main Card Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-56"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              {/* Sidebar Skeleton */}
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
                <div className="h-56 bg-gray-200 rounded-2xl"></div>
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
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
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
              {error || "The job you are looking for does not exist or has been removed."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push("/Myjobs")}
                variant="primary"
                size="lg"
                className="px-6"
              >
                Browse All Jobs
              </Button>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                size="lg"
                className="px-6"
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
            href="/Myjobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {job.company_name?.charAt(0) || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {job.title}
                      </h1>
                      <div className="flex items-center space-x-3 text-gray-600 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">{job.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{getTimeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Job Type Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
                          <BriefcaseIcon className="w-3 h-3 mr-1.5" />
                          {job.experience_level_display}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getWorkTypeColor(job.work_type)}`}>
                          {job.work_type_display}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <AcademicCapIcon className="w-3 h-3 mr-1.5" />
                          {job.employment_type_display}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  {job.salary_range && job.salary_range !== "Salary not specified" && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                        {job.salary_range}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Annual Salary</div>
                    </div>
                  )}
                </div>

                {/* Job Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                      <UserGroupIcon className="w-5 h-5 text-blue-600" />
                      {job.applications_count || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                      <ClockIcon className="w-5 h-5 text-orange-600" />
                      {job.days_remaining || "∞"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Days Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                      <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                      {job.skills_required?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Skills Required</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                      job.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${job.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      {job.is_active ? "Active" : "Closed"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-blue-600" />
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700 text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Required Skills Card */}
            {(job.skills_required || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-orange-600" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(job.skills_required || []).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Qualifications */}
            {((job.courses_preferred || []).length > 0 || (job.certificates_preferred || []).length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-purple-600" />
                  Preferred Qualifications
                </h2>

                {(job.courses_preferred || []).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Degrees</h3>
                    <div className="grid gap-3">
                      {(job.courses_preferred || []).map((degree) => (
                        <div
                          key={degree.id}
                          className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <AcademicCapIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-800 text-sm">
                              {degree.name}
                            </div>
                            {degree.issuer_name && (
                              <div className="text-xs text-green-600">
                                {degree.issuer_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(job.certificates_preferred || []).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Certifications</h3>
                    <div className="grid gap-3">
                      {(job.certificates_preferred || []).map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <TrophyIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-purple-800 text-sm">
                              {provider.name}
                            </div>
                            {provider.description && (
                              <div className="text-xs text-purple-600">
                                {provider.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
              <div className="lg:col-span-1">
  <div className="space-y-6 sticky top-6">
    {/* Action Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-3">
        {job.is_active ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={handleApply}
              isLoading={isApplying}
              disabled={isApplying}
              className="w-full py-3 font-semibold shadow-lg hover:shadow-xl text-base"
            >
              {isApplying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Applying...
                </span>
              ) : (
                "APPLY NOW"
              )}
            </Button>
            
            {/* Analyze Match Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push(`/Myjobs/${job.id}/analysis`)}
              className="w-full py-3 font-semibold text-base border-2 border-indigo-200 hover:border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              Analyze Match
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBookmark}
                className="flex-1"
                icon={<BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />}
              >
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleShare}
                className="flex-1"
                icon={<ShareIcon className="w-4 h-4" />}
              >
                Share
              </Button>
            </div>
            <div className="text-center pt-2">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{job.applications_count || 0}</span> people have applied
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-base font-semibold text-red-700 mb-1">
                Position Closed
              </div>
              <div className="text-xs text-red-600">
                This job is no longer accepting applications
              </div>
            </div>
            
            {/* Analyze Match Button for Closed Jobs */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push(`/Myjobs/${job.id}/analysis`)}
              className="w-full py-3 font-semibold text-base border-2 border-indigo-200 hover:border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              Analyze Match
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/Myjobs")}
              className="w-full py-3 font-semibold text-base"
            >
              Browse Other Jobs
            </Button>
          </>
        )}
      </div>
    </div>

    {/* Company Info Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
        About the Company
      </h3>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg">
          {job.company_name?.charAt(0) || "C"}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">
            {job.company_name}
          </h4>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <MapPinIcon className="w-3 h-3" />
            {job.location}
          </p>
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

    {/* Job Details Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Job Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-gray-600 flex items-center gap-1 text-sm">
            <CalendarIcon className="w-3 h-3" />
            Posted
          </span>
          <span className="font-semibold text-gray-900 text-sm">
            {getTimeAgo(job.created_at)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-gray-600 text-sm">Employment Type</span>
          <span className="font-semibold text-gray-900 text-sm">
            {job.employment_type_display}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-gray-600 text-sm">Work Type</span>
          <span className="font-semibold text-gray-900 text-sm">{job.work_type_display}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-gray-600 text-sm">Experience Level</span>
          <span className="font-semibold text-gray-900 text-sm">
            {job.experience_level_display}
          </span>
        </div>
        {job.closing_date && (
          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 text-sm">Closing Date</span>
            <span className="font-semibold text-gray-900 text-sm">
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