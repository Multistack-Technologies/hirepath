import Button from "@/components/Button";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from 'next/navigation';


interface ResumeData {
  id: number;
  file_name: string;
  uploaded_at: string;
  ai_feedback?: {
    score: number;
    match_strength: string;
    job_role_recommendations?: Array<{
      job_role: {
        id: number;
        title: string;
        category_display: string;
        is_in_demand: boolean;
      };
      match_score: number;
    }>;
  };
}

interface ResumeSectionProps {
  resumeScore?: number;
  onUploadClick: () => void;
}

export default function ResumeSection({
  resumeScore,
  onUploadClick,
}: ResumeSectionProps) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fetchLatestResume = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/resumes/latest/");
      if (response.data?.resume) {
        setResumeData(response.data.resume);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError("Failed to load resume data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTopJobRecommendation = () => {
    if (!resumeData?.ai_feedback?.job_role_recommendations?.length) return null;
    return resumeData.ai_feedback.job_role_recommendations[0];
  };

  const topJob = getTopJobRecommendation();

  function onViewAnalysis(): void {
      router.push("/profile/analysis");
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="justify-between items-center mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resume Rating</h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered analysis</p>
        </div>
 
      </div>

      {/* Resume Score Circle */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div
            className={`w-28 h-28 rounded-full border-8 flex items-center justify-center mx-auto transition-all duration-300 ${
              resumeData?.ai_feedback?.score
                ? `${getScoreBgColor(
                    resumeData.ai_feedback.score
                  )} border-current ${getScoreColor(
                    resumeData.ai_feedback.score
                  )}`
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${
                  resumeData?.ai_feedback?.score
                    ? getScoreColor(resumeData.ai_feedback.score)
                    : "text-gray-400"
                }`}
              >
                {resumeData?.ai_feedback?.score || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">/100</p>
            </div>
          </div>

          {/* Match Strength Badge */}
          {resumeData?.ai_feedback?.match_strength && (
            <div
              className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(
                resumeData.ai_feedback.match_strength
              )}`}
            >
              {resumeData.ai_feedback.match_strength.toUpperCase()}
            </div>
          )}
        </div>
      </div>
                 <div className="flex gap-2 w-full">
          <Button
            variant="primary"
            size="sm"
            onClick={onUploadClick}
            className="shadow-sm hover:shadow-md transition-shadow w-1/2"
          >
            {resumeData ? "Re-upload" : "Upload CV"}
          </Button>
          {resumeData && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={onViewAnalysis}
              className="bg-indigo-50 w-1/2 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
            >
              View Analysis
            </Button>
          )}
        </div>
      {/* Resume Info */}
      {resumeData ? (
        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Current Resume
                </span>
              </div>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {resumeData.file_name.split(".").pop()?.toUpperCase()}
              </span>
            </div>
            <p
              className="text-xs text-gray-600 truncate mb-1"
              title={resumeData.file_name}
            >
              {resumeData.file_name}
            </p>
            <p className="text-xs text-gray-500">
              Uploaded {formatDate(resumeData.uploaded_at)}
            </p>
          </div>

          {/* Top Job Recommendation */}
          {topJob && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-700">
                  Top Match
                </span>
                <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full font-medium">
                  {topJob.match_score}% match
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {topJob.job_role.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{topJob.job_role.category_display}</span>
                {topJob.job_role.is_in_demand && (
                  <span className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    In Demand
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Score Description */}
          <div className="text-center">
            {resumeData.ai_feedback?.score && (
              <div className="text-sm text-gray-600">
                {resumeData.ai_feedback.score >= 80 && (
                  <p className="text-green-600 font-medium">
                    🎉 Excellent! Your resume is well-optimized
                  </p>
                )}
                {resumeData.ai_feedback.score >= 60 &&
                  resumeData.ai_feedback.score < 80 && (
                    <p className="text-yellow-600 font-medium">
                      👍 Good! There's room for improvement
                    </p>
                  )}
                {resumeData.ai_feedback.score < 60 && (
                  <p className="text-red-600 font-medium">
                    💡 Consider improving your resume for better matches
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Resume State */
        <div className="text-center space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-2">No resume uploaded yet</p>
            <p className="text-xs text-gray-500">
              Upload your resume to get AI-powered analysis and job
              recommendations
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onUploadClick}
            className="w-full shadow-sm hover:shadow-md transition-shadow"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Your First Resume
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading resume data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
