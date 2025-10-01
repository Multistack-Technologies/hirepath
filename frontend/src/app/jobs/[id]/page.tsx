'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link'; // Import Link for navigation
import  api  from '@/lib/api';
import { Job } from '@/types'; // Assuming you have this interface defined

// Define the shape of an Application/Candidate object based on your Django model
interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  avatarUrl?: string; // URL for the candidate's profile picture
  location: string; // e.g., "Menlo Park, CA | Seattle"
  applied_date: string; // e.g., "3 days ago" or ISO date string
  match_score?: number; // e.g., 9
  total_requirements?: number; // e.g., 12
  // Add other fields as needed
}

export default function JobDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams(); // To get the dynamic [id] parameter
  const jobId = Number(params.id); // Convert to number

  // State for managing UI (e.g., loading, job data, candidates, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch job details
  const fetchJobDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch job details using the job ID from the URL
      const jobResponse = await api.get<Job>(`/jobs/${jobId}/`);

      if (jobResponse.data) {
        setJob(jobResponse.data);
      } else {
        console.error("API response format for job is unexpected:", jobResponse.data);
        setError("Failed to load job details: Unexpected response format.");
      }

      // Fetch candidates (applications) for this specific job
      // Adjust endpoint and data structure based on your Django API
      const applicationsResponse = await api.get<{ results: any[] }>(`/jobs/${jobId}/applications/`);

      if (applicationsResponse.data && Array.isArray(applicationsResponse.data.results)) {
        // Extract candidate info from the applications
        const candidateList = applicationsResponse.data.results.map(app => ({
          id: app.candidate.id, // Assuming the application has a nested candidate object
          first_name: app.candidate.first_name,
          last_name: app.candidate.last_name,
          avatarUrl: app.candidate.avatarUrl || "https://via.placeholder.com/40", // Fallback
          location: app.candidate.location || "N/A",
          applied_date: formatDate(app.applied_date) || "Unknown", // Format this date as needed
          match_score: app.match_score || 0, // Example score from backend
          total_requirements: app.total_requirements || 0, // Example total from backend
          // Add other fields as needed
        }));
        setCandidates(candidateList);
      } else {
        console.error("API response format for applications is unexpected:", applicationsResponse.data);
        setError("Failed to load candidates: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching job details or candidates:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load job details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date (implement as needed)
  const formatDate = (dateString: string): string => {
    // Implement date formatting logic (e.g., convert ISO date to "X days ago")
    // For now, return the original string or a formatted version
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    // Add more formatting logic for weeks, months, etc. if needed
    return dateString; // Fallback to original string
  };

  // Fetch data when the component mounts or when the job ID changes
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Check if the user is a recruiter before fetching job details
    if (user.role !== 'RECRUITER') {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    if (!isNaN(jobId)) {
      fetchJobDetails();
    } else {
      setError("Invalid Job ID");
      setIsLoading(false);
    }
  }, [user, router, jobId]); // Dependency array: re-run if user, router, or jobId changes

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  // Render the layout and pass the page content as children
  return (
    <DashboardLayout pageTitle="Job Details">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Details</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/jobs')}>
          Back to My Jobs
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchJobDetails}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Job Details Section */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading job details...</p>
      ) : (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Title, Location, Description */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-purple-700">Title</h2>
                <p className="text-lg font-bold text-gray-900">{job?.title || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-purple-700">Location</h2>
                <p className="text-lg text-gray-900">{job?.location || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-purple-700">Description</h2>
                <p className="text-lg text-gray-900">{job?.description || 'No description available.'}</p>
              </div>
            </div>
            {/* Right Column - Requirements */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {job?.requirementIds && job.requirementIds.length > 0 ? (
                  job.requirementIds.map((reqId) => (
                    <span key={reqId} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                      {/* You'll need a helper function or context to get skill name from ID */}
                      {/* For now, just display the ID or a placeholder */}
                      Skill ID: {reqId} {/* Replace with getSkillName(reqId) */}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No requirements specified.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Candidates Section */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading candidates...</p>
      ) : (
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Candidates</h2>
          {candidates.length === 0 ? (
            <p className="text-gray-700">No candidates have applied to this job yet.</p>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex items-start">
                    <img
                      src={candidate.avatarUrl}
                      alt={`${candidate.first_name} ${candidate.last_name}`}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* Make the candidate's name a link to their profile page */}
                          {/* Pass the jobId as a query parameter so the candidate profile knows which job context */}
                          <Link
                            href={{
                              pathname: `/candidates/${candidate.id}`,
                              query: { jobId: jobId.toString() } // Pass jobId for context
                            }}
                            className="font-bold text-gray-900 hover:text-indigo-600"
                          >
                            {candidate.first_name} {candidate.last_name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                            <span>📍 {candidate.location}</span>
                            <span>•</span>
                            <span>{candidate.applied_date}</span>
                            {/* Display match score if available */}
                            {candidate.match_score !== undefined && candidate.total_requirements !== undefined && (
                              <>
                                <span>•</span>
                                <span>Matches {candidate.match_score}/{candidate.total_requirements} requirement</span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Optional: Add buttons for actions like View Profile, Shortlist, Reject */}
                        {/* These actions might be better placed on the candidate profile page */}
                        {/* <div className="ml-4 text-right">
                          <button
                            onClick={() => router.push(`/profile/${candidate.id}`)} // Navigate to candidate's profile
                            className="bg-blue-100 text-blue-700 p-1 rounded-full hover:bg-blue-200"
                            aria-label={`View profile of ${candidate.first_name} ${candidate.last_name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.036 7.235 7.373 3.5 12 3.5c4.627 0 8.964 3.735 9.542 8.5.528 4.369 2.964 8.073 6.14 9.733.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686......" />
                            </svg>
                          </button>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}