
'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import  api  from '@/lib/api'; 

// Define the shape of the Report Summary object based on your Django model/API
interface ReportSummary {
  total_jobs_posted: number;
  total_applications_received: number;
  total_views: number; // If tracked per job
  successful_hires?: number; // If tracked
  // Add other summary fields as needed by your backend
}

// Define the shape of an Application object (for the recent applications list)
interface Application {
  id: number;
  job_id: number; // Link back to the job
  job_title: string; // Name of the job applied for
  applicant_name: string; // Name of the applicant
  applicant_email: string; // Email of the applicant
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'; // Example statuses
  applied_date: string; // e.g., '2024-05-21T10:30:00Z' - ISO string from backend
  // Add other fields as needed based on your Django model
}

export default function Reports() {
  const { user } = useAuth(); // Get the logged-in user
  const router = useRouter(); // For programmatic navigation

  // State for managing UI (e.g., loading, report data, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch report data from the backend
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching

    try {
      // Fetch summary data
      // Assuming your Django backend has an endpoint like /api/reports/summary/
      // or a similar endpoint that aggregates stats for the current user.
      const summaryResponse = await api.get('/reports/summary/'); // Replace with your actual endpoint

      if (summaryResponse.data) {
        setSummary(summaryResponse.data);
      } else {
        console.error("API response format for summary is unexpected:", summaryResponse.data);
        setError("Failed to load report summary: Unexpected response format.");
      }

      // Fetch recent applications
      // Assuming your Django backend has an endpoint like /api/applications/recent/?limit=10
      // or a similar endpoint that returns applications for jobs posted by the current user.
      const applicationsResponse = await api.get('/applications/recent/?limit=10'); // Replace with your actual endpoint

      if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
        setRecentApplications(applicationsResponse.data);
      } else {
        console.error("API response format for applications is unexpected:", applicationsResponse.data);
        setError("Failed to load recent applications: Unexpected response format.");
      }
    } catch (err: any) {
        console.error("Error fetching report data:", err);
        // Try to get a user-friendly error message from the response
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load reports';
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

    // Check if the user is a recruiter before fetching reports
    if (user.role !== 'RECRUITER') {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    fetchReportData(); // Call the fetch function
  }, [user, router]); // Dependency array: re-run if user changes

  if (!user) {
    // Redirect handled in useEffect, but render loading state initially
    return <p>Loading...</p>;
  }

  // Render the layout and pass the page content as children
  return (
    <DashboardLayout pageTitle="Reports">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        {/* You might add export buttons here later */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchReportData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Report Content */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800">Total Jobs Posted</h2>
                <p className="text-2xl font-bold text-blue-900">{summary.total_jobs_posted}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-800">Total Applications</h2>
                <p className="text-2xl font-bold text-purple-900">{summary.total_applications_received}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-orange-800">Total Views</h2>
                <p className="text-2xl font-bold text-orange-900">{summary.total_views || 0}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-indigo-800">Successful Hires</h2>
                <p className="text-2xl font-bold text-indigo-900">{summary.successful_hires || 0}</p>
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Applications</h2>
            {recentApplications.length === 0 ? (
              <p className="text-gray-700">No recent applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Applicant</th>
                      <th className="py-2 px-4 border-b text-left">Job Applied For</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                      <th className="py-2 px-4 border-b text-left">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{application.applicant_name}</td>
                        <td className="py-2 px-4 border-b">{application.job_title}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            application.status === 'hired' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">{new Date(application.applied_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Placeholder for other potential charts/graphs */}
          {/* <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Trends (Last 30 Days)</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-gray-700">[Chart would go here]</p>
            </div>
          </section> */}
        </div>
      )}
    </DashboardLayout>
  );
}