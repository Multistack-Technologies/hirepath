// hooks/useSkillsSelection.ts
import { useState, useEffect } from 'react';
import { Skill } from '@/types';
import { skillsService } from '@/services/skillsService';

export const useSkillsSelection = (initialSkills: Skill[] = []) => {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(initialSkills);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const skills = await skillsService.getSkills();
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsSelected = (skills: Skill[]) => {
    setSelectedSkills(skills);
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
  };

  const getSkillsIds = (): number[] => {
    return selectedSkills.map(skill => skill.id);
  };

  return {
    availableSkills,
    selectedSkills,
    isLoading,
    handleSkillsSelected,
    handleClearSkills,
    getSkillsIds,
  };
};