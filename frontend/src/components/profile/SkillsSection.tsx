// components/profile/SkillsSection.tsx
import { useState, useEffect } from 'react';
import { Skill } from '@/types';
import Button from '@/components/Button';
import AddSkillsModal from '@/components/skills/AddSkillsModal';

interface SkillsSectionProps {
  skills: Skill[];
  onSkillsUpdate?: (skills: Skill[]) => void;
}

export default function SkillsSection({ 
  skills = [], 
  onSkillsUpdate 
}: SkillsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);

  // Sync local skills with props
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const handleSkillsAdded = (newSkills: Skill[]) => {
    setLocalSkills(newSkills);
    onSkillsUpdate?.(newSkills);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">Skills</h2>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => setIsModalOpen(true)}
          >
            + ADD SKILLS
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {localSkills.length > 0 ? (
            localSkills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <div className="text-center w-full py-4">
              <p className="text-sm text-gray-500 mb-2">No skills added yet.</p>
              <p className="text-xs text-gray-400">
                Add skills to improve your job matches.
              </p>
            </div>
          )}
        </div>
        
        {localSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {localSkills.length} skill{localSkills.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </div>

      <AddSkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSkillsAdded={handleSkillsAdded}
        existingSkills={localSkills}
      />
    </>
  );
}