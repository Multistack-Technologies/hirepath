// src/components/CandidateCard.tsx
import { Candidate } from '@/types';
import Button from './Button';
import {
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  EyeIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";


interface CandidateCardProps {
  candidate: Candidate;
  onViewProfileClick?: () => void;
  onContactClick?: () => void;
  className?: string;
  showJobInfo?: boolean;
  showSkills?: boolean;
}

export default function CandidateCard({
  candidate,
  onViewProfileClick,
  onContactClick,
  className = '',
  showJobInfo = true,
  showSkills = true,
}: CandidateCardProps) {
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
      return `${location.city}, ${location.country}`;
    }
    return location?.city || location?.country || 'Location not specified';
  };

  const getNameInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onViewProfileClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Section - Candidate Info */}
        <div className="flex items-start space-x-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {getNameInitials(candidate.first_name, candidate.last_name)}
          </div>

          {/* Candidate Details */}
          <div className="flex-1 min-w-0">
            {/* Name and Match Score */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {getFullName(candidate.first_name, candidate.last_name)}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatchScoreColor(candidate.match_score)}`}>
                <SparklesIcon className="w-3 h-3 mr-1" />
                {candidate.match_score}% Match
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(candidate.application_status)}`}>
                {candidate.application_status}
              </span>
            </div>

            {/* Email and Location */}
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span>{candidate.email}</span>
              <span className="mx-3 text-gray-300">•</span>
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{getLocationText(candidate.location)}</span>
            </div>

            {/* Current Job Title */}
            {candidate.current_job_title && (
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span>{candidate.current_job_title}</span>
              </div>
            )}

            {/* Job Application Info */}
            {showJobInfo && candidate.job_title && (
              <div className="flex items-center text-sm text-gray-700 mb-3">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">{candidate.job_title}</span>
                {candidate.company_name && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{candidate.company_name}</span>
                  </>
                )}
              </div>
            )}

            {/* Application Date */}
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span>Applied {getTimeAgo(candidate.applied_date)}</span>
            </div>

            {/* Skills Preview */}
            {showSkills && candidate.match_details?.skills_matched && candidate.match_details.skills_matched.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {candidate.match_details.skills_matched.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200"
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

        {/* Right Section - Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick?.();
              }}
              icon={<EnvelopeIcon className="w-3 h-3" />}
            >
              Contact
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfileClick?.();
              }}
              icon={<EyeIcon className="w-3 h-3" />}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}