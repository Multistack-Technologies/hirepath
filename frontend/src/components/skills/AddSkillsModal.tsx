// components/skills/AddSkillsModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { Skill } from '@/types';
import api from '@/lib/api';

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillsAdded: (skills: Skill[]) => void;
  existingSkills: Skill[];
}

export default function AddSkillsModal({ 
  isOpen, 
  onClose, 
  onSkillsAdded,
  existingSkills = [] 
}: AddSkillsModalProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(existingSkills);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addingSkill, setAddingSkill] = useState<number | null>(null);

  // Fetch available skills
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSkills();
      setSelectedSkills(existingSkills);
    }
  }, [isOpen, existingSkills]);

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


  // Bulk save all selected skills
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSkillsAdded(selectedSkills);
      onClose();
    } catch (error) {
      console.error('Failed to save skills:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSkills.some(s => s.id === skill.id) // Don't show already selected skills
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Skills"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Selected Skills Preview */}
        {selectedSkills.length > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Your Skills ({selectedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
                >
                  {skill.name}
                  <span className="ml-1 text-green-600">✓</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Skills */}
        <div className="flex-1 overflow-y-auto max-h-60">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Available Skills
          </h4>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading skills...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between"
                >
                
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && filteredSkills.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <p>No skills found matching "{searchQuery}"</p>
            </div>
          )}
          
          {!isLoading && filteredSkills.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <p>No more skills available to add</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSaving || selectedSkills.length === 0}
          >
            {isSaving ? 'Saving...' : `Save ${selectedSkills.length} Skills`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}