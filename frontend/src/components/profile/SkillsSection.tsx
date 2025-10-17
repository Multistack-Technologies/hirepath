// components/profile/SkillsSection.tsx
import { useState, useEffect } from 'react';
import { Skill } from '@/types';
import Button from '@/components/Button';
import AddSkillsModal from '@/components/skills/AddSkillsModal';
import api from '@/lib/api';
import { AiFillSafetyCertificate } from "react-icons/ai";

interface SkillsSectionProps {
  onSkillsUpdate?: (skills: Skill[]) => void;
}

export default function SkillsSection({ onSkillsUpdate }: SkillsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's current skills
  const fetchUserSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Skill[]>('/accounts/skills/');
      setSkills(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch user skills:', error);
      setError(error.response?.data?.error || 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skills update from modal
  const handleSkillsAdded = (newSkills: Skill[]) => {
    setSkills(newSkills);
    onSkillsUpdate?.(newSkills);
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">Skills</h2>
          <Button variant="secondary" size="md" disabled>
            Loading...
          </Button>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
           <div className="text-xl font-semibold text-purple-700 flex space-x-1 items-center">    <AiFillSafetyCertificate  className="w-6 h-6" />
          <h2>Skills</h2></div>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => setIsModalOpen(true)}
          >
            + ADD SKILLS
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchUserSkills}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
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
        
        {skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {skills.length} skill{skills.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </div>

      <AddSkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSkillsAdded={handleSkillsAdded}
        existingSkills={skills}
      />
    </>
  );
}