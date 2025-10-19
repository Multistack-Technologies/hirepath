import { Candidate } from '@/types';
import { formatDate } from '@/utils/dateFormatter';
import Link from 'next/link';
import Image from 'next/image';

interface CandidatesSectionProps {
  candidates: Candidate[];
  isLoading: boolean;
  jobId: number;
}

export default function CandidatesSection({ candidates, isLoading, jobId }: CandidatesSectionProps) {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading candidates...</p>;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Candidates</h2>
      {candidates.length === 0 ? (
        <p className="text-gray-700">No candidates have applied to this job yet.</p>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.applicant_id} candidate={candidate} jobId={jobId} />
          ))}
        </div>
      )}
    </section>
  );
}

function CandidateCard({ candidate, jobId }: { candidate: Candidate; jobId: number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex items-start">
        <Image
          height={40}
          width={40}
          src={candidate.avatarUrl || ''}
          alt={`${candidate.first_name} ${candidate.last_name}`}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <Link
                href={{
                  pathname: `/candidates/${candidate.applicant_id}`,
                  query: { jobId: jobId.toString() }
                }}
                className="font-bold text-gray-900 hover:text-indigo-600"
              >
                {candidate.first_name} {candidate.last_name}
              </Link>
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                <span>📍 {candidate.location}</span>
                <span>•</span>
                <span>{formatDate(candidate.applied_date)}</span>
                {candidate.match_score !== undefined && candidate.total_requirements !== undefined && (
                  <>
                    <span>•</span>
                    <span>Matches {candidate.match_score}/{candidate.total_requirements} requirement</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}