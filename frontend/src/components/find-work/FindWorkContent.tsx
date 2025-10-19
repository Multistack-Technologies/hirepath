// components/find-work/FindWorkContent.tsx
import { useState, useEffect } from 'react';
import { Job } from '@/types';
import api from '@/lib/api';
import ApplyPopupModal from '@/components/ApplyPopupModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import FindWorkError from './FindWorkError';
import FindWorkLoading from './FindWorkLoading';
import JobDetail from './JobDetail';
import JobList from './JobList';
import SearchFilters from './SearchFilters';

export default function FindWorkContent() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Job[]>('/jobs/active/');
      
      if (response.data && Array.isArray(response.data)) {
        const jobsData = response.data;
        setJobs(jobsData);
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }
      } else {
        setError('Failed to load jobs: Unexpected response format.');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handleApply = (jobId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    openApplyModal();
  };

  const handleApplicationSuccess = (shortLetter: string) => {
    console.log('Application submitted successfully!', shortLetter);
    setApplicationSuccess(true);
    setIsApplyModalOpen(false);
    // Refresh jobs to update application counts
    fetchJobs();
  };

  const openApplyModal = () => setIsApplyModalOpen(true);
  const closeApplyModal = () => setIsApplyModalOpen(false);

  // Filter jobs based on search and skills
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => 
        job.skills_required?.some(jobSkill => 
          jobSkill.name.toLowerCase().includes(skill.toLowerCase())
        )
      );
    
    return matchesSearch && matchesSkills;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  if (isLoading) return <FindWorkLoading />;
  if (error) return <FindWorkError message={error} onRetry={fetchJobs} />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
        <p className="text-gray-600 mt-2">Discover your next career opportunity</p>
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSkills={selectedSkills}
        onToggleSkill={(skill) => {
          if (selectedSkills.includes(skill)) {
            setSelectedSkills(prev => prev.filter(s => s !== skill));
          } else {
            setSelectedSkills(prev => [...prev, skill]);
          }
        }}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedSkills([]);
          setSortOption('newest');
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job List - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Available Jobs ({sortedJobs.length})
              </h2>
            </div>
            <JobList
              jobs={sortedJobs}
              selectedJob={selectedJob}
              onSelectJob={handleSelectJob}
            />
          </div>
        </div>
        
        {/* Job Detail - 1/3 width */}
        <div className="lg:col-span-1">
          <JobDetail
            job={selectedJob}
            onApply={handleApply}
          />
        </div>
      </div>

      {selectedJob && (
        <ApplyPopupModal
          isOpen={isApplyModalOpen}
          onClose={closeApplyModal}
          onApplySuccess={handleApplicationSuccess}
          userEmail={user?.email || ''}
          jobId={selectedJob.id}
          // jobTitle={selectedJob.title}
          // companyName={selectedJob.company_name}
        />
      )}
    </div>
  );
}