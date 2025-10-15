// src/app/applications/page.tsx
'use client'; // Mark as Client Component for interactivity

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import  api  from '@/lib/api';

// Define the shape of an Application object based on your API response
interface Application {
  id: number;
  job: number; // Job ID
  job_title: string;
  applicant: number; // Applicant ID (should match user.id)
  applicant_name: string; // This might be redundant if it's the logged-in user
  cover_letter: string | null;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'; // Match your Django model choices
  applied_at: string; // ISO date string
}

export default function MyApplications() {
  const { user } = useAuth(); // Get the logged-in user
  const router = useRouter(); // For navigation

  // State for managing UI (e.g., loading, applications data, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch applications data from the backend
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching

    try {
      // Fetch applications for the current user
      // Assuming your Django backend has an endpoint like /api/applications/my-applications/
      // or /api/applications/?applicant_id={user.id}
      const response = await api.get<Application[]>('/applications/mine/'); // Adjust endpoint as needed

      if (response.data && Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        console.error("API response format for applications is unexpected:", response.data);
        setError("Failed to load applications: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load applications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial render and when user changes (if needed)
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Check if the user is a graduate before fetching applications
    if (user.role !== 'GRADUATE') {
      setError("Access Denied. Graduates only.");
      setIsLoading(false);
      return;
    }

    fetchApplications(); // Call the fetch function
  }, [user, router]); // Dependency array: re-run if user changes

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  const handleViewJob = (jobId: number) => {
    // Navigate to the job details page (if you have one)
    router.push(`/jobs/${jobId}`);
  };

  const handleWithdrawApplication = (applicationId: number) => {
    // Implement withdrawal logic (e.g., DELETE request to backend)
    console.log(`Withdrawing application ${applicationId}`);
    alert(`Withdraw application ${applicationId}? (Not implemented yet)`);
    // Example API call:
    // api.delete(`/applications/${applicationId}/`)
    //   .then(() => {
    //     // Remove application from state or refetch list
    //     setApplications(prevApps => prevApps.filter(app => app.id !== applicationId));
    //   })
    //   .catch(err => {
    //     console.error("Withdraw error:", err);
    //     alert("Failed to withdraw application.");
    //   });
  };

  // Render the layout and pass the page content as children
  return (
    <DashboardLayout pageTitle="My Applications">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
        <Button variant="secondary" size="md" onClick={() => router.push('/jobs')}>
          Find Jobs
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchApplications}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Applications List */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700">You haven't applied to any jobs yet.</p>
          <Button variant="primary" size="md" onClick={() => router.push('/jobs')} className="mt-4">
            Browse IT Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{application.job_title}</h3>
                  <p className="text-sm text-gray-700">Applied by: {application.applicant_name}</p>
                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                    <span>Status: 
                      <span className={`ml-1 font-medium ${
                        application.status === 'PENDING' ? 'text-yellow-600' :
                        application.status === 'REVIEWED' ? 'text-blue-600' :
                        application.status === 'SHORTLISTED' ? 'text-green-600' :
                        application.status === 'REJECTED' ? 'text-red-600' :
                        application.status === 'HIRED' ? 'text-indigo-600' : 'text-gray-600'
                      }`}>
                        {application.status}
                      </span>
                    </span>
                    <span>•</span>
                    <span>Applied on: {new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                  {application.cover_letter && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">Cover Letter:</p>
                      <p className="text-sm text-gray-700 truncate max-w-md">{application.cover_letter}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewJob(application.job)}
                  >
                    View Job
                  </Button>
                  {application.status === 'PENDING' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleWithdrawApplication(application.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}