// components/jobs/JobCandidatesSection.tsx
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  EyeIcon,
  LightBulbIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Application, Candidate } from '@/types';

// interface Candidate {
//   application_id: number;
//   applicant_id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   location: {
//     city: string;
//     country: string;
//     address: string;
//   };
//   current_job_title: string;
//   applied_date: string;
//   match_score: number;
//   match_details: {
//     skills_matched: string[];
//     skills_missing: string[];
//     education_match: {
//       has_required_education: boolean;
//       preferred_courses: string[];
//     };
//     certificate_match: {
//       matched_certificates: string[];
//       missing_certificates: string[];
//     };
//     experience_match: object;
//     feedback: string[];
//   };
//   job_title: string;
//   company_name: string;
//   application_status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
//   cover_letter: string | null;
//   notes: string | null;
//   interview_date: string | null;
// }

interface JobCandidatesSectionProps {
  candidates: Application[];
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
    router.push(`/candidates/${candidateId}`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'REVIEWED': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHORTLISTED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'HIRED': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 20) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getLocationText = (location: Candidate['location']) => {
    if (location?.city && location?.country) {
      return `${location?.city}, ${location?.country}`;
    }
    return location?.city || location?.country || 'Location not specified';
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
            <p className="text-sm text-gray-600">
              {candidates.length} applicant{candidates.length !== 1 ? 's' : ''} for this position
            </p>
          </div>
        </div>
        
        {candidates.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <span>Sorted by match score</span>
          </div>
        )}
      </div>

      {/* Candidates Stats */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {candidates.filter(c => c.match_score >= 80).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Excellent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {candidates.filter(c => c.match_score >= 60 && c.match_score < 80).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Good</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {candidates.filter(c => c.match_score >= 40 && c.match_score < 60).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Fair</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {candidates.filter(c => c.match_score >= 20 && c.match_score < 40).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Poor</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {candidates.filter(c => c.status === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
        </div>
      )}
      
      {candidates?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates yet</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">
            Candidates will appear here when they apply to this position.
          </p>
          <div className="text-xs text-gray-500">
            Share this job to attract more applicants
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleViewCandidate(candidate.id)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Candidate Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {candidate.applicant_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {candidate.applicant_name} 
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatchScoreColor(candidate.match_score)}`}>
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        {candidate.match_score}% Match
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="font-medium">{candidate.company_name}</span>
                      <span className="mx-2">•</span>
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{getLocationText(candidate.applicant_details)}</span>
                    </div>

                    {/* Current Job Title */}
                    {candidate.job_title && (
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <BriefcaseIcon className="w-4 h-4 mr-1 text-gray-500" />
                        <span>{candidate.job_title}</span>
                      </div>
                    )}

                    {/* Skills Match Summary */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-3 h-3 mr-1 text-green-500" />
                        <span>{candidate.match_details.skills_matched.length} skills match</span>
                      </div>
                      {candidate.match_details.skills_missing.length > 0 && (
                        <div className="flex items-center">
                          <LightBulbIcon className="w-3 h-3 mr-1 text-orange-500" />
                          <span>{candidate.match_details.skills_missing.length} skills missing</span>
                        </div>
                      )}
                      {/* {!candidate.match_details.education_match.has_required_education && (
                        <div className="flex items-center">
                          <AcademicCapIcon className="w-3 h-3 mr-1 text-blue-500" />
                          <span>Education gap</span>
                        </div>
                      )} */}
                    </div>

                    {/* Skills Preview */}
                    {candidate.match_details.skills_matched.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.match_details.skills_matched.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.match_details.skills_matched.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                            +{candidate.match_details.skills_matched.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>Applied {getTimeAgo(candidate.applied_at)}</span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCandidate(candidate.id);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Profile
                  </button>
                </div>
              </div>

              {/* Quick Feedback Preview */}
              {candidate.match_details.feedback.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <LightBulbIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {candidate.match_details.feedback[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}