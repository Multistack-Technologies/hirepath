// src/app/recruiter/candidates/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/Button";
import Link from "next/link";
import api from "@/lib/api";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  StarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  LightBulbIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { AIAnalysis } from "./[id]/page";

interface Candidate {
  id: number;
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
  application_status:
    | "PENDING"
    | "REVIEWED"
    | "SHORTLISTED"
    | "REJECTED"
    | "HIRED";
  cover_letter: string | null;
  notes: string | null;
  interview_date: string | null;
   ai_analysis: AIAnalysis | null;
  ai_feedback: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Candidate[];
}

export default function CandidatesList() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [scoreFilter, setScoreFilter] = useState<string>("ALL");
  const [jobFilter, setJobFilter] = useState<string>("ALL");

  const fetchCandidates = async (
    url: string = "/applications/recruiter/candidates/"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse>(url);

      if (response.data && Array.isArray(response.data.results)) {
        if (url === "/applications/recruiter/candidates/") {
          // Initial load
          setCandidates(response.data.results);
          setFilteredCandidates(response.data.results);
        } else {
          // Pagination load - append to existing candidates
          setCandidates((prev) => [...prev, ...response.data.results]);
          setFilteredCandidates((prev) => [...prev, ...response.data.results]);
        }

        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else {
        setError("Failed to load candidates: Unexpected response format.");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to load candidates";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCandidates = async () => {
    if (pagination.next) {
      await fetchCandidates(pagination.next);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "RECRUITER") {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    fetchCandidates();
  }, [user, router]);

  // Filter candidates based on search and filters
  useEffect(() => {
    let filtered = candidates;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.first_name?.toLowerCase().includes(query) ||
          candidate.last_name?.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.job_title?.toLowerCase().includes(query) ||
          candidate.company_name?.toLowerCase().includes(query) ||
          candidate.current_job_title?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (candidate) => candidate.application_status === statusFilter
      );
    }

    // Score filter
    if (scoreFilter !== "ALL") {
      switch (scoreFilter) {
        case "EXCELLENT":
          filtered = filtered.filter(
            (candidate) => candidate.match_score >= 80
          );
          break;
        case "GOOD":
          filtered = filtered.filter(
            (candidate) =>
              candidate.match_score >= 60 && candidate.match_score < 80
          );
          break;
        case "FAIR":
          filtered = filtered.filter(
            (candidate) =>
              candidate.match_score >= 40 && candidate.match_score < 60
          );
          break;
        case "POOR":
          filtered = filtered.filter((candidate) => candidate.match_score < 40);
          break;
      }
    }

    // Job filter
    if (jobFilter !== "ALL") {
      filtered = filtered.filter(
        (candidate) => candidate.job_title === jobFilter
      );
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, statusFilter, scoreFilter, jobFilter, candidates]);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      REVIEWED: "bg-blue-100 text-blue-800 border-blue-200",
      SHORTLISTED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
      HIRED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (score >= 20) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getLocationText = (location: Candidate["location"]) => {
    if (location?.city && location?.country) {
      return `${location.city}, ${location.country}`;
    }
    return location?.city || location?.country || "Location not specified";
  };

  // Get unique job titles for filter
  const uniqueJobTitles = [
    ...new Set(candidates.map((candidate) => candidate.job_title)),
  ];

  // Calculate statistics
  const stats = {
    total: pagination.count,
    pending: candidates.filter((c) => c.application_status === "PENDING")
      .length,
    shortlisted: candidates.filter(
      (c) => c.application_status === "SHORTLISTED"
    ).length,
    excellent: candidates.filter((c) => c.match_score >= 80).length,
    good: candidates.filter((c) => c.match_score >= 60 && c.match_score < 80)
      .length,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="All Candidates"
      pageDescription="Manage and review candidates across all your job postings"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Candidates
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage candidates across all your job postings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchCandidates()}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/jobs")}
            >
              View My Jobs
            </Button>
          </div>
        </div>

        {/* Stats Overview - Enhanced with better styling */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {stats.shortlisted}
            </div>
            <div className="text-xs text-gray-600 mt-1">Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {stats.excellent}
            </div>
            <div className="text-xs text-gray-600 mt-1">Excellent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {stats.good}
            </div>
            <div className="text-xs text-gray-600 mt-1">Good</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XMarkIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => fetchCandidates()}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search candidates by name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ALL">All Scores</option>
                <option value="EXCELLENT">Excellent (80-100%)</option>
                <option value="GOOD">Good (60-79%)</option>
                <option value="FAIR">Fair (40-59%)</option>
                <option value="POOR">Poor (0-39%)</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Job Title Filter */}
            <div>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ALL">All Jobs</option>
                {uniqueJobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery ||
              statusFilter !== "ALL" ||
              scoreFilter !== "ALL" ||
              jobFilter !== "ALL") && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {filteredCandidates.length} of {candidates.length}{" "}
                  loaded candidates
                  {pagination.count > candidates.length &&
                    ` (${pagination.count} total)`}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setScoreFilter("ALL");
                    setJobFilter("ALL");
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Candidates List - Mixed Design */}
        {isLoading && candidates.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {candidates.length === 0
                ? "No Candidates Yet"
                : "No Candidates Found"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {candidates.length === 0
                ? "Candidates will appear here when they apply to your job postings."
                : "Try adjusting your search criteria or filters."}
            </p>
            {candidates.length === 0 && (
              <Button
                variant="primary"
                onClick={() => router.push("/jobs/create")}
              >
                Create Your First Job
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced Header with Sort Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {filteredCandidates.length} candidate
                {filteredCandidates.length !== 1 ? "s" : ""}
              </div>
              {filteredCandidates.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <SparklesIcon className="w-4 h-4 text-purple-500" />
                  <span>Sorted by match score</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.application_id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() =>
                    router.push(`/candidates/${candidate.application_id}`)
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Candidate Info - Mixed Layout */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {candidate.first_name?.charAt(0)}
                        {candidate.last_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {candidate.first_name} {candidate.last_name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatchScoreColor(
                              candidate.match_score
                            )}`}
                          >
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            {candidate.match_score}% Match
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="font-medium">{candidate.email}</span>
                          <span className="mx-2">•</span>
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{getLocationText(candidate.location)}</span>
                        </div>

                        {/* Job and Company */}
                        <div className="flex items-center text-sm text-gray-700 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="font-medium">
                            {candidate.job_title}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{candidate.company_name}</span>
                        </div>

                        {/* Current Position */}
                        {candidate.current_job_title && (
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                            <span>{candidate.current_job_title}</span>
                          </div>
                        )}

                        {/* AI Analysis Summary */}
                        {candidate.ai_analysis && (
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                            {/* Skills Match */}
                            <div className="flex items-center">
                              <DocumentTextIcon className="w-3 h-3 mr-1 text-green-500" />
                              <span>
                                {
                                  candidate.ai_analysis.skills_assessment
                                    .matched_skills.length
                                }{" "}
                                skills match
                              </span>
                            </div>

                            {/* Missing Skills */}
                            {candidate.ai_analysis.skills_assessment
                              .missing_skills.length > 0 && (
                              <div className="flex items-center">
                                <LightBulbIcon className="w-3 h-3 mr-1 text-orange-500" />
                                <span>
                                  {
                                    candidate.ai_analysis.skills_assessment
                                      .missing_skills.length
                                  }{" "}
                                  skills missing
                                </span>
                              </div>
                            )}

                            {/* Education Match */}
                            <div className="flex items-center">
                              <AcademicCapIcon
                                className={`w-3 h-3 mr-1 ${
                                  candidate.ai_analysis.education_assessment
                                    .qualification_match
                                    ? "text-green-500"
                                    : "text-orange-500"
                                }`}
                              />
                              <span>
                                {candidate.ai_analysis.education_assessment
                                  .qualification_match
                                  ? "Education match"
                                  : "Education gap"}
                              </span>
                            </div>

                            {/* Strength Rating */}
                            <div className="flex items-center">
                              <TrophyIcon
                                className={`w-3 h-3 mr-1 ${
                                  candidate.ai_analysis.skills_assessment
                                    .strength_rating === "excellent"
                                    ? "text-yellow-500"
                                    : candidate.ai_analysis.skills_assessment
                                        .strength_rating === "high"
                                    ? "text-green-500"
                                    : candidate.ai_analysis.skills_assessment
                                        .strength_rating === "medium"
                                    ? "text-blue-500"
                                    : "text-orange-500"
                                }`}
                              />
                              <span className="capitalize">
                                {
                                  candidate.ai_analysis.skills_assessment
                                    .strength_rating
                                }
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Skills Preview from AI Analysis */}
                        {candidate.ai_analysis?.skills_assessment
                          ?.matched_skills &&
                          candidate.ai_analysis.skills_assessment.matched_skills
                            .length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.ai_analysis.skills_assessment.matched_skills
                                .slice(0, 4)
                                .map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {candidate.ai_analysis.skills_assessment
                                .matched_skills.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                                  +
                                  {candidate.ai_analysis.skills_assessment
                                    .matched_skills.length - 4}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          )}

                        {/* Fallback to match_details if no AI analysis */}
                        {!candidate.ai_analysis &&
                          candidate.match_details?.skills_matched &&
                          candidate.match_details.skills_matched.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.match_details.skills_matched
                                .slice(0, 4)
                                .map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {candidate.match_details.skills_matched.length >
                                4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                                  +
                                  {candidate.match_details.skills_matched
                                    .length - 4}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          )}

                        {/* AI Recommendation Badge */}
                        {candidate.ai_analysis?.overall_assessment && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                candidate.ai_analysis.overall_assessment
                                  .recommendation === "strong_recommend"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : candidate.ai_analysis.overall_assessment
                                      .recommendation === "recommend"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : candidate.ai_analysis.overall_assessment
                                      .recommendation === "consider"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <StarIcon className="w-3 h-3 mr-1" />
                              {candidate.ai_analysis.overall_assessment.recommendation
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>
                        )}

                 

                        {/* Needs Improvement Indicator */}
            
                      </div>
                    </div>

                    {/* Right Side - Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          candidate.application_status
                        )}`}
                      >
                        {candidate.application_status}
                      </span>

                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>
                          Applied {getTimeAgo(candidate.applied_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`mailto:${candidate.email}`);
                          }}
                          icon={<EnvelopeIcon className="w-3 h-3" />}
                        >
                          Contact
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/candidates/${candidate.application_id}`
                            );
                          }}
                          icon={<EyeIcon className="w-3 h-3" />}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.next && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={loadMoreCandidates}
                  isLoading={isLoading}
                  icon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Load More Candidates
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Showing {candidates.length} of {pagination.count} total
                  candidates
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
