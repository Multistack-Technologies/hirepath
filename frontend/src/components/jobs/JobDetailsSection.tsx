// components/jobs/JobDetailsSection.tsx
import { Job } from '@/types';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";

interface JobDetailsSectionProps {
  job: Job | null;
  isLoading?: boolean;
}

export default function JobDetailsSection({ job, isLoading = false }: JobDetailsSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BriefcaseIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
        <p className="text-gray-600 text-sm">
          The job you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
        Closed
      </span>
    );
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {job.company_name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              {getStatusBadge(job.is_active)}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <BuildingOfficeIcon className="w-4 h-4 mr-1" />
              <span className="font-medium">{job.company_name}</span>
              <span className="mx-2">•</span>
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{job.location}</span>
            </div>
            
            {/* Job Type Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getWorkTypeColor(job.work_type)}`}>
                {job.work_type_display}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
                <BriefcaseIcon className="w-3 h-3 mr-1.5" />
                {job.experience_level_display}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <AcademicCapIcon className="w-3 h-3 mr-1.5" />
                {job.employment_type_display}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            {job.applications_count || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Applications</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
            <ClockIcon className="w-5 h-5 text-orange-600" />
            {job.days_remaining || '∞'}
          </div>
          <div className="text-xs text-gray-600 mt-1">Days Left</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
            <TrophyIcon className="w-5 h-5 text-green-600" />
            {job.skills_required?.length || 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">Skills Required</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            {getTimeAgo(job.created_at)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Posted</div>
        </div>
      </div>

      {/* Salary */}
      {job.salary_range && job.salary_range !== "Salary not specified" && (
        <div className="mb-6">
          <div className="text-lg font-bold text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200 text-center">
            {job.salary_range}
          </div>
        </div>
      )}

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-blue-600" />
              Work Type
            </h3>
            <p className="text-gray-700">{job.work_type_display}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-purple-600" />
              Employment Type
            </h3>
            <p className="text-gray-700">{job.employment_type_display}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-orange-600" />
              Experience Level
            </h3>
            <p className="text-gray-700">{job.experience_level_display}</p>
          </div>
          {job.closing_date && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-red-600" />
                Closing Date
              </h3>
              <p className="text-gray-700">
                {new Date(job.closing_date).toLocaleDateString()}
                {job.days_remaining !== null && (
                  <span className="text-orange-600 ml-2">
                    ({job.days_remaining} days remaining)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-blue-600" />
          Job Description
        </h3>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {job.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3 text-gray-700 text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-orange-600" />
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_required.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg text-sm font-semibold border border-blue-200 shadow-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preferred Qualifications */}
      {((job.courses_preferred || []).length > 0 || (job.certificates_preferred || []).length > 0) && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-purple-600" />
            Preferred Qualifications
          </h3>

          {(job.courses_preferred || []).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Preferred Degrees</h4>
              <div className="grid gap-3">
                {(job.courses_preferred || []).map((degree) => (
                  <div
                    key={degree.id}
                    className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <AcademicCapIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-green-800 text-sm">
                        {degree.name}
                      </div>
                      {degree.issuer_name && (
                        <div className="text-xs text-green-600">
                          {degree.issuer_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(job.certificates_preferred || []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Preferred Certifications</h4>
              <div className="grid gap-3">
                {(job.certificates_preferred || []).map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <TrophyIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-800 text-sm">
                        {provider.name}
                      </div>
                      {provider.description && (
                        <div className="text-xs text-purple-600">
                          {provider.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}