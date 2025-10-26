import Link from 'next/link';

interface JobMatch {
  job_role: {
    id: number;
    title: string;
    category: string;
    category_display: string;
    description: string;
    is_in_demand: boolean;
    remote_friendly: boolean;
  };
  match_score: number;
  match_strength: string;
  matching_skills: string[];
  missing_skills: string[];
  total_skills_required: number;
  skills_match_percentage: number;
  certificate_recommendations?: Array<any>;
}

interface JobAnalysisSectionProps {
  jobMatches?: JobMatch[];
}

export default function JobAnalysisSection({ jobMatches = [] }: JobAnalysisSectionProps) {
  const getMatchColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-purple-700">Job Role Recommendations</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {jobMatches.length} matches
        </span>
      </div>
      
      {jobMatches.length > 0 ? (
        <div className="space-y-4">
          {jobMatches.slice(0, 5).map((job, index) => (
            <div 
              key={job.job_role.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{job.job_role.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{job.job_role.category_display}</p>
                  {job.job_role.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.job_role.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(job.match_score)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${getStrengthColor(job.match_strength)}`}></span>
                    {job.match_score}% match
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {job.matching_skills.length}/{job.total_skills_required} skills
                  </div>
                </div>
              </div>

              {/* Skills Match */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Skills match:</span>
                  <span>{job.skills_match_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStrengthColor(job.match_strength)}`}
                    style={{ width: `${job.skills_match_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Job Features */}
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                {job.job_role.is_in_demand && (
                  <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    In Demand
                  </span>
                )}
                {job.job_role.remote_friendly && (
                  <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    Remote Friendly
                  </span>
                )}
              </div>

              {/* Certificate Recommendations */}
              {job.certificate_recommendations && job.certificate_recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Recommended Certificates:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.certificate_recommendations.slice(0, 2).map((cert, certIndex) => (
                      <span 
                        key={certIndex}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200"
                        title={cert.certificate_name}
                      >
                        {cert.certificate_name}
                      </span>
                    ))}
                    {job.certificate_recommendations.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{job.certificate_recommendations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
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
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center"
          >
            View all {jobMatches.length} job recommendations
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}