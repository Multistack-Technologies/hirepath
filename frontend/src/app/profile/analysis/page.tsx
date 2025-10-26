'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import ResumeAnalysisLoading from '@/components/analysis/ResumeAnalysisLoading';
import ResumeAnalysisError from '@/components/analysis/ResumeAnalysisError';
import BasicInfoSection from '@/components/analysis/BasicInfoSection';
import JobAnalysisSection from '@/components/analysis/JobAnalysisSection';
import api from '@/lib/api';
import CoursesSection, { CertificateRecommendation } from '@/components/analysis/CoursesSection';
import ResumeRatingSection from '@/components/analysis/ResumeRatingSection';
import ResumeTipsSection from '@/components/analysis/ResumeTipsSection';
import SkillsSection from '@/components/analysis/SkillsSection';

interface ResumeData {
  id: number;
  file: string;
  file_name: string;
  file_type: string;
  text: string;
  ai_feedback: {
    score: number;
    match_strength: string;
    found_skills: string[];
    missing_skills: string[];
    strengths: string[];
    weaknesses: string[];
    suggested_actions: string[];
    certificate_recommendations : CertificateRecommendation[];
    extracted_data: {
      skills: Array<{
        id: number;
        name: string;
      }>;
      education: string[];
      certificates: string[];
      experience: string[];
      summary: string;
    };
    job_role_recommendations?: Array<{
      job_role: {
        id: number;
        title: string;
        category: string;
        category_display: string;
        description: string;
        is_in_demand: boolean;
        remote_friendly: boolean;
      };
      match_score: number;
      match_strength: string;
      matching_skills: string[];
      missing_skills: string[];
      total_skills_required: number;
      skills_match_percentage: number;
      certificate_recommendations?: Array<{
        certificate_name: string;
        provider: string;
        reason: string;
        relevance_score: number;
        skills_covered: string[];
        estimated_duration: string;
        difficulty_level: string;
        provider_info: {
          id: number;
          name: string;
          issuer_name: string;
          issuer_type: string;
          website: string;
          is_popular: boolean;
        };
      }>;
    }>;
  };
  uploaded_at: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

export default function ResumeAnalysis() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courseCount, setCourseCount] = useState<number>(3);

  const fetchResumeAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/resumes/latest/');
      
      if (response.data?.resume) {
        setResumeData(response.data.resume);
      } else {
        setError("No resume analysis available. Please upload your resume first.");
      }
    } catch (err: any) {
      console.error("Error fetching resume analysis:", err);
      if (err.response?.status === 404) {
        setError("No resume found. Please upload your resume to get analysis.");
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load resume analysis';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadResume = () => {
    router.push('/upload');
  };

  const handleAddSkills = () => {
    router.push('/profile');
  };

  const handleAddCertificates = () => {
    router.push('/profile/edit');
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'GRADUATE') {
      setError("Access Denied. This feature is for graduates only.");
      setIsLoading(false);
      return;
    }

    fetchResumeAnalysis();
  }, [user, router]);

  if (!user) {
    return <ResumeAnalysisLoading />;
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Resume Analysis">
        <ResumeAnalysisLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Resume Analysis">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resume Analysis</h1>
          <p className="text-sm text-gray-600 mt-1">
            Get insights and recommendations to improve your resume
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => router.push('/profile')}>
          Back to Profile
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <ResumeAnalysisError 
          message={error} 
          onRetry={fetchResumeAnalysis}
          onUpload={handleUploadResume}
        />
      )}

      {/* Main Content */}
      {!error && resumeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SkillsSection 
              skillsDetected={resumeData.ai_feedback.found_skills}
              missingSkills={resumeData.ai_feedback.missing_skills}
              onAddSkills={handleAddSkills}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ResumeRatingSection 
              score={resumeData.ai_feedback.score}
              matchStrength={resumeData.ai_feedback.match_strength}
              fileName={resumeData.file_name}
              uploadedAt={resumeData.uploaded_at}
              onUpload={handleUploadResume}
              strengths={resumeData.ai_feedback.strengths}
              weaknesses={resumeData.ai_feedback.weaknesses}
            />
            {/* <CoursesSection 
              jobRoleRecommendations={resumeData.ai_feedback.certificate_recommendations || []}
              courseCount={courseCount}
              onCourseCountChange={setCourseCount}
            /> */}
            <ResumeTipsSection 
              onAddCertificates={handleAddCertificates}
              suggestedActions={resumeData.ai_feedback.suggested_actions}
            />
          </div>
        </div>
      )}

      {/* No Data State */}
      {!error && !resumeData && !isLoading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resume Analysis Available</h3>
            <p className="text-gray-500 mb-6">
              Upload your resume to get personalized analysis and recommendations.
            </p>
            <Button variant="primary" onClick={handleUploadResume}>
              Upload Your Resume
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}