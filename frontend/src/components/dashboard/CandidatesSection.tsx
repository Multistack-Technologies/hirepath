// components/dashboard/CandidatesSection.tsx
import { Candidate } from "@/types";
import CandidateCard from "@/components/CandidateCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CandidatesSectionProps {
  candidates: Candidate[];
  isLoading?: boolean;
}

export default function CandidatesSection({
  candidates,
  isLoading = false,
}: CandidatesSectionProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Top Candidates
          </h2>
          <Link
            href="/jobs"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All Jobs
          </Link>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-200 rounded-lg h-20"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Top Candidates</h2>
        <Link
          href="/jobs"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All Jobs
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No candidates yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Candidates will appear here when they apply to your jobs.
          </p>
          <div className="mt-6">
            <Link
              href="/jobs/post"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#D6CDFE] hover:bg-[#8168f1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Post a Job
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate: Candidate) => (
            // Usage in your page component - much cleaner!
            <CandidateCard
              key={candidate.application_id}
              candidate={candidate}
              onViewProfileClick={() =>
                router.push(`/candidates/${candidate.application_id}`)
              }
              onContactClick={() => window.open(`mailto:${candidate.email}`)}
              className="hover:border-blue-300 transition-colors duration-200"
              showJobInfo={true}
              showSkills={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
