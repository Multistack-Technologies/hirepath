// components/jobs/JobSearchFilters.tsx
import { JobFilters } from '@/types';

interface JobSearchFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: Partial<JobFilters>) => void;
  onClearFilters: () => void;
}

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const WORK_TYPES = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
];

export default function JobSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: JobSearchFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Jobs
          </label>
          <input
            type="text"
            placeholder="Search by title, company, or skills..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter location..."
            value={filters.location || ''}
            onChange={(e) => onFiltersChange({ location: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type
          </label>
          <div className="space-y-2">
            {EMPLOYMENT_TYPES.map(type => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.employment_type?.includes(type.value) || false}
                  onChange={(e) => {
                    const currentTypes = filters.employment_type || [];
                    const newTypes = e.target.checked
                      ? [...currentTypes, type.value]
                      : currentTypes.filter(t => t !== type.value);
                    onFiltersChange({ employment_type: newTypes });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Type
          </label>
          <div className="space-y-2">
            {WORK_TYPES.map(type => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.work_type?.includes(type.value) || false}
                  onChange={(e) => {
                    const currentTypes = filters.work_type || [];
                    const newTypes = e.target.checked
                      ? [...currentTypes, type.value]
                      : currentTypes.filter(t => t !== type.value);
                    onFiltersChange({ work_type: newTypes });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map(level => (
              <label key={level.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.experience_level?.includes(level.value) || false}
                  onChange={(e) => {
                    const currentLevels = filters.experience_level || [];
                    const newLevels = e.target.checked
                      ? [...currentLevels, level.value]
                      : currentLevels.filter(l => l !== level.value);
                    onFiltersChange({ experience_level: newLevels });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Salary ($)
            </label>
            <input
              type="number"
              placeholder="Min"
              value={filters.min_salary || ''}
              onChange={(e) => onFiltersChange({ min_salary: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Salary ($)
            </label>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_salary || ''}
              onChange={(e) => onFiltersChange({ max_salary: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}