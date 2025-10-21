// components/JobCard.tsx (Enhanced)
import { Job } from '@/types';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface JobCardProps {
  job: Job;
  onApplyClick: () => void;
  onViewClick?: () => void;
  showApplyButton?: boolean;
}

export default function JobCardGraduate({ 
  job, 
  onApplyClick, 
  onViewClick,
  showApplyButton = false 
}: JobCardProps) {
  const formatSalary = () => {
    if (!job.min_salary && !job.max_salary) return 'Salary not specified';
    
    if (job.min_salary && job.max_salary) {
      return `R ${job.min_salary.toLocaleString()} - R ${job.max_salary.toLocaleString()}/year`;
    } else if (job.min_salary) {
      return `From R ${job.min_salary.toLocaleString()}/year`;
    } else if (job.max_salary) {
      return `Up to R ${job.max_salary.toLocaleString()}/year`;
    }
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

  const formatDaysRemaining = (days: number | null) => {
    if (days === null) return 'No deadline';
    if (days === 0) return 'Last day today';
    if (days === 1) return '1 day left';
    if (days < 7) return `${days} days left`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  };

  const getUrgencyColor = (days: number | null) => {
    if (days === null) return 'text-gray-500';
    if (days === 0) return 'text-red-600 font-semibold';
    if (days < 3) return 'text-red-500';
    if (days < 7) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-200 group">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          {job.company_logo ? (
            <div className="flex-shrink-0">
              <img 
                src={job.company_logo} 
                alt={`${job.company_name} logo`}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center border border-gray-200">
              <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <BuildingOfficeIcon className="w-4 h-4 mr-1" />
              <span className="font-medium truncate">{job.company_name}</span>
            </div>
          </div>
        </div>

        {/* Applications Badge */}
        {job.applications_count > 0 && (
          <div className="flex-shrink-0 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200">
            {job.applications_count} application{job.applications_count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Location and Details */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span>{job.location}</span>
        </div>
        
        {job.closing_date && (
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span className={getUrgencyColor(job.days_remaining)}>
              {formatDaysRemaining(job.days_remaining)}
            </span>
          </div>
        )}
      </div>

      {/* Skills Preview */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills_required.slice(0, 4).map((skill) => (
              <span 
                key={skill.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
              >
                {skill.name}
              </span>
            ))}
            {job.skills_required.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{job.skills_required.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Type Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
          <BriefcaseIcon className="w-3 h-3 mr-1" />
          {job.experience_level_display}
        </span>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getWorkTypeColor(job.work_type)}`}>
          {job.work_type_display}
        </span>
        
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <AcademicCapIcon className="w-3 h-3 mr-1" />
          {job.employment_type_display}
        </span>
      </div>

      {/* Salary and CTA Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="text-sm font-semibold text-gray-900">
            {formatSalary()}
          </div>
          
          {job.skills_count! > 0 && (
            <div className="text-xs text-gray-500 flex items-center">
              <CheckBadgeIcon className="w-3 h-3 mr-1" />
              {job.skills_count} skill{job.skills_count !== 1 ? 's' : ''} required
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          {onViewClick && (
            <button
              onClick={onViewClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
            >
              View Details
            </button>
          )}
          {showApplyButton && (
            <button
              onClick={onApplyClick}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        {job.is_active ? (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-red-600 font-medium">Closed</span>
          </div>
        )}
      </div>
    </div>
  );
}