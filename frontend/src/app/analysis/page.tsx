// src/app/analysis/page.tsx
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
import CoursesSection from '@/components/analysis/CoursesSection';
import ResumeRatingSection from '@/components/analysis/ResumeRatingSection';
import ResumeTipsSection from '@/components/analysis/ResumeTipsSection';
import SkillsSection from '@/components/analysis/SkillsSection';


interface ResumeData {
  score: number;
  total_score: number;
  file_name?: string;
  uploaded_at?: string;
  job_matches?: Array<{
    id: number;
    title: string;
    company: string;
    match_score: number;
  }>;
  skills_detected?: string[];
  missing_skills?: string[];
  course_recommendations?: Array<{
    id: number;
    name: string;
    url: string;
    platform: string;
  }>;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
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
      const analysisResponse = await api.get('/resumes/analysis/');
      
      if (analysisResponse.data) {
        setResumeData(analysisResponse.data);
      } else {
        setError("Failed to load resume analysis: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching resume analysis:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load resume analysis';
      setError(errorMessage);
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
            <BasicInfoSection user={resumeData.user} />
            <JobAnalysisSection jobMatches={resumeData.job_matches} />
            <SkillsSection 
              skillsDetected={resumeData.skills_detected}
              missingSkills={resumeData.missing_skills}
              onAddSkills={handleAddSkills}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ResumeRatingSection 
              score={resumeData.score}
              totalScore={resumeData.total_score}
              fileName={resumeData.file_name}
              uploadedAt={resumeData.uploaded_at}
              onUpload={handleUploadResume}
            />
            <CoursesSection 
              recommendations={resumeData.course_recommendations}
              courseCount={courseCount}
              onCourseCountChange={setCourseCount}
            />
            <ResumeTipsSection onAddCertificates={handleAddCertificates} />
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