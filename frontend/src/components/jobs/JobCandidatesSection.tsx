// components/jobs/JobCandidatesSection.tsx
import { Candidate } from '@/types';
import CandidateCard from '@/components/CandidateCard';
import { useRouter } from 'next/navigation';

interface JobCandidatesSectionProps {
  candidates: Candidate[];
  jobId: number;
  isLoading?: boolean;
}

export default function JobCandidatesSection({ 
  candidates, 
  jobId, 
  isLoading = false 
}: JobCandidatesSectionProps) {
  const router = useRouter();

  const handleViewCandidate = (candidateId: number) => {
    router.push(`/recruiter/candidates/${candidateId}?job=${jobId}`);
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Candidates ({candidates.length})</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Candidates ({candidates.length})
        </h2>
        {candidates.length > 0 && (
          <span className="text-sm text-gray-500">
            Sorted by match score
          </span>
        )}
      </div>
      
      {candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Candidates will appear here when they apply to this job.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
            //   candidate={candidate}
              onViewProfile={() => handleViewCandidate(candidate.id)}
              showMatchScore
              showAppliedDate
            />
          ))}
        </div>
      )}
    </section>
  );
}