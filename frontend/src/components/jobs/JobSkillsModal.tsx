// components/jobs/JobSkillsModal.tsx (updated)
import { useState } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { Skill } from '@/types';

interface JobSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillsSelected: (skills: Skill[]) => void;
  existingSkills?: Skill[];
  availableSkills: Skill[];
  isLoading: boolean;
}

export default function JobSkillsModal({ 
  isOpen, 
  onClose, 
  onSkillsSelected,
  existingSkills = [],
  availableSkills,
  isLoading
}: JobSkillsModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(existingSkills);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills(prev => {
      const isSelected = prev.some(s => s.id === skill.id);
      if (isSelected) {
        return prev.filter(s => s.id !== skill.id);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleSave = () => {
    onSkillsSelected(selectedSkills);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedSkills([]);
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Required Skills"
      size="lg"
    >
      <div className="p-6 space-y-4">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Skills Grid */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading skills...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkills.some(s => s.id === skill.id);
                
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
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
          
          {!isLoading && filteredSkills.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No skills found matching your search.</p>
            </div>
          )}
        </div>

        {/* Selected Skills Preview */}
        {selectedSkills.length > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Selected Skills ({selectedSkills.length})
              </h4>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center flex-shrink-0"
                >
                  {skill.name}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Add Selected Skills
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}