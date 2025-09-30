// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; // Import the layout
import StatWidget from '@/components/StatWidget'; // Your existing StatWidget
import CandidateCard from '@/components/CandidateCard'; // Your existing CandidateCard if applicable
import Button from '@/components/Button'; // Your existing Button

// Mock data
const mockCandidates = [
  { id: 1, name: 'Arthizane', jobTitle: 'Junior Backend', location: 'Menlo Park, CA | Seattle', postedAgo: '3 days ago', matchScore: '9/12' },
  { id: 2, name: 'John Doe', jobTitle: 'Senior Frontend', location: 'Cape Town, SA', postedAgo: '1 day ago', matchScore: '11/12' },
  { id: 3, name: 'Jane Smith', jobTitle: 'DevOps Engineer', location: 'Johannesburg, SA', postedAgo: '5 days ago', matchScore: '8/12' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState(mockCandidates);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [user, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  // Render the layout and pass the page content as children
  return (
    <DashboardLayout pageTitle="Dashboard"> {/* Pass only the page title */}
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatWidget title="Total Jobs" value={24} color="blue" />
        <StatWidget title="Active Applications" value={156} color="purple" />
        <StatWidget title="Shortlisted" value={32} color="orange" />
        <StatWidget title="Hired" value={8} color="indigo" />
      </div>

      {/* Candidates Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Candidates</h2>
        {isLoading ? (
          <p className="text-center text-gray-500">Loading candidates...</p>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                name={candidate.name}
                jobTitle={candidate.jobTitle}
                location={candidate.location}
                postedAgo={candidate.postedAgo}
                matchScore={candidate.matchScore}
                onViewProfileClick={() => console.log(`View profile for ${candidate.name}`)}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}