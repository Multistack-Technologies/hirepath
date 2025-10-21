// src/app/candidates/[id]/cv/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import api from '@/lib/api';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  StarIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EyeIcon,
  SparklesIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

interface Candidate {
  application_id: number;
  applicant_id: number;
  first_name: string;
  last_name: string;
  email: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
  current_job_title: string;
  applied_date: string;
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
  job_title: string;
  company_name: string;
  application_status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  cover_letter: string | null;
  notes: string | null;
  interview_date: string | null;
  resume?: {
    id: number;
    file_url: string;
    uploaded_at: string;
    file_name?: string;
    file_size?: number;
  };
}

export default function ViewCV() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const candidateId = Number(params.id);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Candidate>(`/candidates/${candidateId}/`);
      
      if (response.data) {
        setCandidate(response.data);
      } else {
        setError("Failed to load candidate details: Unexpected response format.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load candidate details';
      setError(errorMessage);
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
      fetchCandidateData();
    } else {
      setError("Invalid Candidate ID");
      setIsLoading(false);
    }
  }, [user, router, candidateId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getFeedbackColor = (feedbackItem: string): string => {
    if (feedbackItem.toLowerCase().includes("add") || feedbackItem.toLowerCase().includes("consider")) 
      return "text-blue-600 bg-blue-50 border-blue-200";
    if (feedbackItem.toLowerCase().includes("improve") || feedbackItem.toLowerCase().includes("expand")) 
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (feedbackItem.toLowerCase().includes("great") || feedbackItem.toLowerCase().includes("good") || feedbackItem.toLowerCase().includes("strong")) 
      return "text-green-600 bg-green-50 border-green-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getFeedbackIcon = (feedbackItem: string) => {
    if (feedbackItem.toLowerCase().includes("great") || feedbackItem.toLowerCase().includes("good")) 
      return CheckBadgeIcon;
    if (feedbackItem.toLowerCase().includes("add") || feedbackItem.toLowerCase().includes("consider")) 
      return LightBulbIcon;
    return ExclamationTriangleIcon;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getLocationText = (location: Candidate['location']) => {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    return location.city || location.country || 'Location not specified';
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout 
      pageTitle={`${candidate?.first_name || 'Candidate'} ${candidate?.last_name || ''}`}
      pageDescription="View candidate resume and AI-powered analysis"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/candidates/${candidateId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Profile
            </Link>
            <div className="w-1 h-6 bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate?.first_name} {candidate?.last_name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Resume and AI Analysis
              </p>
            </div>
          </div>
          
          {/* {candidate?.resume?.file_url && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(candidate.resume.file_url, '_blank')}
                icon={<EyeIcon className="w-4 h-4" />}
              >
                Open CV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = candidate.resume.file_url;
                  link.download = candidate.resume.file_name || 'candidate-cv.pdf';
                  link.click();
                }}
                icon={<DownloadIcon className="w-4 h-4" />}
              >
                Download
              </Button>
            </div>
          )} */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={fetchCandidateData}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : !candidate ? (
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Candidate Not Found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              No candidate data found.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - CV Viewer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candidate Info Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {candidate.first_name?.charAt(0)}{candidate.last_name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {candidate.first_name} {candidate.last_name}
                      </h2>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{getLocationText(candidate.location)}</span>
                      </div>
                      {candidate.current_job_title && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <BriefcaseIcon className="w-4 h-4 mr-1" />
                          <span>{candidate.current_job_title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.application_status)}`}>
                    {candidate.application_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Applied For</div>
                    <div className="font-semibold text-gray-900">{candidate.job_title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Applied Date</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(candidate.applied_date)} ({getTimeAgo(candidate.applied_date)})
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Viewer Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    Candidate Resume
                  </h2>
                  {candidate.resume?.uploaded_at && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Uploaded {formatDate(candidate.resume.uploaded_at)}</span>
                    </div>
                  )}
                </div>

                {/* PDF Viewer */}
                {candidate.resume?.file_url ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <iframe
                      src={candidate.resume.file_url}
                      title="Candidate CV"
                      width="100%"
                      height="600px"
                      className="border-0"
                    >
                      <p>Your browser does not support PDF viewing. <a href={candidate.resume.file_url}>Download the PDF</a>.</p>
                    </iframe>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No resume available for this candidate.</p>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              {candidate.cover_letter && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                    Cover Letter
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {candidate.cover_letter.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-gray-700 text-sm">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - AI Analysis */}
            <div className="space-y-6">
              {/* Match Score Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  Job Match Score
                </h3>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreColor(candidate.match_score)} mb-3`}>
                    <span className="text-2xl font-bold">{candidate.match_score}%</span>
                  </div>
                  <div className="text-sm text-gray-600">Overall Match</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(candidate.match_score / 20) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                  Skills Analysis
                </h3>

                {/* Skills Matched */}
                {candidate.match_details.skills_matched.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Skills Matched ({candidate.match_details.skills_matched.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.match_details.skills_matched.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {candidate.match_details.skills_missing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Skills to Develop ({candidate.match_details.skills_missing.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.match_details.skills_missing.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Match */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Education</h4>
                  <div className={`flex items-center gap-2 text-sm ${
                    candidate.match_details.education_match.has_required_education 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>
                      {candidate.match_details.education_match.has_required_education 
                        ? 'Meets education requirements' 
                        : 'Education gap identified'}
                    </span>
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Certifications</h4>
                  <div className="text-sm text-gray-600">
                    {candidate.match_details.certificate_match.matched_certificates.length > 0 ? (
                      <span className="text-green-600">
                        {candidate.match_details.certificate_match.matched_certificates.length} certificates matched
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        {candidate.match_details.certificate_match.missing_certificates.length} recommended certificates
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {candidate.match_details.feedback.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-blue-600" />
                    AI Recommendations
                  </h3>

                  <div className="space-y-3">
                    {candidate.match_details.feedback.map((point, index) => {
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}