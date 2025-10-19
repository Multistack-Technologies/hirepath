// components/find-work/SearchFilters.tsx
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
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by job title, company, or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      {/* Skills Filter */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Skills</h3>
        <div className="flex flex-wrap gap-3">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              onClick={() => onToggleSkill(skill)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSkills.includes(skill)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        
        {hasActiveFilters && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-200">
            <span className="text-sm text-gray-600">
              {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Sort and Info Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold text-gray-900">Jobs For You</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Popular
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}