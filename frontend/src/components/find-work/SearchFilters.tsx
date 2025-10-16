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
  return (
    <section className="w-full mb-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Category, Company or ..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="border border-amber-400 p-4 rounded-lg mb-4">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                onClick={() => onToggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500">Jobs For You</span>
          <span className="ml-2 text-xs text-blue-600 font-medium">Popular</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
    </section>
  );
}