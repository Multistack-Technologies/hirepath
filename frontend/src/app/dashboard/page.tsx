
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import StatWidget from '@/components/StatWidget'; 
import CandidateCard from '@/components/CandidateCard'; 
import Button from '@/components/Button'; 
import Link from 'next/link'; 
import  api  from '@/lib/api'; 
import { Job, Application } from '@/types'; 
import JobCard from '@/components/JobCard';

// Define the shape of a Candidate object for recruiters
interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  avatarUrl?: string;
  location: string;
  applied_date: string; // e.g., "3 days ago" or ISO date string
  match_score: number; // AI-calculated match score
  match_details: {
    skills_matched: string[];
    skills_missing: string[];
    feedback: string[];
  };
  // Add other fields as needed
}




export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // State for managing UI (e.g., loading, data, errors)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for recruiter-specific data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [recruiterStats, setRecruiterStats] = useState({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  // State for graduate-specific data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [graduateStats, setGraduateStats] = useState({
    totalJobs: 0,
    activeApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  // Function to fetch recruiter dashboard data
  const fetchRecruiterData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch recruiter stats
      // Assuming your Django backend has an endpoint like /api/recruiter/stats/
      const statsResponse = await api.get('/recruiter/stats/'); // Replace with your actual endpoint
      if (statsResponse.data) {
        setRecruiterStats(statsResponse.data);
      }

      // Fetch candidates (applications) for the recruiter's jobs
      // Assuming your Django backend has an endpoint like /api/recruiter/candidates/
      const candidatesResponse = await api.get<{ results: Candidate[] }>('/recruiter/candidates/'); // Replace with your actual endpoint
      if (candidatesResponse.data && Array.isArray(candidatesResponse.data.results)) {
        setCandidates(candidatesResponse.data.results);
      } else {
        console.error("API response format for candidates is unexpected:", candidatesResponse.data);
        setError("Failed to load candidates: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching recruiter data:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load recruiter dashboard data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch graduate dashboard data
  const fetchGraduateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch graduate stats
      // Assuming your Django backend has an endpoint like /api/graduate/stats/
      const statsResponse = await api.get('/graduate/stats/'); // Replace with your actual endpoint
      if (statsResponse.data) {
        setGraduateStats(statsResponse.data);
      }

      // Fetch recommended jobs for the graduate
      // Assuming your Django backend has an endpoint like /api/graduate/jobs/
      const jobsResponse = await api.get<{ results: Job[] }>('/jobs/'); // Replace with your actual endpoint
      if (jobsResponse.data && Array.isArray(jobsResponse.data.results)) {
        setJobs(jobsResponse.data.results);
      } else {
        console.error("API response format for jobs is unexpected:", jobsResponse.data);
        setError("Failed to load jobs: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error fetching graduate data:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load graduate dashboard data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data based on user role
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'RECRUITER') {
      fetchRecruiterData();
    } else if (user.role === 'GRADUATE') {
      fetchGraduateData();
    } else {
      setError("Access Denied. Invalid user role.");
      setIsLoading(false);
    }
  }, [user, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  // --- Conditional Rendering Based on User Role ---
  const renderRecruiterDashboard = () => (
    <>
      {/* Stats Widgets for Recruiters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatWidget title="Total Jobs" value={recruiterStats.totalJobs} color="blue" />
        <StatWidget title="Active Applications" value={recruiterStats.activeApplications} color="purple" />
        <StatWidget title="Shortlisted" value={recruiterStats.shortlisted} color="orange" />
        <StatWidget title="Hired" value={recruiterStats.hired} color="indigo" />
      </div>

      {/* Candidates Section for Recruiters */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Top Candidates</h2>
          <Link href="/jobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Jobs
          </Link>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-500">Loading candidates...</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-700">No candidates have applied to your jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                name={`${candidate.first_name} ${candidate.last_name}`}
                jobTitle="" // Not applicable in this context, or could be the job title they applied for
                location={candidate.location}
                postedAgo={candidate.applied_date}
                matchScore={`${candidate.match_score}/100`} // Display match score out of 100
                onViewProfileClick={() => router.push(`/candidates/${candidate.id}`)} // Navigate to candidate profile
              />
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderGraduateDashboard = () => (
    <>
      {/* Stats Widgets for Graduates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatWidget title="Total Jobs" value={graduateStats.totalJobs} color="blue" />
        <StatWidget title="Active Applications" value={graduateStats.activeApplications} color="purple" />
        <StatWidget title="Shortlisted" value={graduateStats.shortlisted} color="orange" />
        <StatWidget title="Hired" value={graduateStats.hired} color="indigo" />
      </div>

      {/* Jobs Section for Graduates */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recommended Jobs</h2>
          <Link href="/jobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Jobs
          </Link>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-700">No jobs found. Check back later!</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job} // Pass the entire job object
                onApplyClick={() => router.push(`/jobs/${job.id}/apply`)} // Navigate to job application page
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
  // --- End Conditional Rendering ---

  return (
    <DashboardLayout pageTitle="Dashboard">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {/* Optionally, provide a retry button */}
          <button
            onClick={user.role === 'RECRUITER' ? fetchRecruiterData : fetchGraduateData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Render Dashboard Content Based on Role */}
      {user.role === 'RECRUITER' ? renderRecruiterDashboard() : renderGraduateDashboard()}
    </DashboardLayout>
  );
}