// src/app/analysis/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import api from '@/lib/api';
import { UserProfile } from '@/types';

export default function ResumeAnalysis() {
  const { user } = useAuth();
  const router = useRouter();

  // State for managing UI (e.g., loading, resume data, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resumeData, setResumeData] = useState<any | null>(null); // Replace 'any' with a specific type if defined
  const [error, setError] = useState<string | null>(null);

  const fetchResumeAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch resume analysis data for the current user
      // Assuming your Django backend has an endpoint like /api/resumes/analysis/
      const analysisResponse = await api.get('/resumes/analysis/');

      if (analysisResponse.data) {
        setResumeData(analysisResponse.data);
      } else {
        console.error("API response format for resume analysis is unexpected:", analysisResponse.data);
        setError("Failed to load resume analysis: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching resume analysis:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load resume analysis';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component mounts or when the user changes
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
     // router.push('/login');
      return;
    }

    // Check if the user is a graduate before fetching resume analysis
    if (user.role !== 'GRADUATE') {
      setError("Access Denied. This feature is for graduates only.");
      setIsLoading(false);
      return;
    }

    fetchResumeAnalysis();
  }, [user, router]);

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout pageTitle="Resume Analysis">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resume Analysis</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/profile')}>
          Back to Profile
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchResumeAnalysis}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading resume analysis...</p>
      ) : !resumeData ? (
        <p className="text-center text-gray-700">No resume analysis available. Please upload your CV first.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info, Job Analysis, Skills */}
          <div className="space-y-6">
            {/* Your Basic Info Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Your Basic Info</h2>
              <div className="mb-4">
                {/* <p className="text-sm"><strong>Name:</strong> {resumeData.user.first_name} {resumeData.user.last_name}</p>
                <p className="text-sm"><strong>Email:</strong> {resumeData.user.email}</p> */}
              </div>
            </div>

            {/* Job Analysis Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Job Analysis</h2>
              <p className="text-sm text-gray-700 mb-3">Our analysis matches you to these jobs:</p>
              <div className="space-y-2">
                {resumeData.job_matches && resumeData.job_matches.length > 0 ? (
                  resumeData.job_matches.map((job: any, index: number) => (
                    <div key={index} className="bg-indigo-100 p-3 rounded-md flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-medium text-indigo-800">{job.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No job matches found.</p>
                )}
              </div>
            </div>

            {/* Skills Recommendation Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-orange-700">Skills Recommendation</h2>
                <Button variant="primary" size="sm" onClick={() => router.push('/profile/edit')}>
                  Add Skills
                </Button>
              </div>
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills_detected && resumeData.skills_detected.length > 0 ? (
                    resumeData.skills_detected.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          aria-label={`Remove ${skill}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )} 
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Recommended Skills for You</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.missing_skills && resumeData.missing_skills.length > 0 ? (
                    resumeData.missing_skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recommended skills available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Resume Rating, Recommendations, Tips */}
          <div className="space-y-6">
            {/* Resume Rating Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Resume Rating</h2>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-indigo-700">
                  {resumeData.score}<span className="text-lg">/{resumeData.total_score || 10}</span>
                </p>
              </div>
              <div className="text-sm text-gray-700 mb-4">
                <p><strong>File name:</strong> {resumeData.file_name || 'N/A'}</p>
                <p><strong>Date Uploaded:</strong> {resumeData.uploaded_at || 'N/A'}</p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push('/upload')}
                className="w-full"
              >
                UPLOAD NEW RESUME
              </Button>
            </div>

            {/* Courses & Certificates Recommendations Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Courses & Certificates Recommendations</h2>
              <div className="mb-4">
                <label htmlFor="courseCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Choose Number of Course Recommendations:
                </label>
                <input
                  id="courseCount"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="1"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                {resumeData.course_recommendations && resumeData.course_recommendations.length > 0 ? (
                  resumeData.course_recommendations.map((course: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <span className="text-sm text-gray-500 mr-2">({index + 1})</span>
                      <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {course.name}
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No course recommendations available.</p>
                )}
              </div>
            </div>

            {/* Resume Writing Tips & Ideas Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Resume Writing Tips & Ideas</h2>
              <div className="mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 5.656l3 3a4 4 0 005.656 5.656l1.5-1.5a4 4 0 004-4v-4a4 4 0 00-4-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium text-gray-800">#10 Resume writing tips 2024</span>
                </div>
              </div>
              <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full"
                    aria-label="Play video"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.264a1 1 0 001.654.94l3.197-2.132a1 1 0 000-1.612z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="secondary" size="md" onClick={() => router.push('/profile/edit')}>
                  Add certificates
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}