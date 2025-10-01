
'use client'; 

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import Button from '@/components/Button'; 
import Link from 'next/link'; 
import  api  from '@/lib/api';

interface Job {
  id: number;
  title: string; 
  company: string; 
  location: string; 
  posted_date: string; 
  employment_type: string; 
  applications_count: number;
  views_count: number; 
  salary?: string; 
  description: string; 
  requirements: string[]; 
}

export default function MyJobs() {
  const { user } = useAuth(); 
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null); 

    try {
      
      const response = await api.get('/jobs/me');

      if (response.data && Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
      
        console.error("API response format for jobs is unexpected:", response.data);
        setError("Failed to load jobs: Unexpected response format.");
      }
    } catch (err: any) {
        console.error("Error fetching jobs:", err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load jobs';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
 
      router.push('/login');
      return;
    }

   
    if (user.role !== 'RECRUITER') {
      setError("Access Denied. Recruiters only.");
      setIsLoading(false);
      return;
    }

    fetchJobs(); 
  }, [user, router]); 

  if (!user) {
    return <p>Loading...</p>;
  }

  const handlePostNewVacancy = () => {
    router.push('/jobs/post');
  };

  const handleEditJob = (jobId: number) => {
    // Navigate to edit job page
    router.push(`/jobs/edit/${jobId}`);
  };

  const handleViewApplications = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <DashboardLayout pageTitle="My Jobs">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
        <Button variant="primary" size="md" onClick={handlePostNewVacancy}>
          POST NEW VACANCY
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={fetchJobs}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Job Listings */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700">You haven't posted any jobs yet.</p>
          <Button variant="primary" size="md" onClick={handlePostNewVacancy} className="mt-4">
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-start">
                {/* You might want to fetch and display a company logo here if available in the job object or user profile */}
                {/* <img
                  src={job.logoUrl || user.companyLogoUrl || 'https://via.placeholder.com/40'} // Fallback to placeholder
                  alt={job.company}
                  className="w-10 h-10 rounded-full mr-4"
                /> */}
                {/* For now, use a placeholder or the user's avatar */}
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-4" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{job.company}</h3>
                      <p className="text-sm text-gray-700">{job.title}</p>
                      <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span>{job.views_count || 0} views</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                        {/* Format the date if needed */}
                        <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{job.employment_type}</span>
                        <span>•</span>
                        <span>{job.applications_count || 0} applied</span>
                      </div>
                      {/* Optionally display a snippet of the description */}
                      {/* <p className="text-xs text-gray-600 mt-1 truncate">{job.description.substring(0, 100)}...</p> */}
                    </div>
                    <div className="ml-4 text-right">
                      {/* You might have a 'team' field in your job model, otherwise omit */}
                      {/* <div className="text-xs text-gray-500">Team</div>
                      <div className="font-medium text-gray-900">{job.team}</div> */}
                      {job.salary && (
                        <div className="text-sm text-blue-600 font-semibold">{job.salary}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewApplications(job.id)}
                    className="bg-gray-100 text-gray-700 p-1 rounded-full hover:bg-gray-200"
                    aria-label={`View applications for ${job.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.036 7.235 7.373 3.5 12 3.5c4.627 0 8.964 3.735 9.542 8.5.528 4.369 2.964 8.073 6.14 9.733.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686.488 1.029.732.343.244.686......." />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditJob(job.id)}
                    className="bg-gray-100 text-gray-700 p-1 rounded-full hover:bg-gray-200"
                    aria-label={`Edit job ${job.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}