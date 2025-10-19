// components/jobs/JobSkillsSelector.tsx
import { useState, useEffect } from 'react';
import { Skill } from '@/types';
import api from '@/lib/api';

interface JobSkillsSelectorProps {
  selectedSkills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  maxSkills?: number;
}

export default function JobSkillsSelector({ 
  selectedSkills, 
  onSkillsChange,
  maxSkills = 10 
}: JobSkillsSelectorProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch available skills
  useEffect(() => {
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Skill[]>('/skills/');
      setAvailableSkills(response.data || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: Skill) => {
    const isSelected = selectedSkills.some(s => s.id === skill.id);
    
    if (isSelected) {
      // Remove skill
      onSkillsChange(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      // Add skill (check max limit)
      if (selectedSkills.length >= maxSkills) {
        alert(`Maximum ${maxSkills} skills allowed`);
        return;
      }
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    onSkillsChange(selectedSkills.filter(s => s.id !== skillId));
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomSkill = () => {
    if (searchQuery.trim() && selectedSkills.length < maxSkills) {
      // Check if skill already exists
      const existingSkill = availableSkills.find(
        skill => skill.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );

      if (existingSkill) {
        // Add existing skill
        if (!selectedSkills.some(s => s.id === existingSkill.id)) {
          onSkillsChange([...selectedSkills, existingSkill]);
        }
      } else {
        // Create a temporary skill object (will be saved when job is posted)
        const newSkill: Skill = {
          id: Date.now(), // Temporary ID
          name: searchQuery.trim()
        };
        onSkillsChange([...selectedSkills, newSkill]);
      }
      
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Skills Display */}
      <div>
        <label className="block text-sm font-semibold text-[#130160] mb-2">
          Required Skills ({selectedSkills.length}/{maxSkills})
        </label>
        
        {/* Selected Skills Tags */}
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-lg leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3">
            No skills selected. Add skills that are required for this position.
          </p>
        )}

        {/* Skills Selection Interface */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          {/* Search and Add */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search or add skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              disabled={!searchQuery.trim() || selectedSkills.length >= maxSkills}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>

          {/* Skills Dropdown */}
          {isOpen && (
            <div className="border border-gray-200 rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading skills...</span>
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No skills found. Type to search or add a new skill.
                </div>
              ) : (
                <div className="py-1">
                  {filteredSkills.slice(0, 20).map((skill) => {
                    const isSelected = selectedSkills.some(s => s.id === skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        disabled={!isSelected && selectedSkills.length >= maxSkills}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-800'
                            : 'hover:bg-gray-50 text-gray-700'
                        } ${!isSelected && selectedSkills.length >= maxSkills ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{skill.name}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Skill Suggestions */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Popular skills:</p>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript', 'HTML', 'CSS', 'SQL'].map((skill) => {
                const skillObj = availableSkills.find(s => s.name === skill) || { id: skill, name: skill };
                const isSelected = selectedSkills.some(s => s.name === skill);
                
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skillObj as Skill)}
                    disabled={!isSelected && selectedSkills.length >= maxSkills}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    } ${!isSelected && selectedSkills.length >= maxSkills ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-2">
          Select up to {maxSkills} key skills required for this position. This helps match with qualified candidates.
        </p>
      </div>
    </div>
  );
}