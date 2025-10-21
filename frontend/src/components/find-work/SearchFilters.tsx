// components/find-work/SearchFilters.tsx
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  sortOption: 'newest' | 'oldest';
  onSortChange: (option: 'newest' | 'oldest') => void;
  onClearFilters: () => void;
}

const SKILL_OPTIONS = [
  'UX Designer',
  'UI Designer',
  'Product Designer',
  'Visual Identity',
  'Frontend',
  'Backend',
  'Full Stack',
  'React',
  'Python',
  'JavaScript'
];

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedSkills,
  onToggleSkill,
  sortOption,
  onSortChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasActiveFilters = searchQuery || selectedSkills.length > 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by job title, company, or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder-gray-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Skills Filter */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-blue-600" />
            Filter by Skills
          </h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              onClick={() => onToggleSkill(skill)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                selectedSkills.includes(skill)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm transform scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        
        {selectedSkills.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
            <span className="text-sm text-gray-600 font-medium">
              {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {selectedSkills.map(skill => (
                <span 
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                >
                  {skill}
                  <button 
                    onClick={() => onToggleSkill(skill)}
                    className="hover:text-blue-900"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Header and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Jobs For You</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-sm">
            {hasActiveFilters ? 'Filtered' : 'Popular'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
              className="appearance-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-10 shadow-sm transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-semibold">Active filters:</span>
              {searchQuery && (
                <span className="bg-white px-2 py-1 rounded-lg border border-blue-200">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedSkills.length > 0 && (
                <span className="bg-white px-2 py-1 rounded-lg border border-blue-200">
                  {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}