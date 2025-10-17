// components/analysis/JobAnalysisSection.tsx
import Link from 'next/link';

interface JobMatch {
  id: number;
  title: string;
  company: string;
  match_score: number;
}

interface JobAnalysisSectionProps {
  jobMatches?: JobMatch[];
}

export default function JobAnalysisSection({ jobMatches = [] }: JobAnalysisSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Job Analysis</h2>
      <p className="text-sm text-gray-700 mb-4">
        Our analysis matches you to these jobs based on your skills and experience:
      </p>
      
      {jobMatches.length > 0 ? (
        <div className="space-y-3">
          {jobMatches.slice(0, 5).map((job) => (
            <Link 
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-indigo-900">{job.title}</h3>
                  <p className="text-sm text-indigo-700">{job.company}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    {job.match_score}% match
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
          <p>No job matches found yet.</p>
          <p className="text-sm mt-1">Upload your resume to get personalized job matches.</p>
        </div>
      )}
      
      {jobMatches.length > 5 && (
        <div className="mt-4 text-center">
          <Link 
            href="/jobs" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all {jobMatches.length} job matches →
          </Link>
        </div>
      )}
    </div>
  );
}