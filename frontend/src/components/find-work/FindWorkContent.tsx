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
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      selectedSkills.forEach((skill) => params.append('skill', skill));
      params.append('sort', sortOption);

      const response = await api.get<Job[]>(`/jobs/?${params.toString()}`);

      if (response.data && Array.isArray(response.data)) {
        setJobs(response.data);
        if (response.data.length > 0 && !selectedJob) {
          setSelectedJob(response.data[0]);
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
    openApplyModal();
  };

  const handleApplicationSuccess = (shortLetter: string) => {
    console.log('Application submitted successfully!', shortLetter);
    setApplicationSuccess(true);
    router.push('/jobs');
  };

  const openApplyModal = () => setIsApplyModalOpen(true);
  const closeApplyModal = () => setIsApplyModalOpen(false);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedSkills, sortOption]);

  if (isLoading) return <FindWorkLoading />;
  if (error) return <FindWorkError message={error} onRetry={fetchJobs} />;

  return (
    <>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobList
            jobs={jobs}
            selectedJob={selectedJob}
            onSelectJob={handleSelectJob}
          />
        </div>
        
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
        />
      )}
    </>
  );
}