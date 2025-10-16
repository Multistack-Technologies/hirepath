'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import  api  from '@/lib/api';
import { UserProfile } from '@/types';
import Image from 'next/image';

interface JobApplication {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired'; // Example statuses
  applied_date: string; // e.g., '2024-05-21T10:30:00Z'
  // Add other fields as needed
}

export default function CandidateProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams(); // To get the dynamic [id] parameter
  const searchParams = useSearchParams(); // To get query parameters like jobId
  const candidateId = Number(params.id); // Convert to number
  const jobIdFromQuery = searchParams.get('jobId'); // Get jobId from query param

  // State for managing UI (e.g., loading, candidate data, applications, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [candidate, setCandidate] = useState<UserProfile | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch candidate details
  const fetchCandidateDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch candidate details using the candidate ID from the URL
      const candidateResponse = await api.get<UserProfile>(`/candidates/${candidateId}/`);

      if (candidateResponse.data) {
        setCandidate(candidateResponse.data);
      } else {
        console.error("API response format for candidate is unexpected:", candidateResponse.data);
        setError("Failed to load candidate details: Unexpected response format.");
      }

      // Fetch job applications for this specific candidate
      // Adjust endpoint and data structure based on your Django API
      const applicationsResponse = await api.get<{ results: JobApplication[] }>(`/candidates/${candidateId}/applications/`);

      if (applicationsResponse.data && Array.isArray(applicationsResponse.data.results)) {
        setJobApplications(applicationsResponse.data.results);
      } else {
        console.error("API response format for applications is unexpected:", applicationsResponse.data);
        setError("Failed to load job applications: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching candidate details or applications:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load candidate details';
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

    // Check if the user is a recruiter before fetching candidate details
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
  }, [user, router, candidateId]); // Dependency array: re-run if user, router, or candidateId changes

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  // Placeholder functions for Shortlist and Reject actions
  // These should make API calls to update the application status
  const handleShortlist = async (applicationId: number) => {
    console.log(`Shortlisting application ${applicationId}`);
    try {
      // Make API call to update application status to 'shortlisted'
      // Example: await api.patch(`/applications/${applicationId}/`, { status: 'shortlisted' });
      // After successful update, you might want to refetch the candidate details or update the local state
      // For now, just simulate success
      alert(`Application ${applicationId} shortlisted!`); // Replace with actual logic/UI update
    } catch (err) {
      console.error("Error shortlisting application:", err);
      alert("Failed to shortlist application. Please try again."); // Replace with actual error handling
    }
  };

  const handleReject = async (applicationId: number) => {
    console.log(`Rejecting application ${applicationId}`);
    try {
      // Make API call to update application status to 'rejected'
      // Example: await api.patch(`/applications/${applicationId}/`, { status: 'rejected' });
      // After successful update, you might want to refetch the candidate details or update the local state
      // For now, just simulate success
      alert(`Application ${applicationId} rejected!`); // Replace with actual logic/UI update
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Failed to reject application. Please try again."); // Replace with actual error handling
    }
  };

  // Render the layout and pass the page content as children
  return (
    <DashboardLayout pageTitle="Candidate Profile">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidate Profile</h1>
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
            onClick={fetchCandidateDetails}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Candidate Profile Section */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading candidate profile...</p>
      ) : (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-purple-700">Personal Info</h2>
                <div className="flex items-start mt-4">
                  <Image height={40}
                  width={40}
                    src={candidate?.avatarUrl || "https://via.placeholder.com/40"} // Use candidate's avatar or placeholder
                    alt={candidate?.first_name || "Candidate"}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{candidate?.first_name} {candidate?.last_name}</h3>
                    <p className="text-sm text-gray-700">{candidate?.bio || "No bio available."}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Name</p>
                    <p className="text-sm text-gray-900">{candidate?.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Surname</p>
                    <p className="text-sm text-gray-900">{candidate?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{candidate?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{candidate?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-end">
                <Button variant="primary" size="md" onClick={() => router.push(`/upload/${candidateId}`)}> {/* Adjust route if needed */}
                  VIEW CV
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Job Applications Section */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading job applications...</p>
      ) : (
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Job Applications</h2>
          {jobApplications.length === 0 ? (
            <p className="text-gray-700">This candidate has not applied to any jobs yet.</p>
          ) : (
            <div className="space-y-4">
              {jobApplications.map((app) => (
                <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.job_title}</h3>
                      <p className="text-sm text-gray-700">{app.company_name}</p>
                      {/* Display application status */}
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <span className={`font-medium ${
                          app.status === 'shortlisted' ? 'text-green-600' :
                          app.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                      </p>
                      {/* Highlight the job if it matches the jobId from the query param */}
                      {jobIdFromQuery && parseInt(jobIdFromQuery) === app.job_id && (
                        <p className="text-xs text-blue-500 mt-1">(Viewing from Job ID: {jobIdFromQuery})</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {/* Show buttons based on current status */}
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleShortlist(app.id)}
                            className="px-4 py-2 rounded-md text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                          >
                            SHORTLIST
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-4 py-2 rounded-md text-sm bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            REJECT
                          </button>
                        </>
                      )}
                      {app.status === 'shortlisted' && (
                        <button
                          onClick={() => handleReject(app.id)} // Allow un-shortlisting/rejection
                          className="px-4 py-2 rounded-md text-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          REJECT
                        </button>
                      )}
                      {app.status === 'rejected' && (
                        <button
                          onClick={() => handleShortlist(app.id)} // Allow un-rejection/shortlisting
                          className="px-4 py-2 rounded-md text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        >
                          SHORTLIST
                        </button>
                      )}
                      {/* Add a "VIEW JOB" button to go back to the job details page */}
                      <button
                        onClick={() => router.push(`/jobs/${app.job_id}`)}
                        className="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        VIEW JOB
                      </button>
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