// src/app/candidates/[id]/cv/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // Adjust path if needed
import Button from '@/components/Button'; // Adjust path if needed
import Link from 'next/link';
import  api  from '@/lib/api';
import { ResumeFeedback } from '@/types'; // Assuming you have this interface

// Define the shape of the CV/Resume data object based on your Django model and processing
interface ResumeData {
  id: number;
  file_url: string; // URL to the original uploaded file (PDF/DOCX)
  uploaded_at: string; // ISO date string
  // Add fields for processed data if stored separately
  feedback?: ResumeFeedback | null; // The AI feedback object
  score?: number | null; // Overall score (if pre-calculated and stored)
  // Add other fields as needed (e.g., extracted text preview?)
}

export default function ViewCV() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams(); // To get the dynamic [id] parameter (candidate ID)
  const candidateId = Number(params.id); // Convert to number

  // State for managing UI (e.g., loading, resume data, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch resume data
  const fetchResumeData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch resume details using the candidate ID from the URL
      // Adjust the endpoint based on your Django API design
      // This might be something like `/api/candidates/{id}/resume/`
      // or `/api/resumes/?candidate_id={id}`
      const resumeResponse = await api.get<ResumeData>(`/candidates/${candidateId}/resume/`);

      if (resumeResponse.data) {
        setResumeData(resumeResponse.data);
      } else {
        console.error("API response format for resume is unexpected:", resumeResponse.data);
        setError("Failed to load CV details: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching resume data:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load CV details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component mounts or when the candidate ID changes
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Check if the user is a recruiter before fetching resume details
    if (user.role !== 'RECRUITER') {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    if (!isNaN(candidateId)) {
      fetchResumeData();
    } else {
      setError("Invalid Candidate ID");
      setIsLoading(false);
    }
  }, [user, router, candidateId]); // Dependency array: re-run if user, router, or candidateId changes

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  // --- Helper function to determine feedback color ---
  const getFeedbackColor = (feedbackItem: string): string => {
    if (feedbackItem.toLowerCase().includes("add")) return "text-blue-600";
    if (feedbackItem.toLowerCase().includes("improve") || feedbackItem.toLowerCase().includes("expand")) return "text-yellow-600";
    if (feedbackItem.toLowerCase().includes("great") || feedbackItem.toLowerCase().includes("good")) return "text-green-600";
    return "text-gray-700"; // Default
  };

  // --- Helper function to determine skill badge color ---
  const getSkillBadgeColor = (detected: boolean): string => {
    return detected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <DashboardLayout pageTitle="View Candidate CV">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">View Candidate CV</h1>
        <Button variant="secondary" size="md" onClick={() => router.back()}>
          Back to Profile
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchResumeData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading CV...</p>
      ) : !resumeData ? (
        <p className="text-center text-gray-700">No CV data found for this candidate.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - CV Viewer */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Uploaded CV</h2>
            {/* Embed the PDF using an iframe or object tag */}
            {/* Ensure the file_url is a direct link to the PDF served by your Django backend */}
            {resumeData.file_url ? (
              <iframe
                src={resumeData.file_url}
                title="Candidate CV"
                width="100%"
                height="600px" // Adjust height as needed
                className="border border-gray-300 rounded-md"
              >
                <p>Your browser does not support PDF viewing. <a href={resumeData.file_url}>Download the PDF</a>.</p>
              </iframe>
            ) : (
              <p className="text-gray-500">CV file URL is missing.</p>
            )}
          </div>

          {/* Right Column - AI Feedback */}
          <div className="lg:col-span-1 space-y-6">
            {/* Score Widget */}
            {resumeData.score !== null && resumeData.score !== undefined && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Overall Score</h3>
                <div className="text-3xl font-bold text-center text-indigo-700">
                  {resumeData.score}<span className="text-lg">/100</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">AI-Powered Evaluation</p>
              </div>
            )}

            {/* Feedback Section */}
            {resumeData.feedback ? (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">AI Feedback</h3>

                {/* Skills Detected */}
                {resumeData.feedback.skills_detected && resumeData.feedback.skills_detected.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Skills Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.feedback.skills_detected.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${getSkillBadgeColor(true)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {resumeData.feedback.missing_skills && resumeData.feedback.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.feedback.missing_skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${getSkillBadgeColor(false)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Points */}
                {resumeData.feedback.feedback && resumeData.feedback.feedback.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Suggestions</h4>
                    <ul className="space-y-2">
                      {resumeData.feedback.feedback.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className={getFeedbackColor(point)}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">AI Feedback</h3>
                <p className="text-sm text-gray-500">No AI feedback available for this CV yet.</p>
                {/* Optionally, add a button to trigger feedback generation if it's a manual process */}
                {/* <Button variant="primary" size="sm" className="mt-2">Generate Feedback</Button> */}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}