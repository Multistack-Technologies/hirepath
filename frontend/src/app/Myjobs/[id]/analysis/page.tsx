"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/Button";
import api from "@/lib/api";

interface JobAnalysisData {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    work_type: string;
    experience_level: string;
    salary_range: string;
    closing_date: string;
    days_remaining: number;
  };
  profile_summary: {
    skills_count: number;
    educations_count: number;
    experiences_count: number;
    certificates_count: number;
  };
  analysis: {
    match_score: number;
    match_quality: string;
    skills_match: {
      matched_skills: string[];
      missing_skills: string[];
      strength_rating: string;
      match_percentage: number;
    };
    education_match: {
      qualification_match: boolean;
      relevant_degrees: string[];
      match_quality: string;
    };
    certification_match: {
      relevant_certifications: string[];
      missing_certifications: string[];
      certification_score: number;
    };
    feedback: string;
  };
}

export default function JobAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<JobAnalysisData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const fetchJobAnalysis = async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/jobs/${jobId}/analyze/`);
      setAnalysisData(response.data);
    } catch (err: any) {
      console.error("Error fetching job analysis:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to load job analysis";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "GRADUATE") {
      setError("Access Denied. This feature is for graduates only.");
      setIsLoading(false);
      return;
    }

    fetchJobAnalysis();
  }, [user, router, jobId]);

  const getMatchQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "fair":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "needs improvement":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case "high":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Job Analysis">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing job match...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Job Analysis">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Job
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Job Match Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            See how your profile matches with this job opportunity
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/profile")}>
          Improve Profile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {analysisData && (
        <div className="space-y-6">
          {/* Job Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {analysisData.job.title}
                </h2>
                <p className="text-lg text-gray-700 mt-1">
                  {analysisData.job.company}
                </p>
                <div className="flex items-center text-gray-600 mt-2 space-x-4">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {analysisData.job.location}
                  </span>
                  <span>{analysisData.job.employment_type}</span>
                  <span>{analysisData.job.work_type}</span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMatchQualityColor(
                    analysisData.analysis.match_quality
                  )}`}
                >
                  {analysisData.analysis.match_quality}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Math.round(analysisData.analysis.match_score )}%
                </p>
                <p className="text-sm text-gray-600">Overall Match</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysisData.profile_summary.skills_count}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysisData.profile_summary.educations_count}
                </div>
                <div className="text-sm text-gray-600">Education</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysisData.profile_summary.experiences_count}
                </div>
                <div className="text-sm text-gray-600">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysisData.profile_summary.certificates_count}
                </div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
            </div>
          </div>

          {/* Main Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skills Match */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills Match
                </h3>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Skills Compatibility
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {analysisData.analysis.skills_match.match_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(
                        analysisData.analysis.skills_match.match_percentage
                      )}`}
                      style={{
                        width: `${analysisData.analysis.skills_match.match_percentage}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Strength:{" "}
                      <span
                        className={getStrengthColor(
                          analysisData.analysis.skills_match.strength_rating
                        )}
                      >
                        {analysisData.analysis.skills_match.strength_rating}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {analysisData.analysis.skills_match.matched_skills.length}{" "}
                      matched,{" "}
                      {analysisData.analysis.skills_match.missing_skills.length}{" "}
                      missing
                    </span>
                  </div>
                </div>

                {/* Matched Skills */}
                {analysisData.analysis.skills_match.matched_skills.length >
                  0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Skills You Have
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.analysis.skills_match.matched_skills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {analysisData.analysis.skills_match.missing_skills.length >
                  0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      Skills to Develop
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.analysis.skills_match.missing_skills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Education Match */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Education Match
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Qualification Match
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      analysisData.analysis.education_match.qualification_match
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {analysisData.analysis.education_match.qualification_match
                      ? "Matched"
                      : "Not Matched"}
                  </span>
                </div>

                {analysisData.analysis.education_match.relevant_degrees.length >
                  0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Your Qualifications
                    </h4>
                    <div className="space-y-2">
                      {analysisData.analysis.education_match.relevant_degrees.map(
                        (degree, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {degree}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Certification Match */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Certification Match
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Certification Score
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {
                        analysisData.analysis.certification_match
                          .certification_score
                      }
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        analysisData.analysis.certification_match
                          .certification_score
                      )}`}
                      style={{
                        width: `${analysisData.analysis.certification_match.certification_score}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Relevant Certifications */}
                {analysisData.analysis.certification_match
                  .relevant_certifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      Your Certifications
                    </h4>
                    <div className="space-y-2">
                      {analysisData.analysis.certification_match.relevant_certifications.map(
                        (cert, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {cert}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Certifications */}
                {analysisData.analysis.certification_match
                  .missing_certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">
                      Recommended Certifications
                    </h4>
                    <div className="space-y-2">
                      {analysisData.analysis.certification_match.missing_certifications.map(
                        (cert, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <svg
                              className="w-4 h-4 text-red-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            {cert}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Feedback
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {analysisData.analysis.feedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Feedback & Actions */}
            <div className="space-y-6">
              {/* AI Feedback */}

              {/* Improvement Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Improve Your Match
                </h3>
                <div className="space-y-3">
                  {analysisData.analysis.skills_match.missing_skills.length >
                    0 && (
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-red-500 mr-3 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Add Missing Skills
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Develop{" "}
                          {
                            analysisData.analysis.skills_match.missing_skills
                              .length
                          }{" "}
                          key skills
                        </p>
                      </div>
                    </div>
                  )}

                  {analysisData.analysis.certification_match
                    .missing_certifications.length > 0 && (
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-yellow-500 mr-3 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Get Certifications
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Consider{" "}
                          {
                            analysisData.analysis.certification_match
                              .missing_certifications.length
                          }{" "}
                          recommended certifications
                        </p>
                      </div>
                    </div>
                  )}

                  {analysisData.profile_summary.experiences_count === 0 && (
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-purple-500 mr-3 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Add Work Experience
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Include relevant projects and work history
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push("/profile")}
                  >
                    Update Profile
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push("/courses")}
                  >
                    Find Courses
                  </Button>
                </div>
              </div>

              {/* Job Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Details
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <span className="font-medium">
                      {analysisData.job.experience_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary Range:</span>
                    <span className="font-medium">
                      {analysisData.job.salary_range}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Closing Date:</span>
                    <span className="font-medium">
                      {new Date(
                        analysisData.job.closing_date
                      ).toLocaleDateString()}
                      <span className="text-orange-600 ml-2">
                        ({analysisData.job.days_remaining} days left)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
