// components/find-work/JobDetail.tsx
import { Job } from '@/types';
import Button from '@/components/Button';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  TrophyIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import Link from 'next/link';

interface JobDetailProps {
  job: Job | null;
  onApply: (jobId: number) => void;
}

export default function JobDetail({ job, onApply }: JobDetailProps) {
  if (!job) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Job</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Choose a job from the list to view detailed information and requirements
          </p>
        </div>
      </div>
    );
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getExperienceLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'ENTRY': 'bg-green-100 text-green-800 border-green-200',
      'MID': 'bg-blue-100 text-blue-800 border-blue-200',
      'SENIOR': 'bg-purple-100 text-purple-800 border-purple-200',
      'LEAD': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWorkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'REMOTE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'HYBRID': 'bg-amber-100 text-amber-800 border-amber-200',
      'ONSITE': 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
      {/* Header with View Full Page Button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {job.company_name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h2>
            <div className="flex items-center text-gray-600 text-sm">
              <BuildingOfficeIcon className="w-4 h-4 mr-1" />
              <span className="font-medium">{job.company_name}</span>
            </div>
          </div>
        </div>
        
        {/* View Full Page Button */}
        <Link href={`/Myjobs/${job.id}`}>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 whitespace-nowrap"
            icon={<ArrowTopRightOnSquareIcon className="w-3 h-3" />}
          >
            View Full
          </Button>
        </Link>
      </div>

      {/* Job Type Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
          <BriefcaseIcon className="w-3 h-3 mr-1" />
          {job.experience_level_display}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getWorkTypeColor(job.work_type)}`}>
          {job.work_type_display}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <AcademicCapIcon className="w-3 h-3 mr-1" />
          {job.employment_type_display}
        </span>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
            <UserGroupIcon className="w-4 h-4 text-blue-600" />
            {job.applications_count || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Applied</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
            <ClockIcon className="w-4 h-4 text-orange-600" />
            {job.days_remaining || '∞'}
          </div>
          <div className="text-xs text-gray-600 mt-1">Days Left</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
            <CheckBadgeIcon className="w-4 h-4 text-green-600" />
            {job.skills_required?.length || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Skills</div>
        </div>
      </div>

      {/* Location and Time */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <MapPinIcon className="w-3 h-3 mr-1" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span>{getTimeAgo(job.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Salary */}
      {job.salary_range && job.salary_range !== "Salary not specified" && (
        <div className="mb-4">
          <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 text-center">
            {job.salary_range}
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="space-y-4">
        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <LightBulbIcon className="w-4 h-4 text-blue-600" />
            Description
          </h3>
          <div className="text-xs text-gray-700 leading-relaxed">
            {truncateDescription(job.description, 100)}
          </div>
          {job.description?.length > 100 && (
            <Link href={`/jobs/${job.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block">
              Read more
            </Link>
          )}
        </div>

        {/* Required Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <TrophyIcon className="w-4 h-4 text-orange-600" />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 6).map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-200"
                >
                  {skill.name}
                </span>
              ))}
              {job.skills_required.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                  +{job.skills_required.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Preferred Qualifications Preview */}
        {((job.courses_preferred || []).length > 0 || (job.certificates_preferred || []).length > 0) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <AcademicCapIcon className="w-4 h-4 text-purple-600" />
              Preferred Qualifications
            </h3>
            <div className="space-y-1.5">
              {(job.courses_preferred || []).slice(0, 2).map((degree) => (
                <div
                  key={degree.id}
                  className="flex items-center p-2 bg-green-50 border border-green-200 rounded text-xs"
                >
                  <AcademicCapIcon className="w-3 h-3 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">{degree.name}</span>
                </div>
              ))}
              {(job.certificates_preferred || []).slice(0, 2).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center p-2 bg-purple-50 border border-purple-200 rounded text-xs"
                >
                  <TrophyIcon className="w-3 h-3 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">{provider.name}</span>
                </div>
              ))}
              {((job.courses_preferred || []).length > 2 || (job.certificates_preferred || []).length > 2) && (
                <Link href={`/jobs/${job.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-block">
                  View all qualifications
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          size="md"
          onClick={() => onApply(job.id)}
          className="w-full py-2.5 font-semibold text-sm"
        >
          APPLY NOW
        </Button>
        <p className="text-center text-xs text-gray-500 mt-2">
          {job.applications_count || 0} people have applied
        </p>
      </div>
    </div>
  );
}