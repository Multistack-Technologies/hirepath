// components/find-work/JobList.tsx
import { Job } from '@/types';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon,
  BriefcaseIcon,
  ClockIcon,
  HeartIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  onBookmark?: (jobId: number) => void;
  bookmarkedJobs?: number[];
}

export default function JobList({ 
  jobs, 
  selectedJob, 
  onSelectJob, 
  onBookmark,
  bookmarkedJobs = [] 
}: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Try adjusting your search filters or browse different categories
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobListItem
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          isBookmarked={bookmarkedJobs.includes(job.id)}
          onSelect={() => onSelectJob(job)}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}

interface JobListItemProps {
  job: Job;
  isSelected: boolean;
  isBookmarked: boolean;
  onSelect: () => void;
  onBookmark?: (jobId: number) => void;
}

function JobListItem({ job, isSelected, isBookmarked, onSelect, onBookmark }: JobListItemProps) {
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

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(job.id);
  };

  return (
    <div
      className={`bg-white rounded-xl border p-6 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:border-blue-300 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Company Logo - Gradient */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {job.company_name?.charAt(0) || 'C'}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Title and Salary on same line */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold truncate group-hover:text-blue-700 transition-colors ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {job.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <BuildingOfficeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="font-medium truncate">{job.company_name}</span>
                <span className="mx-2">•</span>
                <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            </div>
            
            {/* Salary Range */}
            {job.salary_range && job.salary_range !== "Salary not specified" && (
              <div className="flex-shrink-0 ml-4 text-right">
                <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200 whitespace-nowrap">
                  {job.salary_range}
                </div>
              </div>
            )}
          </div>

          {/* Work Type, Experience Level and Applications on same line */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Work Type Badge */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getWorkTypeColor(job.work_type)}`}>
                {job.work_type_display}
              </span>
              
              {/* Experience Level Badge */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
                <BriefcaseIcon className="w-3 h-3 mr-1" />
                {job.experience_level_display}
              </span>
            </div>

            {/* Applications Count */}
            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <UserGroupIcon className="w-3 h-3 mr-1" />
              {job.applications_count || 0} applied
            </div>
          </div>

          {/* Skills Preview */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.skills_required.slice(0, 4).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {skill.name}
                </span>
              ))}
              {job.skills_required.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  +{job.skills_required.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Footer with Time and Days Remaining */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{getTimeAgo(job.created_at)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>{job.days_remaining || '∞'} days left</span>
              </div>
            </div>

            {/* Bookmark Button */}
            {onBookmark && (
              <button
                onClick={handleBookmarkClick}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HeartIcon 
                  className={`w-4 h-4 ${
                    isBookmarked 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400 hover:text-red-400'
                  }`} 
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}