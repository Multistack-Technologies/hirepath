'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import UpdateStatusModal from '@/components/candidates/UpdateStatusModal';
import Link from 'next/link';
import api from '@/lib/api';
import {
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  ArrowLeftIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  LightBulbIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";


interface Application {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  company_logo: string;
  applicant: number;
  applicant_name: string;
  applicant_email: string;
  applicant_details: {
    location: {
      city: string;
      country: string;
      address: string;
    };
    bio: string;
    linkedin_url: string;
    current_job_title: string;
  };
  cover_letter: string | null;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  applied_at: string;
  updated_at: string;
  match_score: number;
  match_details: {
    skills_matched: string[];
    skills_missing: string[];
    education_match: {
      has_required_education: boolean;
      preferred_courses: string[];
    };
    certificate_match: {
      matched_certificates: string[];
      missing_certificates: string[];
    };
    experience_match: object;
    feedback: string[];
  };
  notes: string | null;
  interview_date: string | null;
  can_withdraw: boolean;
}


export default function CandidateProfile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const candidateId = Number(params.id);
  const jobIdFromQuery = searchParams.get('jobId');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchCandidateDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching candidate details for ID:', candidateId); // Debug
      const response = await api.get(`/applications/${candidateId}/`);
      
      console.log('Full API Response:', response); // Debug
      console.log('Response data:', response.data); // Debug
      
      if (response.data) {
        setApplication(response.data);
        console.log('Application set:', response.data); // Debug
      } else {
        console.error('No data in response'); // Debug
        setError("Failed to load candidate details: No data received.");
      }
    } catch (err: any) {
      console.error('API Error:', err); // Debug
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load candidate details';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Failed to load candidate details',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'RECRUITER') {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    if (!isNaN(candidateId)) {
      fetchCandidateDetails();
    } else {
      setError("Invalid Candidate ID");
      setIsLoading(false);
    }
  }, [user, router, candidateId]);

  const handleStatusUpdate = async (updateData: {
    status: string;
    notes?: string;
    interview_date?: string;
  }) => {
    try {
      await api.patch(`/applications/${application!.id}/status`, updateData);
      await fetchCandidateDetails();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update candidate status';
      throw new Error(errorMessage);
    }
  };

  const handleQuickAction = async (action: 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED') => {
    setActionLoading(action);
    
    // Show immediate toast
    const toastMessages = {
      'REVIEWED': { type: 'success' as const, title: 'Candidate marked as reviewed!' },
      'SHORTLISTED': { type: 'success' as const, title: 'Candidate shortlisted successfully!' },
      'REJECTED': { type: 'warning' as const, title: 'Candidate rejected' },
      'HIRED': { type: 'success' as const, title: 'Candidate hired! Congratulations!' }
    };

    addToast({
      type: toastMessages[action].type,
      title: toastMessages[action].title,
    });

    try {
      await handleStatusUpdate({ status: action });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to update status',
        message: err.response?.data?.error || 'Please try again later.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalStatusUpdate = async (updateData: {
    status: string;
    notes?: string;
    interview_date?: string;
  }) => {
    // Show immediate toast for modal actions
    const toastMessages = {
      'REVIEWED': { type: 'success' as const, title: 'Candidate marked as reviewed!' },
      'SHORTLISTED': { type: 'success' as const, title: 'Candidate shortlisted successfully!' },
      'REJECTED': { type: 'warning' as const, title: 'Candidate rejected' },
      'HIRED': { type: 'success' as const, title: 'Candidate hired! Congratulations!' }
    };

    addToast({
      type: toastMessages[updateData.status as keyof typeof toastMessages].type,
      title: toastMessages[updateData.status as keyof typeof toastMessages].title,
    });

    await handleStatusUpdate(updateData);
  };

  // Get available actions based on current status
  const getAvailableActions = () => {
    if (!application) return [];

    const currentStatus = application.status;
    const allActions = [
      { value: 'REVIEWED' as const, label: 'Mark as Reviewed', variant: 'secondary' as const, icon: EyeIcon },
      { value: 'SHORTLISTED' as const, label: 'Shortlist', variant: 'primary' as const, icon: CheckBadgeIcon },
      { value: 'REJECTED' as const, label: 'Reject', variant: 'danger' as const, icon: XMarkIcon },
      { value: 'HIRED' as const, label: 'Hire', variant: 'success' as const, icon: StarIcon }
    ];

    // Filter out current status and provide relevant actions
    return allActions.filter(action => action.value !== currentStatus);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'REVIEWED': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHORTLISTED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'HIRED': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getFeedbackColor = (feedbackItem: string): string => {
    if (feedbackItem.includes("💡")) return "text-blue-600 bg-blue-50 border-blue-200";
    if (feedbackItem.includes("🎓")) return "text-purple-600 bg-purple-50 border-purple-200";
    if (feedbackItem.includes("📜")) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getFeedbackIcon = (feedbackItem: string) => {
    if (feedbackItem.includes("💡")) return LightBulbIcon;
    if (feedbackItem.includes("🎓")) return AcademicCapIcon;
    if (feedbackItem.includes("📜")) return TrophyIcon;
    return LightBulbIcon;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return 'Invalid date';
    }
  };

  const getLocationText = (location: Application['applicant_details']['location']) => {
    if (location?.city && location?.country) {
      return `${location.city}, ${location.country}`;
    }
    return location?.city || location?.country || 'Location not specified';
  };

  const getNameInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout 
      pageTitle={`${application?.applicant_name || 'Candidate'}`}
      pageDescription="View candidate profile and application details"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={jobIdFromQuery ? `/jobs/${jobIdFromQuery}` : '/candidates'}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {jobIdFromQuery ? 'Back to Job' : 'Back to Candidates'}
            </Link>
            <div className="w-1 h-6 bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {application?.applicant_name || 'Candidate Profile'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {application ? `Application for ${application.job_title || 'Unknown Position'}` : 'Loading candidate details...'}
              </p>
            </div>
          </div>
          
          {application && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`mailto:${application.applicant_email}`)}
                icon={<EnvelopeIcon className="w-4 h-4" />}
              >
                Contact
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
                icon={<PencilSquareIcon className="w-4 h-4" />}
              >
                Update Status
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XMarkIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={fetchCandidateDetails}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {/* Profile Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ) : !application ? (
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Candidate Not Found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              No candidate data found for this ID.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="space-y-6">


            {/* Candidate Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getNameInitials(application.applicant_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {application.applicant_name || 'Unknown Candidate'}
                      </h2>
                      {application.match_score && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMatchScoreColor(application.match_score)}`}>
                          <SparklesIcon className="w-4 h-4 mr-1.5" />
                          {application.match_score}% Match
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {application.applicant_email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          <span>{application.applicant_email}</span>
                        </div>
                      )}
                      {application.applicant_details?.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{getLocationText(application.applicant_details.location)}</span>
                        </div>
                      )}
                      {application.applicant_details?.current_job_title && (
                        <div className="flex items-center">
                          <BriefcaseIcon className="w-4 h-4 mr-1" />
                          <span>{application.applicant_details.current_job_title}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {application.applicant_details?.bio && (
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm">{application.applicant_details.bio}</p>
                      </div>
                    )}

                    {/* Skills Preview */}
                    {application.match_details?.skills_matched && application.match_details.skills_matched.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {application.match_details.skills_matched.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.match_details.skills_matched.length > 6 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                            +{application.match_details.skills_matched.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Job Details</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-sm">Position:</span>
                      <span className="text-sm font-medium">{application.job_title || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="text-sm font-medium">{application.company_name || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Applied:</span>
                      <span className="text-sm font-medium">
                        {formatDate(application.applied_at)} ({getTimeAgo(application.applied_at)})
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Match Analysis</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Skills Matched:</span>
                      <span className="text-sm font-medium">{application.match_details?.skills_matched?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Skills Missing:</span>
                      <span className="text-sm font-medium">{application.match_details?.skills_missing?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Education Match:</span>
                      <span className={`text-sm font-medium ${
                        application.match_details?.education_match?.has_required_education ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {application.match_details?.education_match?.has_required_education ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/jobs/${application.job}`)}
                  icon={<EyeIcon className="w-4 h-4" />}
                >
                  View Job
                </Button>

                {/* Dynamic Action Buttons */}
                {getAvailableActions().map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={action.value}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleQuickAction(action.value)}
                      isLoading={actionLoading === action.value}
                      disabled={actionLoading !== null}
                      icon={<ActionIcon className="w-4 h-4" />}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* AI Feedback Section */}
            {application.match_details?.feedback && application.match_details.feedback.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  AI Analysis & Recommendations
                </h3>

                <div className="space-y-3">
                  {application.match_details.feedback.map((point, index) => {
                    const FeedbackIcon = getFeedbackIcon(point);
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${getFeedbackColor(point)}`}
                      >
                        <FeedbackIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{point}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Missing Skills */}
                {application.match_details.skills_missing && application.match_details.skills_missing.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {application.match_details.skills_missing.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter Section */}
            {application.cover_letter && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  Cover Letter
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {application.cover_letter.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700 text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Update Modal */}
        {application && (
          <UpdateStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            candidate={{
              id: application.id,
              applicant_name: application.applicant_name || 'Unknown Candidate',
              current_status: application.status
            }}
            onStatusUpdate={handleModalStatusUpdate}
          />
        )}
      </div>
    </DashboardLayout>
  );
}